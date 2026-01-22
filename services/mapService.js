const AMapLoader = require('@amap/jsapi-loader');
const THREE = require('three');
const { AMAP_KEY } = process.env;

// 1. 初始化高德2D地图
exports.initAmap = async (containerId) => {
  await AMapLoader.load({
    key: AMAP_KEY,
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.ToolBar'] // 地图控件
  });

  const map = new AMap.Map(containerId, {
    zoom: 16,
    center: [116.3975, 39.9087], // 默认中心点（北京）
    resizeEnable: true
  });

  // 添加控件
  map.addControl(new AMap.Scale());
  map.addControl(new AMap.ToolBar({ position: 'RB' }));

  return map;
};

// 2. 环境扫描生成2D/3D地图数据
exports.generateMapData = async (scanData) => {
  const { boundaryPoints, obstaclePoints } = scanData;

  // 2D坐标转换为3D坐标（校准逻辑）
  const threeDBoundary = boundaryPoints.map(point => {
    const origin = new THREE.Vector3(116.3975, 39.9087, 0); // 参考原点
    const scale = 1000; // 1度经纬度 = 1000单位3D距离
    return {
      x: (point.lng - origin.x) * scale,
      y: (point.lat - origin.y) * scale,
      z: 0 // 地面高度
    };
  });

  return { boundaryPoints, obstaclePoints, threeDBoundary };
};

// 3. 3D地图渲染（Three.js）
exports.initThreeScene = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) throw new Error('3D容器不存在');

  // 创建场景
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);

  // 创建相机
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(100, 150, 200);

  // 创建渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 添加控制器（旋转/缩放）
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // 添加光源
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  // 添加地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshPhongMaterial({ color: 0xe0e0e0 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  return { scene, camera, renderer };
};