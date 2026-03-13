import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Structure, ProjectCable, Cable, Translation } from '../types';

interface ThreeDPreviewProps {
  structure: Structure;
  cables: ProjectCable[];
  allCables: Cable[];
  packedCables: any[];
  index: number;
  allowedArea: number;
  t: Translation;
  darkMode?: boolean;
}

export function ThreeDPreview({ structure, cables, allCables, packedCables, index, allowedArea, t, darkMode }: ThreeDPreviewProps) {
  const length = 1000; // 1 meter length

  const cablesInThisStructure = useMemo(() => {
    return packedCables.map(c => {
      if (structure.type === 'conduit') {
        return {
          ...c,
          x: c.px,
          y: c.py
        };
      } else {
        return {
          ...c,
          x: c.px - structure.width / 2 + c.diameter / 2,
          y: c.py - structure.height / 2 + c.diameter / 2
        };
      }
    });
  }, [packedCables, structure.type, structure.width, structure.height]);

  return (
    <div className={`w-full h-[500px] rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl relative group transition-colors ${darkMode ? 'bg-[#0F0F0F]' : 'bg-[#F5F5F5]'}`}>
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-black/40'}`}>{t.misc.threeDPreview}</p>
        <p className={`text-[9px] uppercase ${darkMode ? 'text-white/20' : 'text-black/20'}`}>{t.misc.threeDControls}</p>
      </div>
      
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={[darkMode ? '#0F0F0F' : '#F5F5F5']} />
        <PerspectiveCamera makeDefault position={[structure.width * 1.5, structure.height * 1.5, length * 0.8]} fov={45} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[length, length, length]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-length, -length, -length]} intensity={0.5} />
        
        <group position={[0, 0, 0]}>
          {/* Structure */}
          {structure.type === 'tray' ? (
            <mesh receiveShadow castShadow>
              <boxGeometry args={[structure.width, structure.height, length]} />
              <meshStandardMaterial color={darkMode ? "#aaa" : "#333"} transparent opacity={darkMode ? 0.5 : 0.2} wireframe />
            </mesh>
          ) : (
            <mesh receiveShadow castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[structure.width / 2, structure.width / 2, length, 32, 1, true]} />
              <meshStandardMaterial color={darkMode ? "#aaa" : "#333"} transparent opacity={darkMode ? 0.5 : 0.2} wireframe side={2} />
            </mesh>
          )}

          {/* Cables */}
          {cablesInThisStructure.map((c, i) => (
            <mesh key={i} position={[c.x, c.y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[c.diameter / 2, c.diameter / 2, length, 16]} />
              <meshStandardMaterial color={c.color} roughness={0.3} metalness={0.2} />
            </mesh>
          ))}
        </group>

        <Environment preset="city" />
        <ContactShadows position={[0, -structure.height / 2 - 10, 0]} opacity={0.4} scale={2000} blur={2} far={20} />
      </Canvas>
    </div>
  );
}
