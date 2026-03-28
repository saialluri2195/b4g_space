import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail, Html, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// 3D Earth Component
const Earth = () => {
  const earthRef = useRef();
  const earthMap = useTexture('/earth_texture.png');
  
  useFrame(() => {
    earthRef.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial 
        map={earthMap}
        roughness={0.6}
        emissive="#0284c7" 
        emissiveIntensity={0.05}
      />
    </mesh>
  );
};

// Individual Asteroid component
const Asteroid = ({ data, currentTime, exaggerate, onSelect }) => {
  const groupRef = useRef();
  const asteroidMap = useTexture('/lava_texture.png');
  
  // Calculate relative position based on time
  const timeDiffHours = (currentTime - data.date) / (1000 * 60 * 60);
  
  // Scaling factors for visual representation
  const distanceScale = 0.000005; // Compress millions of km
  const baseSize = data.diameter * 0.002;
  const size = exaggerate ? baseSize * 50 : baseSize;

  // Compute position (Simulating a linear flyby trajectory)
  // Close approach is at Z = missDistance, X = 0
  const xPos = timeDiffHours * data.velocity * 0.1;
  const zPos = data.missDistance * distanceScale;
  
  const position = useMemo(() => {
    const pos = new THREE.Vector3(xPos, 0, zPos);
    // Apply orbital tilt and rotation so they don't all come from the exact same plane
    pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), data.inclination);
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), data.orbitAngle);
    return pos;
  }, [xPos, zPos, data.inclination, data.orbitAngle]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.rotation.x += 0.01;
      groupRef.current.rotation.y += 0.01;
    }
  });

  // Calculate opacity based on distance from Earth to fade out distant ones
  const distToEarth = position.length();
  const opacity = Math.max(0, 1 - distToEarth / 150);
  
  if (distToEarth > 200) return null; // Don't render if too far

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <Trail width={exaggerate ? 0.8 : 0.2} length={25} color={data.isHazardous ? "#ff4400" : "#ffaa00"} attenuation={(t) => t * t}>
        {/* Core textured rock acting as Magma */}
        <mesh>
          <dodecahedronGeometry args={[size, 1]} />
          <meshStandardMaterial 
            map={asteroidMap}
            emissiveMap={asteroidMap}
            emissive={data.isHazardous ? "#ff2200" : "#ff8800"}
            emissiveIntensity={data.isHazardous ? 3.5 : 2.0}
            color={data.isHazardous ? "#ffaaaa" : "#ffffff"} 
            roughness={0.9}
            transparent
            opacity={opacity}
          />
        </mesh>
      </Trail>

      {/* Label on hover or close approach */}
      {distToEarth < 15 && (
        <Html distanceFactor={15} center>
          <div className={`px-2 py-1 rounded bg-black/80 text-xs backdrop-blur-md border ${data.isHazardous ? 'border-red-500 text-red-200 shadow-[0_0_10px_red]' : 'border-orange-500 text-orange-200'} whitespace-nowrap pointer-events-none`}>
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default function AsteroidScene({ data, currentTime, exaggerate, onSelect }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position:[0, 20, 40], fov: 45 }}>
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 50, 50]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enablePan={false} maxDistance={150} minDistance={5} />
        
        <Suspense fallback={null}>
          <Earth />
          {data.map((ast) => (
            <Asteroid 
              key={ast.id} 
              data={ast} 
              currentTime={currentTime} 
              exaggerate={exaggerate} 
              onSelect={onSelect}
            />
          ))}
        </Suspense>

        {/* Cinematic Bloom Post Processing */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
