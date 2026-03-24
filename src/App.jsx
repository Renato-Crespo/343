import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Sparkles, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// --- Constants & Data ---
const sections = [
  { id: 'manifesto', title: 'Manifesto', color: '#ff4d2d', position: [-25, 0, -25] },
  { id: 'eventos', title: 'Eventos', color: '#ffd166', position: [25, 0, -25] },
  { id: 'membros', title: 'Membros', color: '#06d6a0', position: [25, 0, 25] },
  { id: 'garage', title: 'Garage', color: '#7b61ff', position: [-25, 0, 25] },
];

const CURVE = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(40, 0, 10),
    new THREE.Vector3(60, 0, 40),
    new THREE.Vector3(40, 0, 70),
    new THREE.Vector3(0, 0, 60),
    new THREE.Vector3(-40, 0, 70),
    new THREE.Vector3(-60, 0, 40),
    new THREE.Vector3(-40, 0, 10),
], true);

// --- Hooks ---
function useControls() {
  const [keys, setKeys] = useState({ Forward: false, Backward: false, Left: false, Right: false });
  useEffect(() => {
    const down = (e) => {
      if (['w', 'ArrowUp', 'W'].includes(e.key)) setKeys(k => ({ ...k, Forward: true }));
      if (['s', 'ArrowDown', 'S'].includes(e.key)) setKeys(k => ({ ...k, Backward: true }));
      if (['a', 'ArrowLeft', 'A'].includes(e.key)) setKeys(k => ({ ...k, Left: true }));
      if (['d', 'ArrowRight', 'D'].includes(e.key)) setKeys(k => ({ ...k, Right: true }));
    };
    const up = (e) => {
      if (['w', 'ArrowUp', 'W'].includes(e.key)) setKeys(k => ({ ...k, Forward: false }));
      if (['s', 'ArrowDown', 'S'].includes(e.key)) setKeys(k => ({ ...k, Backward: false }));
      if (['a', 'ArrowLeft', 'A'].includes(e.key)) setKeys(k => ({ ...k, Left: false }));
      if (['d', 'ArrowRight', 'D'].includes(e.key)) setKeys(k => ({ ...k, Right: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  return keys;
}

// --- Components ---

function SportCar({ activeSection, onPositionUpdate }) {
  const group = useRef();
  const chassisRef = useRef();
  const wheelRefs = [useRef(), useRef(), useRef(), useRef()];
  const keys = useControls();

  const velocity = useRef(0);
  const rotationThreshold = useRef(0);
  const speed = 0.1;
  const turnSpeed = 0.04;
  const friction = 0.95;

  useFrame((state, delta) => {
    if (!group.current) return;

    if (keys.Forward) velocity.current += speed * delta * 60;
    if (keys.Backward) velocity.current -= (speed * 0.6) * delta * 60;
    
    if (Math.abs(velocity.current) > 0.01) {
      const steeringMove = velocity.current > 0 ? 1 : -1;
      if (keys.Left) rotationThreshold.current += turnSpeed * delta * 60 * steeringMove;
      if (keys.Right) rotationThreshold.current -= turnSpeed * delta * 60 * steeringMove;
    }

    velocity.current *= friction;
    group.current.rotation.y = rotationThreshold.current;

    group.current.position.x += Math.sin(rotationThreshold.current) * velocity.current * delta * 60;
    group.current.position.z += Math.cos(rotationThreshold.current) * velocity.current * delta * 60;

    if (onPositionUpdate) onPositionUpdate(group.current.position, velocity.current);
    
    if (chassisRef.current) {
        chassisRef.current.position.y = 0.25 + Math.sin(state.clock.getElapsedTime() * 15) * 0.003 * Math.abs(velocity.current);
        chassisRef.current.rotation.z = -velocity.current * (keys.Left ? -0.06 : keys.Right ? 0.06 : 0);
    }
    wheelRefs.forEach(ref => { if (ref.current) ref.current.rotation.x += velocity.current * 1.5; });
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.5, 1.5]} />
        <meshBasicMaterial color={activeSection?.color || '#ff4d2d'} transparent opacity={0.4} />
      </mesh>
      <group ref={chassisRef} position={[0, 0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 0.4, 2.2]} />
          <meshStandardMaterial color="#c1121f" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, -0.1]}>
          <boxGeometry args={[0.8, 0.4, 1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
      {[[-0.6, 0.2, -0.7], [0.6, 0.2, -0.7], [-0.6, 0.2, 0.7], [0.6, 0.2, 0.7]].map((pos, i) => (
        <mesh key={i} ref={wheelRefs[i]} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

function Track() {
  const points = useMemo(() => CURVE.getPoints(100), []);
  const trackGeometry = useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(-5, -0.1);
      shape.lineTo(5, -0.1);
      shape.lineTo(5, 0.1);
      shape.lineTo(-5, 0.1);
      shape.closePath();
      return new THREE.ExtrudeGeometry(shape, { steps: 100, extrudePath: CURVE, bevelEnabled: false });
  }, []);

  return (
    <group>
      <mesh geometry={trackGeometry} receiveShadow>
        <meshStandardMaterial color="#222" roughness={0.8} />
      </mesh>
      {points.map((p, i) => {
          if (i % 2 !== 0) return null;
          const nextP = points[(i + 1) % points.length];
          const tangent = nextP.clone().sub(p).normalize();
          const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();
          const color = (i / 2) % 2 === 0 ? "#f00" : "#fff";
          return (
              <group key={i} position={[p.x, 0.1, p.z]}>
                  <mesh position={[normal.x * 5, 0, normal.z * 5]} rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}>
                      <boxGeometry args={[1, 0.1, 1]} />
                      <meshStandardMaterial color={color} />
                  </mesh>
                  <mesh position={[normal.x * -5, 0, normal.z * -5]} rotation={[0, Math.atan2(tangent.x, tangent.z), 0]}>
                      <boxGeometry args={[1, 0.1, 1]} />
                      <meshStandardMaterial color={color} />
                  </mesh>
              </group>
          )
      })}
    </group>
  );
}

function WorldDecor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={1} />
      <pointLight position={[0, 100, 0]} intensity={2} />
      <directionalLight position={[10, 50, 10]} intensity={2.5} castShadow />
    </group>
  );
}

function FollowCamera({ carPos }) {
    const { camera } = useThree();
    useFrame((state, delta) => {
        if (!carPos) return;
        const target = new THREE.Vector3(carPos.x, 30, carPos.z + 30);
        camera.position.lerp(target, delta * 3);
        camera.lookAt(carPos.x, carPos.y, carPos.z);
    });
    return null;
}

function HudOverlay({ activeSection, velocity }) {
    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 text-white font-sans">
            <div className="flex justify-between items-start">
                <div className="bg-black/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10">
                    <h1 className="text-3xl font-black italic tracking-tighter text-red-600">CLUBE 343</h1>
                    <p className="text-[10px] opacity-50 uppercase tracking-[0.3em]">Circuit Experience</p>
                </div>
                <div className="bg-black/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10">
                    <div className="text-[10px] opacity-40 uppercase font-bold">Telemetria</div>
                    <div className="text-2xl font-black italic">{Math.abs(Math.round(velocity * 120))} <span className="text-xs opacity-30">KM/H</span></div>
                </div>
            </div>
            <div className="flex justify-center pb-8 items-center gap-4">
                <div className="pointer-events-auto bg-black/90 backdrop-blur-3xl p-3 rounded-full border border-white/10 flex gap-1">
                    {sections.map(s => (
                        <button key={s.id} className={`px-5 py-2 rounded-full text-[10px] font-black italic transition-all uppercase tracking-widest ${activeSection?.id === s.id ? 'bg-red-600' : 'text-white/40 hover:bg-white/10'}`}>
                            {s.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function CircuitClube343() {
  const [carPos, setCarPos] = useState(new THREE.Vector3(0, 0, 0));
  const [velocity, setVelocity] = useState(0);
  const [activeSection, setActiveSection] = useState(sections[0]);
  const touchStart = useRef(null);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#111]">
      <Canvas shadows camera={{ position: [50, 50, 50], fov: 40 }}>
        <Suspense fallback={<Html center className="text-red-500 font-black">LOADING CIRCUIT...</Html>}>
          <color attach="background" args={['#050608']} />
          <WorldDecor />
          <Track />
          <SportCar activeSection={activeSection} onPositionUpdate={(p, v) => { setCarPos(p.clone()); setVelocity(v); }} />
          <FollowCamera carPos={carPos} />
        </Suspense>
      </Canvas>
      <HudOverlay activeSection={activeSection} velocity={velocity} />
      <div 
        className="absolute inset-0 z-10 select-none touch-none" 
        onPointerDown={(e) => { touchStart.current = { x: e.clientX, y: e.clientY }; window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); }}
        onPointerMove={(e) => {
            if (!touchStart.current) return;
            const dx = e.clientX - touchStart.current.x;
            if (dx > 30) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
            else if (dx < -30) window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
            else { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' })); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' })); }
        }}
        onPointerUp={() => { touchStart.current = null; ['w', 'a', 's', 'd'].forEach(k => window.dispatchEvent(new KeyboardEvent('keyup', { key: k }))); }}
      />
    </div>
  );
}
