import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const scroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
};

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function CameraRig() {
  const { camera, pointer } = useThree();
  useFrame((_, d) => {
    const dt = Math.min(d, 0.05);
    const p = scroll();
    const k = 1 - Math.exp(-3 * dt);
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * k;
    camera.position.y += (pointer.y * 0.8 - p * 6 - camera.position.y) * k;
    camera.position.z += (8 - p * 20 - camera.position.z) * k;
    camera.lookAt(0, -p * 8, -p * 30);
  });
  return null;
}

function AICore() {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const tex = useMemo(glowTexture, []);
  const { pointer } = useThree();
  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime;
    const dt = Math.min(d, 0.05);
    if (!group.current) return;
    const k = 1 - Math.exp(-4 * dt);
    group.current.rotation.y += (pointer.x * 0.6 - group.current.rotation.y) * k;
    group.current.rotation.x += (-pointer.y * 0.4 - group.current.rotation.x) * k;
    ring1.current!.rotation.z = t * 0.4;
    ring2.current!.rotation.x = t * 0.3 + 1;
    const s = 4 + Math.sin(t * 2) * 0.35;
    halo.current!.scale.set(s, s, 1);
  });
  return (
    <group ref={group} position={[0, 0, 0]}>
      <Float speed={1.5} floatIntensity={0.6}>
        <mesh>
          <icosahedronGeometry args={[1, 8]} />
          <MeshDistortMaterial color="#5b8cff" emissive="#2a5bd7" emissiveIntensity={0.6} roughness={0.15} metalness={0.6} distort={0.35} speed={2} />
        </mesh>
        <mesh scale={1.35}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#9cc4ff" wireframe transparent opacity={0.25} />
        </mesh>
      </Float>
      <mesh ref={ring1}>
        <torusGeometry args={[1.9, 0.012, 8, 160]} />
        <meshBasicMaterial color="#8fb6ff" />
      </mesh>
      <mesh ref={ring2} rotation={[1.2, 0, 0]}>
        <torusGeometry args={[2.3, 0.008, 8, 160]} />
        <meshBasicMaterial color="#c9dcff" />
      </mesh>
      <sprite ref={halo}>
        <spriteMaterial map={tex} color="#7aa6ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <Sparkles count={60} scale={5} size={3} speed={0.6} color="#9cc4ff" />
    </group>
  );
}

function Nebula() {
  const tex = useMemo(glowTexture, []);
  const ref = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () => [
      { p: [-14, -6, -40], s: 40, c: "#3b5bdb" },
      { p: [16, -14, -55], s: 50, c: "#6741d9" },
      { p: [0, -24, -70], s: 60, c: "#1c7ed6" },
      { p: [-10, -30, -45], s: 35, c: "#0b7285" },
    ],
    [],
  );
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * 0.01 + scroll() * 0.6;
  });
  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.p as [number, number, number]} scale={[c.s, c.s, 1]}>
          <spriteMaterial map={tex} color={c.c} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

function Planet({ pos, r, color, speed }: { pos: [number, number, number]; r: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * speed;
  });
  return (
    <Float speed={0.6} floatIntensity={1.5}>
      <mesh ref={ref} position={pos}>
        <sphereGeometry args={[r, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
      </mesh>
    </Float>
  );
}

function StarField() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.y += Math.min(d, 0.05) * 0.01;
      ref.current.rotation.x = scroll() * 0.5;
    }
  });
  return (
    <group ref={ref}>
      <Stars radius={80} depth={60} count={4000} factor={4} saturation={0} fade speed={0.6} />
      <Sparkles count={200} scale={[40, 60, 40]} position={[0, -15, -20]} size={1.5} speed={0.2} opacity={0.6} color="#cfe0ff" />
    </group>
  );
}

export default function Universe() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 8], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#dbe7ff" />
        <pointLight position={[-6, -3, 2]} intensity={30} color="#5b8cff" />
        <CameraRig />
        <StarField />
        <Nebula />
        <AICore />
        <Planet pos={[9, -10, -18]} r={2.2} color="#8aa9d6" speed={0.1} />
        <Planet pos={[-11, -20, -30]} r={3.5} color="#c9a27a" speed={0.05} />
        <Planet pos={[6, -30, -45]} r={1.4} color="#e8ecf5" speed={0.2} />
      </Canvas>
    </div>
  );
}
