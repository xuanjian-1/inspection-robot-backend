const Robot = require('../models/Robot');
const OperationLog = require('../models/OperationLog');

// 1. 获取机器人实时定位
exports.getRobotLocation = async (req, res) => {
  try {
    const { robotId } = req.params;
    const robot = await Robot.findByPk(robotId, {
      attributes: ['id', 'robot_no', 'last_position_x', 'last_position_y', 'status', 'battery']
    });
    
    if (!robot) {
      return res.status(404).json({ code: 404, message: '机器人不存在' });
    }
    
    res.status(200).json({
      code: 200,
      data: {
        robotId: robot.id,
        robotNo: robot.robot_no,
        position: {
          x: robot.last_position_x,
          y: robot.last_position_y
        },
        status: robot.status,
        battery: robot.battery,
        updateTime: new Date().toLocaleString()
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取定位失败', error: err.message });
  }
};

// 2. 获取历史轨迹
exports.getHistoryTrack = async (req, res) => {
  try {
    const { robotId, startTime, endTime } = req.query;
    // 实际项目需关联轨迹表，此处简化返回模拟数据
    const track = [
      { time: '09:00:00', position: { x: 116.3975, y: 39.9087 } },
      { time: '09:01:00', position: { x: 116.3985, y: 39.9092 } },
      { time: '09:02:00', position: { x: 116.3995, y: 39.9097 } }
    ];
    
    res.status(200).json({ code: 200, data: { track } });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取历史轨迹失败', error: err.message });
  }
};