/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// PINE TREE COMPONENT
// ==========================================
export function PineTree({ index = 0, simplified = false }: { index?: number; simplified?: boolean }) {
    // Deterministic random offsets based on the index
    const scaleY = 1 + (index % 5) * 0.15;
    const offsetRot = (index % 10) * 0.3;

    return (
        <group>
            {/* Trunk */}
            <mesh castShadow={!simplified} receiveShadow={!simplified} position={[0, 1.25 * scaleY, 0]}>
                <cylinderGeometry args={[0.2, 0.35, 2.5 * scaleY, simplified ? 4 : 8]} />
                <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>

            {/* Lower Leaves Tier (rendered even in simplified to keep shape) */}
            <mesh castShadow={!simplified} position={[0, 2.0 * scaleY, 0]} rotation={[0, offsetRot, 0]}>
                <coneGeometry args={[1.5, 2.0 * scaleY, simplified ? 4 : 5]} />
                <meshStandardMaterial color="#064e3b" roughness={0.85} flatShading />
            </mesh>

            {!simplified && (
                <>
                    {/* Middle Leaves Tier */}
                    <mesh castShadow position={[0, 3.2 * scaleY, 0]} rotation={[0, offsetRot + 1, 0]}>
                        <coneGeometry args={[1.1, 1.6 * scaleY, 5]} />
                        <meshStandardMaterial color="#0369a1" roughness={0.8} flatShading />
                    </mesh>

                    {/* Top Leaves Tier */}
                    <mesh castShadow position={[0, 4.2 * scaleY, 0]} rotation={[0, offsetRot + 2, 0]}>
                        <coneGeometry args={[0.7, 1.2 * scaleY, 5]} />
                        <meshStandardMaterial color="#38bdf8" roughness={0.7} flatShading />
                    </mesh>
                </>
            )}
        </group>
    );
}

// ==========================================
// BROAD LEAF DECIDUOUS TREE COMPONENT
// ==========================================
export function DeciduousTree({ index = 0, simplified = false }: { index?: number; simplified?: boolean }) {
    const scale = 0.9 + (index % 4) * 0.2;
    const rotation = (index % 12) * 0.52;

    return (
        <group scale={[scale, scale, scale]} rotation={[0, rotation, 0]}>
            {/* Curved Trunk */}
            <mesh castShadow={!simplified} receiveShadow={!simplified} position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.25, 0.4, 3, simplified ? 4 : 8]} />
                <meshStandardMaterial color="#451a03" roughness={0.9} />
            </mesh>

            {/* Foliage Canopy Clusters */}
            <group position={[0, 3.2, 0]}>
                {/* Main center leaf cluster */}
                <mesh castShadow={!simplified}>
                    <dodecahedronGeometry args={[1.6, simplified ? 0 : 1]} />
                    <meshStandardMaterial color="#0f766e" roughness={0.8} flatShading />
                </mesh>
                {!simplified && (
                    <>
                        {/* Side left cluster */}
                        <mesh castShadow position={[-0.8, 0.5, 0.3]} scale={[0.7, 0.7, 0.7]}>
                            <dodecahedronGeometry args={[1.3, 1]} />
                            <meshStandardMaterial color="#115e59" roughness={0.8} flatShading />
                        </mesh>
                        {/* Side right cluster */}
                        <mesh castShadow position={[0.7, -0.4, -0.4]} scale={[0.8, 0.8, 0.8]}>
                            <dodecahedronGeometry args={[1.4, 1]} />
                            <meshStandardMaterial color="#14b8a6" roughness={0.75} flatShading />
                        </mesh>
                    </>
                )}
            </group>
        </group>
    );
}

// ==========================================
// GIANT ENCHANTED MUSHROOM COMPONENT
// ==========================================
export function GiantMushroom({ index = 0, simplified = false }: { index?: number; simplified?: boolean }) {
    const stemColor = '#f5f5f4'; // Warm stone off-white
    const capColor = index % 3 === 0 ? '#0ea5e9' : index % 3 === 1 ? '#38bdf8' : '#0284c7'; // Vibrant sky blues instead of pinks/reds

    return (
        <group scale={[0.75, 0.85, 0.75]}>
            {/* Stem */}
            <mesh castShadow={!simplified} receiveShadow={!simplified} position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.2, 0.35, 1.6, simplified ? 4 : 8]} />
                <meshStandardMaterial color={stemColor} roughness={0.9} />
            </mesh>

            {/* Top Umbrella Cap */}
            <mesh castShadow={!simplified} position={[0, 1.6, 0]}>
                <sphereGeometry args={[1.0, simplified ? 6 : 16, simplified ? 6 : 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color={capColor} roughness={0.4} flatShading={simplified} />
            </mesh>

            {!simplified && (
                <>
                    {/* Spores/Plate underside of cap */}
                    <mesh position={[0, 1.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[0.98, 16]} />
                        <meshStandardMaterial color="#e7e5e4" roughness={0.9} />
                    </mesh>

                    {/* Spot decoration 1 */}
                    <mesh position={[0.4, 2.1, 0.4]} scale={[0.15, 0.08, 0.15]}>
                        <sphereGeometry args={[1, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>

                    {/* Spot decoration 2 */}
                    <mesh position={[-0.5, 2.2, -0.3]} scale={[0.18, 0.08, 0.18]}>
                        <sphereGeometry args={[1, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>

                    {/* Spot decoration 3 */}
                    <mesh position={[0.1, 2.35, -0.2]} scale={[0.12, 0.08, 0.12]}>
                        <sphereGeometry args={[1, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                </>
            )}
        </group>
    );
}

// ==========================================
// BOULDER / FOREST ROCK COMPONENT
// ==========================================
export function Boulder({ index = 0 }: { index?: number }) {
    const scale = 0.8 + (index % 4) * 0.3;

    return (
        <group scale={[scale, scale, scale]} position={[0, 0, 0]}>
            <mesh castShadow receiveShadow position={[0, 1.0, 0]} rotation={[(index % 5) * 0.4, (index % 3) * 0.7, (index % 4) * 0.2]}>
                <icosahedronGeometry args={[1.3, 0]} />
                <meshStandardMaterial color="#4b5563" roughness={0.85} flatShading />
            </mesh>
        </group>
    );
}

// ==========================================
// FALLEN MOSSY LOG BARRIER COMPONENT (Horizontal hurdle)
// ==========================================
export function MossyLog() {
    return (
        <group>
            {/* Core Wooden Log Trunk */}
            <mesh castShadow receiveShadow position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.3, 2.4, 12]} />
                <meshStandardMaterial color="#5c3f30" roughness={0.95} />
            </mesh>

            {/* Side broken branch nodes */}
            <mesh castShadow position={[-0.6, 0.55, -0.2]} rotation={[0.4, 0.4, 0.3]}>
                <cylinderGeometry args={[0.1, 0.12, 0.5, 6]} />
                <meshStandardMaterial color="#5c3f30" roughness={0.95} />
            </mesh>
            <mesh castShadow position={[0.6, 0.6, 0.2]} rotation={[-0.3, -0.5, -0.4]}>
                <cylinderGeometry args={[0.08, 0.1, 0.4, 6]} />
                <meshStandardMaterial color="#5c3f30" roughness={0.95} />
            </mesh>

            {/* Overlapping moss patches */}
            <mesh receiveShadow position={[0, 0.52, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1.05, 1.05, 0.8]}>
                <cylinderGeometry args={[0.2, 0.2, 1.2, 8, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#4d7c0f" roughness={0.9} flatShading />
            </mesh>
            <mesh receiveShadow position={[-0.5, 0.5, 0.1]} rotation={[0.3, 0, Math.PI / 2]} scale={[1.03, 1.03, 0.4]}>
                <cylinderGeometry args={[0.2, 0.2, 0.8, 8, 1, false, 0, Math.PI]} />
                <meshStandardMaterial color="#65a30d" roughness={0.95} flatShading />
            </mesh>
        </group>
    );
}

// ==========================================
// GOLDEN ACORN COMPONENT (Collectible currency)
// ==========================================
export function GoldenAcorn() {
    const capRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<THREE.Mesh>(null);

    // Continuous float hover/spin animation using local state hook
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const baseOffset = Math.sin(time * 3) * 0.15;

        if (bodyRef.current) {
            bodyRef.current.position.y = 0.55 + baseOffset;
            bodyRef.current.rotation.y = time * 2;
        }
        if (capRef.current) {
            capRef.current.position.y = 0.82 + baseOffset;
            capRef.current.rotation.y = time * 2;
        }
    });

    return (
        <group>
            {/* Acorn Body (Teardrop shape) */}
            <mesh ref={bodyRef} castShadow position={[0, 0.55, 0]}>
                <sphereGeometry args={[0.28, 16, 16]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    metalness={0.9}
                    roughness={0.15}
                    emissive="#d97706"
                    emissiveIntensity={0.6}
                />
            </mesh>

            {/* Acorn Hat/Cap (Textured cup on top) */}
            <mesh ref={capRef} position={[0, 0.82, 0]}>
                <cylinderGeometry args={[0.32, 0.24, 0.18, 12]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
        </group>
    );
}

// ==========================================
// BHOOT (GHOST) STRUCTURE COMPONENT
// ==========================================
export function GhostStructure({ index = 0 }: { index?: number }) {
    const ghostRef = useRef<THREE.Group>(null);
    
    // Floating and slight glowing animation
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (ghostRef.current) {
            ghostRef.current.position.y = 1.0 + Math.sin(time * 2 + index) * 0.4;
            ghostRef.current.rotation.y = Math.sin(time + index) * 0.2;
        }
    });

    return (
        <group scale={[1.2, 1.2, 1.2]}>
            {/* Haunted Tombstone base */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1.2, 1.0, 0.4]} />
                <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 0.4, 16]} />
                <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>

            {/* Glowing / Floating Ghost */}
            <group ref={ghostRef}>
                <mesh position={[0, 1.5, 0]} castShadow>
                    <capsuleGeometry args={[0.6, 1.2, 16, 16]} />
                    <meshStandardMaterial 
                        color="#ffffff" 
                        transparent 
                        opacity={0.85} 
                        emissive="#f8fafc" 
                        emissiveIntensity={0.3} 
                        roughness={0.4} 
                    />
                </mesh>
                
                {/* Ghost Eyes */}
                <mesh position={[-0.2, 2.3, 0.55]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0.2, 2.3, 0.55]}>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
            </group>
        </group>
    );
}

