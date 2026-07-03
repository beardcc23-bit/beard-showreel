import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';

function CameraRig() {
  useFrame((state) => {
    // 讓相機位置隨滑鼠座標進行平滑偏移 (模擬後期 3D 攝影機視差)
    state.camera.position.x += (state.pointer.x * 1.5 - state.camera.position.x) * 0.05;
    state.camera.position.y += (state.pointer.y * 1.2 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Crystal({ position, scale, speed, floatRange, rotationSpeed, geometryType }) {
  const meshRef = useRef();
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    // 1. 上下正弦曲線漂浮
    meshRef.current.position.y = initialY + Math.sin(time * speed) * floatRange;
    
    // 2. 自轉運動 (X, Y, Z 三軸不同速度，創造立體感)
    meshRef.current.rotation.x += rotationSpeed.x;
    meshRef.current.rotation.y += rotationSpeed.y;
    meshRef.current.rotation.z += rotationSpeed.z;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geometryType === 0 ? (
        <icosahedronGeometry args={[1, 0]} />
      ) : (
        <dodecahedronGeometry args={[0.9, 0]} />
      )}
      <MeshTransmissionMaterial
        backside
        samples={8}
        resolution={256}
        transmission={1.0}
        roughness={0.08}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        ior={1.6} // 玻璃與水晶折射率
        thickness={1.3} // 水晶厚度
        chromaticAberration={0.08} // 光學色散（彩虹邊緣，後期合成技師的最愛）
        anisotropicBlur={0.05}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0.0}
        color="#ffffff"
      />
    </mesh>
  );
}

// 7 個水晶的配置數據 (位置 x, y, z, 縮放, 漂浮速度, 漂浮幅度, 自轉速度, 幾何形狀)
const CRYSTALS_DATA = [
  { pos: [-6, 3, -1], scale: [0.35, 0.35, 0.35], speed: 0.4, range: 0.6, rotSpeed: { x: 0.002, y: 0.003, z: 0.001 }, geom: 0 },
  { pos: [-4.5, -3, 0], scale: [0.45, 0.45, 0.45], speed: 0.3, range: 0.8, rotSpeed: { x: -0.001, y: 0.002, z: 0.002 }, geom: 1 },
  { pos: [5.5, 2.5, -2], scale: [0.3, 0.3, 0.3], speed: 0.5, range: 0.5, rotSpeed: { x: 0.003, y: -0.001, z: 0.003 }, geom: 0 },
  { pos: [5, -2, 0], scale: [0.55, 0.55, 0.55], speed: 0.25, range: 0.9, rotSpeed: { x: 0.001, y: 0.001, z: -0.002 }, geom: 1 },
  { pos: [-7.5, 0, -2], scale: [0.25, 0.25, 0.25], speed: 0.6, range: 0.4, rotSpeed: { x: 0.004, y: 0.002, z: 0.001 }, geom: 0 },
  { pos: [6.5, 0.5, -3], scale: [0.4, 0.4, 0.4], speed: 0.35, range: 0.7, rotSpeed: { x: -0.002, y: 0.003, z: 0.001 }, geom: 0 },
  { pos: [-2, 4.2, -3], scale: [0.28, 0.28, 0.28], speed: 0.45, range: 0.5, rotSpeed: { x: 0.001, y: -0.002, z: 0.002 }, geom: 1 },
];

export default function RefractiveCrystals() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const handleDeviceCheck = () => {
      // 行動端、觸控裝置或 Reduced Motion 模式下完全不渲染 3D
      const isMobile = window.innerWidth < 768;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setShouldRender(!isMobile && !isTouch && !prefersReduced);
    };

    handleDeviceCheck();
    window.addEventListener('resize', handleDeviceCheck);
    
    // 監聽 prefers-reduced-motion 的變化
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleDeviceCheck);
    }

    return () => {
      window.removeEventListener('resize', handleDeviceCheck);
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleDeviceCheck);
      }
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* 相機視差與背景透明控制 */}
        <CameraRig />
        <ambientLight intensity={0.4} />
        <pointLight position={[-10, 10, 10]} intensity={1.5} color="#ffe082" />
        <pointLight position={[10, -10, -10]} intensity={1.0} color="#00ffff" />
        <directionalLight position={[0, 10, 5]} intensity={0.8} />

        {/* 渲染多個 3D 物理折射水晶 */}
        {CRYSTALS_DATA.map((c, i) => (
          <Crystal
            key={i}
            position={c.pos}
            scale={c.scale}
            speed={c.speed}
            floatRange={c.range}
            rotationSpeed={c.rotSpeed}
            geometryType={c.geom}
          />
        ))}
      </Canvas>
    </div>
  );
}
