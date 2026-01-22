const Task = require('../models/Task');
const Robot = require('../models/Robot');
const Map = require('../models/Map');
const OperationLog = require('../models/OperationLog');
const { v4: uuidv4 } = require('uuid');
const obstacleService = require('../services/obstacleService');

// 1. 新增巡检任务
exports.createTask = async (req, res) => {
  try {
    const { robotId, mapId, startPoint, endPoint, mode, priority, type } = req.body;
    const userId = req.user.id;

    // 验证机器人和地图是否存在
    const [robot, map] = await Promise.all([
      Robot.findByPk(robotId),
      Map.findByPk(mapId)
    ]);
    if (!robot || !map) {
      return res.status(404).json({ code: 404, message: '机器人或地图不存在' });
    }

    // 路径规划（含避障）
    const mapData = {
      boundaryPoints: JSON.parse(map.boundary_points),
      obstaclePoints: JSON.parse(map.obstacle_points)
    };
    const pathPoints = obstacleService.planPath(mapData, startPoint, endPoint, mode);

    // 创建任务
    const task = await Task.create({
      task_no: `TASK${uuidv4().slice(0, 8).toUpperCase()}`,
      name: `${type === 'routine' ? '例行' : type === 'emergency' ? '紧急' : '定点'}巡检_${new Date().toLocaleDateString()}`,
      user_id: userId,
      robot_id: robotId,
      map_id: mapId,
      start_point: JSON.stringify(startPoint),
      end_point: JSON.stringify(endPoint),
      path_points: JSON.stringify(pathPoints),
      mode,
      priority,
      type
    });

    // 记录日志
    await OperationLog.create({
      operator_id: userId,
      operation: 'create_task',
      detail: `创建巡检任务${task.task_no}`,
      ip: req.ip
    });

    res.status(201).json({ code: 200, message: '任务创建成功', data: { task, pathPoints } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '任务创建失败', error: err.message });
  }
};

// 2. 启动巡检任务
exports.startTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ code: 404, message: '任务不存在' });
    if (task.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '任务状态不允许启动' });
    }

    // 验证机器人是否在线
    const robot = await Robot.findByPk(task.robot_id);
    if (robot.status !== 'online') {
      return res.status(400).json({ code: 400, message: '机器人未在线' });
    }

    // 更新任务状态
    task.status = 'running';
    await task.save();

    // 向机器人下发任务指令（路径+模式）
    const command = `START_TASK:${task.id}:${task.path_points}:${task.mode}`;
    await require('../services/bluetoothService').sendRobotCommand(robot.bluetooth_id, command);

    // 记录日志
    await OperationLog.create({
      operator_id: userId,
      operation: 'start_task',
      detail: `启动巡检任务${task.task_no}`,
      ip: req.ip
    });

    res.status(200).json({ code: 200, message: '任务启动成功', data: { task } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '任务启动失败', error: err.message });
  }
};

// 3. 获取任务列表
exports.getTaskList = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Robot, attributes: ['robot_no', 'name', 'status'] },
        { model: Map, attributes: ['name', 'type'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ code: 200, data: { tasks } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取任务列表失败', error: err.message });
  }
};