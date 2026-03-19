"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Tablet() {
  const { scene } = useGLTF("/low_poly_sci-fi_tablet.glb");
  const tabletRef = useRef<THREE.Group>(null!);

  // Mouse follow logic using useFrame
  useFrame((state) => {
    if (tabletRef.current) {
      const targetX = state.mouse.y * 0.5; // X-axis rotation depends on mouse Y
      const targetY = state.mouse.x * 0.5; // Y-axis rotation depends on mouse X
      
      // Smoothly lerp the rotation for mouse follow
      tabletRef.current.rotation.x = THREE.MathUtils.lerp(
        tabletRef.current.rotation.x,
        targetX,
        0.1
      );
      tabletRef.current.rotation.y = THREE.MathUtils.lerp(
        tabletRef.current.rotation.y,
        targetY,
        0.1
      );
    }
  });

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (tabletRef.current) {
        // Initial state
        gsap.set(tabletRef.current.position, { x: 3, y: 0, z: 0 });

        // Scroll animation: Move position from right to left
        gsap.to(tabletRef.current.position, {
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

  return <primitive ref={tabletRef} object={scene} scale={2} />;
}

export default function TabletModel() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 10] }} alpha={true}>
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <React.Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Tablet />
          </Float>
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        </React.Suspense>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
