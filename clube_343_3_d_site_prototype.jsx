import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const sections = [
  {
    id: 'manifesto',
    title: 'Manifesto',
    subtitle: 'Velocidade, exclusividade e cultura de pista.',
    position: [-6, 0.7, -4],
    color: '#ff4d2d',
  },
  {
    id: 'eventos',
    title: 'Eventos',
    subtitle: 'Track nights, encontros e experiências seletivas.',
    position: [5.5, 0.7, -5.5],
    color: '#ffd166',
  },
  {
    id: 'membros',
    title: 'Membros',
    subtitle: 'Uma garagem privada para quem vive performance.',
    position: [6.5, 0.7, 4.8],
    color: '#06d6a0',
  },
  {
    id: 'garage',
    title: 'Garage',
    subtitle: 'Máquinas, specs e curadoria premium.',
    position: [-5.5, 0.7, 5.2],
    color: '#7b61ff',
  },
];

function Car({ position, rotation, activeSection }) {
  const group = useRef();
  const glow = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(t * 2.2) * 0.04;
    group.current.rotation.y = rotation + Math.sin(t * 0.35) * 0.04;
    if (glow.current) {
      glow.current.material.opacity = 0.32 + Math.sin(t * 4) * 0.08;
      glow.current.scale.setScalar(1 + Math.sin(t * 3.5) * 0.03);
    }
  });

  return (
    <group ref={group} position={position} rotation={[0, rotation, 0]}>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <ringGeometry args={[0.72, 1.16, 40]} />
        <meshBasicMaterial color={activeSection?.color || '#ff4d2d'} transparent opacity={0.32} />
      </mesh>

      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.9, 0.35, 0.9]} />
        <meshStandardMaterial color="#9b111e" metalness={0.75} roughness={0.2} />
      </mesh>

      <mesh castShadow position={[0, 0.46, -0.02]}>
        <boxGeometry args={[1.05, 0.3, 0.72]} />
        <meshStandardMaterial color="#c1121f" metalness={0.7} roughness={0.18} />
      </mesh>

      <mesh castShadow position={[0, 0.5, -0.02]}>
        <boxGeometry args={[0.82, 0.18, 0.62]} />
        <meshStandardMaterial color="#0d1117" metalness={0.25} roughness={0.05} transparent opacity={0.82} />
      </mesh>

      <mesh castShadow position={[0, 0.22, 0.48]}>
        <boxGeometry args={[1.05, 0.14, 0.12]} />
        <meshStandardMaterial color="#121212" metalness={0.6} roughness={0.5} />
      </mesh>

      <mesh castShadow position={[0, 0.18, -0.51]}>
        <boxGeometry args={[1.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#121212" metalness={0.6} roughness={0.55} />
      </mesh>

      {[
        [-0.68, -0.02, 0.43],
        [0.68, -0.02, 0.43],
        [-0.68, -0.02, -0.43],
        [0.68, -0.02, -0.43],
      ].map((wheel, i) => (
        <group key={i} position={wheel} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.16, 24]} />
            <meshStandardMaterial color="#151515" roughness={0.9} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.09, 0.09, 0.165, 24]} />
            <meshStandardMaterial color="#c7c7c7" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      <mesh position={[-0.45, 0.35, -0.47]}>
        <boxGeometry args={[0.2, 0.06, 0.04]} />
        <meshStandardMaterial emissive="#ffffff" color="#d9f0ff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.45, 0.35, -0.47]}>
        <boxGeometry args={[0.2, 0.06, 0.04]} />
        <meshStandardMaterial emissive="#ffffff" color="#d9f0ff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.38, 0.28, 0.47]}>
        <boxGeometry args={[0.14, 0.05, 0.04]} />
        <meshStandardMaterial emissive="#ff3b30" color="#ff6b6b" emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0.38, 0.28, 0.47]}>
        <boxGeometry args={[0.14, 0.05, 0.04]} />
        <meshStandardMaterial emissive="#ff3b30" color="#ff6b6b" emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

function Track() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 8.5, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 5.6, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return s;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <ringGeometry args={[5.65, 8.45, 96]} />
        <meshBasicMaterial color="#efefef" wireframe />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[5.4, 64]} />
        <meshStandardMaterial color="#111315" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <torusGeometry args={[7.05, 0.03, 12, 150]} />
        <meshBasicMaterial color="#ff4d2d" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <torusGeometry args={[5.95, 0.03, 12, 150]} />
        <meshBasicMaterial color="#ff4d2d" />
      </mesh>
    </group>
  );
}

function WorldDecor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.03, 0]}>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#050608" />
      </mesh>

      <Sparkles count={80} scale={[18, 6, 18]} size={2.2} speed={0.3} />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
        <Text position={[0, 2.8, -10]} fontSize={1.15} color="#f6f6f6" anchorX="center">
          CLUBE 343
        </Text>
        <Text position={[0, 1.95, -10]} fontSize={0.34} color="#ff4d2d" anchorX="center">
          Racing culture • exclusividade • performance
        </Text>
      </Float>

      {[[-10,0.5,-10],[10,0.5,-10],[-10,0.5,10],[10,0.5,10]].map((p, i) => (
        <group key={i} position={p}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.12, 2.6, 18]} />
            <meshStandardMaterial color="#2f2f2f" metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial color="#ffe8a3" emissive="#ffb703" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Marker({ section, isActive, onClick }) {
  return (
    <group position={section.position}>
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.35}>
        <mesh onClick={onClick} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 1.2, 18]} />
          <meshStandardMaterial color={isActive ? section.color : '#e7e7e7'} emissive={isActive ? section.color : '#000000'} emissiveIntensity={isActive ? 1.2 : 0} />
        </mesh>
        <mesh position={[0, 0.75, 0]} onClick={onClick}>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial color={section.color} emissive={section.color} emissiveIntensity={1.5} />
        </mesh>
      </Float>
      <Text position={[0, 1.35, 0]} fontSize={0.28} color="#ffffff" anchorX="center">
        {section.title}
      </Text>
    </group>
  );
}

function Scene({ activeSection, setActiveSection }) {
  const targetAngle = useMemo(() => {
    const index = sections.findIndex((s) => s.id === activeSection.id);
    return (index / sections.length) * Math.PI * 2 + 0.5;
  }, [activeSection]);

  const carPosition = useMemo(() => {
    const radius = 6.95;
    return [Math.cos(targetAngle) * radius, 0.25, Math.sin(targetAngle) * radius];
  }, [targetAngle]);

  const carRotation = useMemo(() => targetAngle - Math.PI / 2, [targetAngle]);

  return (
    <>
      <color attach="background" args={['#050608']} />
      <fog attach="fog" args={['#050608', 14, 26]} />
      <ambientLight intensity={0.6} />
      <directionalLight castShadow position={[8, 12, 6]} intensity={1.4} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <spotLight position={[0, 10, 0]} intensity={1.3} angle={0.45} penumbra={0.5} color="#ff4d2d" />
      <Environment preset="night" />
      <WorldDecor />
      <Track />
      <Car position={carPosition} rotation={carRotation} activeSection={activeSection} />
      {sections.map((section) => (
        <Marker
          key={section.id}
          section={section}
          isActive={activeSection.id === section.id}
          onClick={() => setActiveSection(section)}
        />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={18}
        minPolarAngle={0.7}
        maxPolarAngle={1.3}
        target={[0, 0.8, 0]}
      />
    </>
  );
}

function Hud({ activeSection, setActiveSection }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-8 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-xl rounded-3xl border border-white/10 bg-black/35 px-5 py-4 backdrop-blur-md">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.9)]" />
            <span className="text-xs uppercase tracking-[0.35em] text-white/60">Clube 343</span>
          </div>
          <h1 className="text-3xl font-semibold md:text-5xl">Pista curta. Presença máxima.</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 md:text-base">
            Uma experiência 3D inspirada em cultura de corrida: carro esportivo, mini mapa, atmosfera noturna e pontos de interação para apresentar o universo do Clube 343.
          </p>
        </div>

        <div className="hidden rounded-3xl border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur-md md:block">
          <div className="text-xs uppercase tracking-[0.35em] text-white/50">Controles</div>
          <div className="mt-2 text-sm text-white/80">arraste para orbitar • clique nos pontos • scroll para zoom</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="pointer-events-auto flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-black/35 p-3 backdrop-blur-md">
          {sections.map((section) => {
            const active = section.id === activeSection.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section)}
                className={`rounded-full border px-4 py-2 text-sm transition ${active ? 'border-transparent text-black' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}
                style={active ? { background: section.color } : {}}
              >
                {section.title}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.35em] text-white/50">Área ativa</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ background: activeSection.color, boxShadow: `0 0 20px ${activeSection.color}` }} />
            <h2 className="text-2xl font-semibold">{activeSection.title}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/75">{activeSection.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function Clube343Prototype() {
  const [activeSection, setActiveSection] = useState(sections[0]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#050608]">
      <Canvas shadows camera={{ position: [11, 8, 11], fov: 42 }}>
        <Suspense fallback={<Html center className="text-white">Carregando pista...</Html>}>
          <Scene activeSection={activeSection} setActiveSection={setActiveSection} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,77,45,0.18),transparent_28%),radial-gradient(circle_at_bottom,rgba(123,97,255,0.15),transparent_24%)]" />
      <Hud activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
}
