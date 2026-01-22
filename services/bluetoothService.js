const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Robot = require('../models/Robot');
const { io } = require('../server');

// 已连接的蓝牙设备（key：蓝牙ID，value：SerialPort实例）
const connectedDevices = new Map();

// 1. 扫描蓝牙设备（Web Bluetooth API对接）
exports.scanBluetoothDevices = async () => {
  return new Promise((resolve, reject) => {
    // 浏览器端通过Web Bluetooth API扫描，后端返回模拟数据（真实环境需硬件对接）
    if (navigator?.bluetooth) {
      navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
      }).then(device => {
        resolve([{ id: device.id, name: device.name || '未知机器人', bluetoothId: device.id }]);
      }).catch(err => reject(err));
    } else {
      // 模拟扫描结果（开发环境用）
      setTimeout(() => {
        resolve([
          { id: 'dev1', name: '巡检机器人-001', bluetoothId: 'BT-001' },
          { id: 'dev2', name: '巡检机器人-002', bluetoothId: 'BT-002' }
        ]);
      }, 1000);
    }
  });
};

// 2. 连接蓝牙设备
exports.connectBluetoothDevice = async (bluetoothId, robotId) => {
  return new Promise((resolve, reject) => {
    // 配置串口参数（波特率9600，硬件需匹配）
    const port = new SerialPort({
      path: process.platform === 'win32' ? 'COM3' : '/dev/tty.usbmodem14101',
      baudRate: 9600,
      autoOpen: false
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // 打开串口
    port.open(err => {
      if (err) return reject(new Error(`串口打开失败：${err.message}`));
      
      // 存储连接
      connectedDevices.set(bluetoothId, { port, parser });
      
      // 更新机器人状态为在线
      Robot.update({ status: 'online', bluetooth_id: bluetoothId }, { where: { id: robotId } });
      
      // 监听设备数据（定位/电量/障碍物）
      parser.on('data', data => handleDeviceData(bluetoothId, data));
      
      resolve({ status: 'connected' });
    });
  });
};

// 3. 处理机器人返回数据（定位/障碍物等）
const handleDeviceData = async (bluetoothId, data) => {
  try {
    // 数据格式示例：POS:116.3975,39.9087;BAT:85;OBSTACLE:116.3980,39.9090
    const dataMap = {};
    data.split(';').forEach(item => {
      const [key, value] = item.split(':');
      if (key && value) dataMap[key] = value;
    });

    // 更新定位
    if (dataMap.POS) {
      const [x, y] = dataMap.POS.split(',').map(Number);
      await Robot.update(
        { last_position_x: x, last_position_y: y },
        { where: { bluetooth_id: bluetoothId } }
      );
      // 推送定位更新到前端
      io.emit('location_update', { bluetoothId, position: { x, y } });
    }

    // 障碍物告警
    if (dataMap.OBSTACLE) {
      const [x, y] = dataMap.OBSTACLE.split(',').map(Number);
      io.emit('obstacle_alert', { bluetoothId, position: { x, y }, time: new Date().toLocaleString() });
    }
  } catch (err) {
    console.error('处理设备数据失败：', err);
  }
};

// 4. 下发控制指令（前进/避障等）
exports.sendRobotCommand = async (bluetoothId, command) => {
  return new Promise((resolve, reject) => {
    const device = connectedDevices.get(bluetoothId);
    if (!device || !device.port.isOpen) {
      return reject(new Error('蓝牙设备未连接'));
    }

    // 指令协议映射（硬件需匹配）
    const commandMap = {
      forward: 'MOVE:FWD',
      backward: 'MOVE:BWD',
      left: 'MOVE:LEFT',
      right: 'MOVE:RIGHT',
      stop: 'MOVE:STOP',
      scan: 'SCAN:START', // 环境扫描
      avoid: 'AVOID:START' // 避障启动
    };

    const sendCmd = commandMap[command] || command;
    device.port.write(`${sendCmd}\n`, err => {
      if (err) reject(err);
      else resolve({ message: '指令发送成功' });
    });
  });
};