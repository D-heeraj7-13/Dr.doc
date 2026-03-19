"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ServerRack() {
  const { scene } = useGLTF("/server_rack.glb");
  const rackRef = useRef<THREE.Group>(null!);

  // Mouse follow logic
  useFrame((state) => {
    if (rackRef.current) {
      const targetX = state.mouse.y * 0.3; // subtle follow
      const targetY = state.mouse.x * 0.3;
      
      rackRef.current.rotation.x = THREE.MathUtils.lerp(
        rackRef.current.rotation.x,
        targetX,
        0.05
      );
      rackRef.current.rotation.y = THREE.MathUtils.lerp(
        rackRef.current.rotation.y,
        targetY,
        0.05
      );
    }
  });

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (rackRef.current) {
        // Initial position: Off-screen to the right
        gsap.set(rackRef.current.position, { x: 5, y: -2, z: 0 });

        // Scroll animation: Move position from right to left
        gsap.to(rackRef.current.position, {
          x: -3,
          y: 0,
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [scene]);

  return <primitive ref={rackRef} object={scene} scale={2} />;
}

export default function ServerRackModel() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 12] }} alpha={true}>
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#10b981" />
        <React.Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <ServerRack />
          </Float>
          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
        </React.Suspense>
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
