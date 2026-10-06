import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { FastCSSBackground } from './FastCSSBackground';
import type { DeviceProfile } from './backgroundProfile';

type MotionValueLike = { get?: () => number };

const Blob = ({
  position,
  color,
  speed,
  distort,
  radius,
  isDarkMode,
  segments,
  isMobile,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
  radius: number;
  isDarkMode: boolean;
  segments: number;
  isMobile: boolean;
}) => (
  <Float
    speed={speed}
    rotationIntensity={isMobile ? 0.35 : 0.8}
    floatIntensity={isMobile ? 0.45 : 0.8}
  >
    <Sphere args={[radius, segments, segments]} position={position}>
      <MeshDistortMaterial
        color={color}
        speed={speed}
        distort={distort}
        radius={radius}
        emissive={color}
        emissiveIntensity={isDarkMode ? 0.35 : 0.15}
        roughness={0.4}
        metalness={0.5}
      />
    </Sphere>
  </Float>
);

const Scene = ({
  mouse,
  isDarkMode,
  isMobile,
}: {
  mouse: React.MutableRefObject<[number, number]>;
  isDarkMode: boolean;
  isMobile: boolean;
}) => {
  const { viewport } = useThree();

  useFrame((state) => {
    const parallax = isMobile ? 0.018 : 0.04;
    const damping = isMobile ? 0.035 : 0.055;
    const targetX = mouse.current[0] * viewport.width * parallax;
    const targetY = mouse.current[1] * viewport.height * parallax;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, damping);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, damping);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={isDarkMode ? 0.7 : 1.3} />
      <pointLight position={[10, 10, 10]} intensity={isDarkMode ? 0.9 : 0.5} color="#ffffff" />
      {!isMobile && <pointLight position={[-10, -10, -10]} intensity={0.4} color="#d4f75a" />}

      {isMobile ? (
        <>
          <Blob position={[-1.7, 1.8, -2]} color="#c7e85c" speed={0.58} distort={0.16} radius={1.05} isDarkMode={isDarkMode} segments={12} isMobile />
          <Blob position={[1.65, -1.55, -1]} color="#72a78f" speed={0.5} distort={0.18} radius={0.82} isDarkMode={isDarkMode} segments={12} isMobile />
        </>
      ) : (
        <>
          <Blob position={[-3, 2, -2]} color="#c7e85c" speed={1.2} distort={0.3} radius={1.4} isDarkMode={isDarkMode} segments={16} isMobile={false} />
          <Blob position={[3, -2, -1]} color="#72a78f" speed={1.0} distort={0.35} radius={1.1} isDarkMode={isDarkMode} segments={16} isMobile={false} />
          <Blob position={[-4, -3, -3]} color="#d3a875" speed={1.2} distort={0.2} radius={0.9} isDarkMode={isDarkMode} segments={16} isMobile={false} />
          <Blob position={[5, 3, -4]} color="#a3b983" speed={1.4} distort={0.35} radius={0.8} isDarkMode={isDarkMode} segments={16} isMobile={false} />
        </>
      )}
    </>
  );
};

const MouseSync = ({
  mouseX,
  mouseY,
  mouse,
}: {
  mouseX: MotionValueLike;
  mouseY: MotionValueLike;
  mouse: React.MutableRefObject<[number, number]>;
}) => {
  useFrame(() => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    mouse.current[0] = ((mouseX.get?.() ?? width / 2) / width) * 2 - 1;
    mouse.current[1] = -((mouseY.get?.() ?? height / 2) / height) * 2 + 1;
  });
  return null;
};

export const Background3D = ({
  mouseX,
  mouseY,
  isDarkMode,
  profile,
}: {
  mouseX: MotionValueLike;
  mouseY: MotionValueLike;
  isDarkMode: boolean;
  profile: DeviceProfile;
}) => {
  const mouse = useRef<[number, number]>([0, 0]);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setIsSupported(Boolean(gl));
    } catch {
      setIsSupported(false);
    }
  }, []);

  if (!isSupported || hasWebGLError) {
    return <FastCSSBackground isDarkMode={isDarkMode} />;
  }

  const pixelRatio = profile.isMobile
    ? 1
    : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed inset-0 -z-50 overflow-hidden pointer-events-none transition-colors duration-700',
        isDarkMode ? 'bg-[#171d18]' : 'bg-[#f4f2e9]'
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={pixelRatio}
        frameloop={profile.isPageVisible ? 'always' : 'never'}
        performance={{ min: profile.isMobile ? 0.55 : 0.7 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: profile.isMobile ? 'low-power' : 'high-performance',
          stencil: false,
          depth: true,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault();
              setHasWebGLError(true);
            },
            false
          );
        }}
      >
        <MouseSync mouseX={mouseX} mouseY={mouseY} mouse={mouse} />
        <Scene mouse={mouse} isDarkMode={isDarkMode} isMobile={profile.isMobile} />
      </Canvas>
      <div
        className={cn(
          'absolute inset-0 transition-colors duration-700',
          isDarkMode ? 'bg-[#171d18]/15' : 'bg-[#f4f2e9]/72'
        )}
      />
    </div>
  );
};

export default Background3D;
