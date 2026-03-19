"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment, Float, ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ServerRack() {
  const { scene } = useGLTF("/server_rack.glb");
  const rackRef = useRef<any>();

  useEffect(() => {
    let ctx = gsap.context(() => {
      if (rackRef.current) {
        // Initial position: Off-screen to the right
        gsap.set(rackRef.current.position, { x: 5, y: -2, z: 0 });
        gsap.set(rackRef.current.rotation, { y: -Math.PI / 4 });

        // Scroll animation: Move to center-left and rotate
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

        gsap.to(rackRef.current.rotation, {
          y: Math.PI / 4,
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
