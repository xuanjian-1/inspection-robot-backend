const Task = require('../models/Task');
const Robot = require('../models/Robot');
const { io } = require('../server');

// 任务分配（多机器人负载均衡）
exports.assignTasks = async (tasks, robotIds) => {
  try {
    // 获取机器人当前负载（任务数量）
    const robotLoads = await Promise.all(
      robotIds.map(async (robotId) => {
        const taskCount = await Task.count({
          where: { robot_id: robotId, status: ['pending', 'running'] }
        });
        return { robotId, load: taskCount };
      })
    );

    // 按负载排序，分配任务
    robotLoads.sort((a, b) => a.load - b.load);
    const assignedTasks = tasks.map((task, index) => {
      const robotId = robotLoads[index % robotLoads.length].robotId;
      return { ...task, robot_id: robotId };
    });

    // 批量创建任务
    await Task.bulkCreate(assignedTasks);

    // 推送任务分配通知
    io.emit('task_assigned', { assignedTasks });

    return assignedTasks;
  } catch (err) {
    throw new Error(`多机任务分配失败：${err.message}`);
  }
};

// 多机器人路径协调（避免冲突）
exports.coordinatePaths = async (robotIds) => {
  try {
    // 获取所有机器人的运行任务
    const tasks = await Task.findAll({
      where: { robot_id: robotIds, status: 'running' },
      include: [{ model: Map, attributes: ['boundary_points', 'obstacle_points'] }]
    });

    // 简化协调逻辑：同一区域机器人路径错开5米
    const coordinatedTasks = tasks.map((task, index) => {
      const pathPoints = JSON.parse(task.path_points);
      // 路径偏移（x轴偏移index*0.00005度≈5米）
      const offsetPath = pathPoints.map(point => ({
        lng: point.lng + index * 0.00005,
        lat: point.lat
      }));
      return { ...task, path_points: JSON.stringify(offsetPath) };
    });

    // 更新任务路径
    await Promise.all(
      coordinatedTasks.map(task => 
        Task.update({ path_points: task.path_points }, { where: { id: task.id } })
      )
    );

    return coordinatedTasks;
  } catch (err) {
    throw new Error(`路径协调失败：${err.message}`);
  }
};