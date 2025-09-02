'use client';
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';

// Lamp body with gentle breathing animation.
function LampBody({ emissiveRef }) {
  const mesh = useRef();
  const material = useRef();
  useFrame((state) => {
    // Animate a subtle breathing effect on the shape of the diffuser
    const t = state.clock.getElapsedTime();
    const scale = 1.0 + 0.04 * Math.sin(t * 0.8);
    if (mesh.current) {
      mesh.current.scale.set(scale, 1.0 + 0.06 * Math.sin(t * 0.6), scale);
    }
  });
  return (
    <mesh ref={mesh} position={[0, 0.86, 0]} castShadow>
      {/* Capsule geometry approximates the truncated cone shape of the lamp diffuser */}
      <capsuleGeometry args={[0.48, 1.0, 16, 32]} />
      <meshPhysicalMaterial
        ref={(node) => {
          material.current = node;
          emissiveRef.current = node;
        }}
        transparent
        opacity={0.92}
        roughness={0.85}
        metalness={0.0}
        transmission={0.85}
        thickness={0.6}
        color="#fff1dc"
        emissive="#ffd9a8"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Base of the lamp constructed from cylinders and boxes to match the blueprint.
function Base() {
  return (
    <group>
      {/* Lower dark grey ring */}
      <mesh receiveShadow castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.86, 0.86, 0.28, 64]} />
        <meshStandardMaterial color="#5a5f66" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Upper light grey ring */}
      <mesh receiveShadow castShadow position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.28, 64]} />
        <meshStandardMaterial color="#bfc3c7" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* LED bar slot */}
      <mesh position={[0.42, 0.42, 0.75]}>
        <boxGeometry args={[0.44, 0.04, 0.02]} />
        <meshStandardMaterial color="#c7ccd1" />
      </mesh>
      {/* LED bar light */}
      <mesh position={[0.28, 0.42, 0.76]}>
        <boxGeometry args={[0.28, 0.03, 0.01]} />
        <meshStandardMaterial
          emissive="#dfe7ee"
          emissiveIntensity={2.0}
          color="#ffffff"
        />
      </mesh>
      {/* Sun icon */}
      <mesh position={[0.7, 0.42, 0.75]}>
        <circleGeometry args={[0.03, 24]} />
        <meshStandardMaterial color="#7a7f86" />
      </mesh>
    </group>
  );
}

// Handle loop at the top of the diffuser
function HandleLoop() {
  return (
    <group position={[0, 1.43, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.08, 0.015, 16, 48]} />
        <meshStandardMaterial color="#d9dde0" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, -0.045, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.05, 32]} />
        <meshStandardMaterial color="#e6eaee" roughness={0.35} metalness={0.15} />
      </mesh>
    </group>
  );
}

// Main 3D component tying scroll progress to rotation and brightness.
function FloatLamp3D() {
  const group = useRef();
  const emissiveRef = useRef();
  const scrollProgress = useRef(0);

  // Update scroll progress and brightness on scroll
  useEffect(() => {
    function onScroll() {
      const total = document.body.scrollHeight - window.innerHeight;
      const progress = total > 0 ? window.scrollY / total : 0;
      scrollProgress.current = progress;
      // Update lamp brightness smoothly. Emissive intensity goes from 0.2 to 1.2.
      if (emissiveRef.current) {
        const eased = progress * progress; // ease-in brightness
        emissiveRef.current.emissiveIntensity = 0.2 + eased * 1.0;
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Rotate lamp based on current scroll progress
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = scrollProgress.current * Math.PI * 2;
    }
  });

  return (
    <Canvas
      shadows
      camera={{ position: [2.2, 1.6, 2.6], fov: 40 }}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Studio-style lighting */}
      <color attach="background" args={["#f9f9fb"]} />
      <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#cdd3d9" />
      <directionalLight castShadow position={[3, 5, 3]} intensity={1.1} />
      {/* Lamp group that will rotate */}
      <group ref={group} position={[0, -0.2, 0]}>
        <Base />
        <LampBody emissiveRef={emissiveRef} />
        <HandleLoop />
      </group>
      {/* Soft contact shadow */}
      <ContactShadows
        opacity={0.4}
        scale={6}
        blur={2}
        far={3.5}
        position={[0, -0.02, 0]}
      />
      {/* Environment map for subtle reflections */}
      <Environment preset="city" />
      {/* Disable manual rotation to ensure smooth scroll-driven rotation */}
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}

// Landing page component with a sticky lamp and scrolling text
export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', lineHeight: 1.6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          minHeight: '200vh',
        }}
      >
        {/* Left column with copy */}
        <div style={{ flex: '0 0 50%', padding: '4rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Float Lamp</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            A buoyant lantern for your adventures. Our water-resistant, soft-glow lamp
            floats in floods, campfires and beachfronts alike. Scroll to rotate and
            illuminate the lamp.
          </p>
          <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            With a rechargeable base, touch controls and gently breathing diffuser,
            Float Lamp brings mood and utility together. As you move down the page
            the lamp brightens from a gentle glow to full radiance.
          </p>
          <p style={{ fontSize: '1rem' }}>
            Pre-order now and join our mission: for every lamp purchased, one will be
            donated to communities impacted by flooding.
          </p>
        </div>
        {/* Right column with sticky 3D lamp */}
        <div
          style={{
            flex: '0 0 50%',
            position: 'sticky',
            top: 0,
            height: '100vh',
          }}
        >
          <FloatLamp3D />
        </div>
      </div>
    </div>
  );
}
