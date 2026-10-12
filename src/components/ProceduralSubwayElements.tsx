/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// DETAILED PROCEDURAL SUBWAY TRAIN
// ==========================================
interface ProceduralTrainProps {
    isCarriage?: boolean;
    index?: number;
}

export function ProceduralTrain({ isCarriage = false, index = 0 }: ProceduralTrainProps) {
    // Determine colors based on index for variety
    const bodyColor = index % 3 === 0 ? '#ef4444' : index % 3 === 1 ? '#eab308' : '#3b82f6'; // Bright Red, Yellow, or Blue
    const stripeColor = '#ffffff'; // Retro-style white stripe
    const roofColor = '#475569'; // Dark industrial slate roof
    const grillColor = '#1e293b'; // Charcoal dark metal grill
    
    return (
        <group>
            {/* Main Subway Car Body */}
            <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.1, 2.5, 6.8]} />
                <meshStandardMaterial color={bodyColor} roughness={0.3} metalness={0.4} />
            </mesh>

            {/* Flat Industrial Roof */}
            <mesh position={[0, 2.68, 0]} castShadow>
                <boxGeometry args={[2.0, 0.1, 6.6]} />
                <meshStandardMaterial color={roofColor} roughness={0.7} metalness={0.6} />
            </mesh>

            {/* Retro White Side Stripes */}
            <mesh position={[-1.06, 1.3, 0]} castShadow>
                <boxGeometry args={[0.02, 0.25, 6.6]} />
                <meshStandardMaterial color={stripeColor} roughness={0.2} />
            </mesh>
            <mesh position={[1.06, 1.3, 0]} castShadow>
                <boxGeometry args={[0.02, 0.25, 6.6]} />
                <meshStandardMaterial color={stripeColor} roughness={0.2} />
            </mesh>

            {/* Side Passenger Windows */}
            {[-2.0, -0.7, 0.7, 2.0].map((zPos, idx) => (
                <group key={zPos}>
                    {/* Left Windows */}
                    <mesh position={[-1.065, 1.8, zPos]} castShadow>
                        <boxGeometry args={[0.01, 0.6, 0.8]} />
                        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.3} />
                    </mesh>
                    {/* Right Windows */}
                    <mesh position={[1.065, 1.8, zPos]} castShadow>
                        <boxGeometry args={[0.01, 0.6, 0.8]} />
                        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.3} />
                    </mesh>
                </group>
            ))}

            {/* Engine Specific Front Features */}
            {!isCarriage && (
                <group>
                    {/* Front Cab Windshield windshield */}
                    <mesh position={[0, 1.9, -3.41]} rotation={[-0.1, 0, 0]} castShadow>
                        <boxGeometry args={[1.7, 0.8, 0.02]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.05} metalness={0.9} />
                    </mesh>

                    {/* Left Headlight */}
                    <mesh position={[-0.7, 0.6, -3.42]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={2.5} roughness={0.1} />
                    </mesh>

                    {/* Right Headlight */}
                    <mesh position={[0.7, 0.6, -3.42]}>
                        <sphereGeometry args={[0.18, 16, 16]} />
                        <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={2.5} roughness={0.1} />
                    </mesh>

                    {/* Front Cowcatcher / Obstreperous metal grill */}
                    <mesh position={[0, 0.3, -3.2]} castShadow>
                        <boxGeometry args={[1.9, 0.4, 0.4]} />
                        <meshStandardMaterial color={grillColor} metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            )}

            {/* Back Connection Buffer block for realism */}
            <mesh position={[0, 0.8, 3.42]} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.15]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>

            {/* Graffiti Sprayed tags on the side of the train (Subway Surfers signature vibe!) */}
            <group position={[-1.07, 0.7, index % 2 === 0 ? -1.0 : 1.0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.01, 0.4, 1.4]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.9} /> {/* Yellow/Amber tag */}
                </mesh>
                <mesh position={[0.005, 0.1, 0.2]} castShadow>
                    <boxGeometry args={[0.01, 0.2, 0.8]} />
                    <meshStandardMaterial color="#0ea5e9" roughness={0.9} /> {/* Sky blue contrast paint */}
                </mesh>
            </group>

            {/* Wheel bogies */}
            {[-2.2, 2.2].map((zPos) => (
                <group key={zPos} position={[0, 0.15, zPos]}>
                    <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.5} />
                    </mesh>
                    <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.5} />
                    </mesh>
                    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
                        <meshStandardMaterial color="#334155" metalness={0.8} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// ==========================================
// SUBWAY WARNING BARRICADE & OVERHEAD HURDLE (Red-and-White Hurdle)
// ==========================================
export function SubwayBarricade({ type = 'normal' }: { type?: 'normal' | 'overhead' }) {
    const isOverhead = type === 'overhead';
    const yOffset = isOverhead ? 2.5 : 0.8; // High board for overhead, low for normal

    return (
        <group>
            {/* Main horizontal barricade board */}
            <mesh position={[0, yOffset, 0]} castShadow>
                <boxGeometry args={[2.2, isOverhead ? 1.0 : 0.4, 0.1]} />
                <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>

            {/* Red Warning Stripes */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
                <mesh key={x} position={[x, yOffset, 0.055]} castShadow>
                    <planeGeometry args={[0.2, isOverhead ? 1.0 : 0.4]} />
                    <meshStandardMaterial color="#ef4444" roughness={0.6} />
                </mesh>
            ))}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
                <mesh key={`back-${x}`} position={[x, yOffset, -0.055]} rotation={[0, Math.PI, 0]} castShadow>
                    <planeGeometry args={[0.2, isOverhead ? 1.0 : 0.4]} />
                    <meshStandardMaterial color="#ef4444" roughness={0.6} />
                </mesh>
            ))}

            {/* Left Support Leg */}
            <group position={[-0.9, 0, 0]}>
                <mesh position={[0, isOverhead ? 1.5 : 0.4, 0]} castShadow>
                    <boxGeometry args={[0.1, isOverhead ? 3.0 : 0.8, 0.1]} />
                    <meshStandardMaterial color="#64748b" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.05, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.1, 0.4]} />
                    <meshStandardMaterial color="#334155" roughness={0.8} />
                </mesh>
            </group>

            {/* Right Support Leg */}
            <group position={[0.9, 0, 0]}>
                <mesh position={[0, isOverhead ? 1.5 : 0.4, 0]} castShadow>
                    <boxGeometry args={[0.1, isOverhead ? 3.0 : 0.8, 0.1]} />
                    <meshStandardMaterial color="#64748b" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.05, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.1, 0.4]} />
                    <meshStandardMaterial color="#334155" roughness={0.8} />
                </mesh>
            </group>
        </group>
    );
}

function meshFoot(x: number) {
    return null;
}

// ==========================================
// SUBWAY ARCADE GOLD COIN (Embossed star coin)
// ==========================================
export function GoldCoin() {
    const coinRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const baseOffset = Math.sin(time * 3.5 + 1.0) * 0.15;

        if (coinRef.current) {
            coinRef.current.position.y = 0.65 + baseOffset;
            coinRef.current.rotation.y = time * 3.2; 
            // It stands upright and spins around Y axis
        }
    });

    return (
        <group>
            {/* Golden Star Coin Frame */}
            <group ref={coinRef}>
                <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                    {/* Thin cylinder coin disk */}
                    <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
                    <meshStandardMaterial
                        color="#facc15"
                        metalness={0.9}
                        roughness={0.08}
                        emissive="#ca8a04"
                        emissiveIntensity={0.65}
                    />
                </mesh>
            </group>
        </group>
    );
}

// ==========================================
// SUBWAY STATION COLUMN / PILLAR
// ==========================================
export function SubwayPillar({ side = 'left', simplified = false }: { side: 'left' | 'right'; simplified?: boolean }) {
    const isLeft = side === 'left';
    return (
        <group position={[isLeft ? -4.5 : 4.5, 0, 0]}>
            {/* Electric Pole base */}
            <mesh position={[0, 4.0, 0]} castShadow={!simplified} receiveShadow={!simplified}>
                <cylinderGeometry args={[0.15, 0.2, 8.0, simplified ? 4 : 8]} />
                <meshStandardMaterial color="#555" roughness={0.9} />
            </mesh>

            {!simplified && (
                <>
                    {/* Messy wires bundle */}
                    <mesh position={[isLeft ? 0.5 : -0.5, 7.5, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.05, 0.05, 1.0, 4]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>

                    {/* Transformer Box */}
                    <mesh position={[0, 6.5, 0]} castShadow>
                        <boxGeometry args={[0.6, 0.8, 0.4]} />
                        <meshStandardMaterial color="#888" roughness={0.6} />
                    </mesh>
                    
                    {/* Street light arm */}
                    <mesh position={[isLeft ? 0.8 : -0.8, 6.8, 0]} rotation={[0, 0, isLeft ? -0.2 : 0.2]}>
                        <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                        <meshStandardMaterial color="#444" />
                    </mesh>

                    {/* Street light bulb */}
                    <mesh position={[isLeft ? 1.5 : -1.5, 6.6, 0]}>
                        <sphereGeometry args={[0.15, 8, 8]} />
                        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.5} />
                    </mesh>
                </>
            )}
        </group>
    );
}

// ==========================================
// SUBWAY TRACK OVERHEAD ARCH WITH SIGNALS
// ==========================================
export function SubwayTrackArch() {
    return (
        <group position={[0, 5.5, 0]}>
            {/* Rope across the street */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 11.0, 4]} />
                <meshStandardMaterial color="#111" />
            </mesh>

            {/* Bunting Triangles / Festival Flags */}
            {[-4, -2, 0, 2, 4].map((x, i) => (
                <mesh key={x} position={[x, -0.4, 0]} castShadow>
                    <coneGeometry args={[0.4, 0.8, 3]} />
                    <meshStandardMaterial color={i % 3 === 0 ? "#f97316" : i % 3 === 1 ? "#0ea5e9" : "#ef4444"} />
                </mesh>
            ))}
        </group>
    );
}

// ==========================================
// SUBWAY platform BRICK WALL PANELS WITH COOL ART WORK GRAFFITI
// ==========================================
export function SubwaySideWall({ side = 'left', index = 0, simplified = false }: { side: 'left' | 'right'; index: number; simplified?: boolean }) {
    const isLeft = side === 'left';
    const xPos = isLeft ? -5.5 : 5.5;
    
    // Choose different colors/types of shops
    const shopColor = index % 3 === 0 ? "#fef08a" : index % 3 === 1 ? "#fca5a5" : "#bae6fd";

    return (
        <group position={[xPos, 0, 0]}>
            {/* Building base */}
            <mesh position={[0, 3.2, 0]} castShadow={!simplified} receiveShadow={!simplified}>
                <boxGeometry args={[1.5, 6.4, 10.0]} />
                <meshStandardMaterial color={shopColor} roughness={0.9} />
            </mesh>

            {!simplified && (
                <>
                    {/* Shop shutter / door */}
                    <mesh position={[isLeft ? 0.76 : -0.76, 1.2, 0]} castShadow>
                        <boxGeometry args={[0.1, 2.4, 4.0]} />
                        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.6} /> {/* Steel Shutter */}
                    </mesh>

                    {/* Signboard */}
                    <mesh position={[isLeft ? 0.8 : -0.8, 3.0, 0]} rotation={[0, isLeft ? Math.PI/2 : -Math.PI/2, 0]}>
                        <boxGeometry args={[4.0, 1.0, 0.1]} />
                        <meshStandardMaterial color={index % 2 === 0 ? "#ef4444" : "#3b82f6"} />
                    </mesh>

                    {/* Signboard Text Blocks (Abstract details) */}
                    <mesh position={[isLeft ? 0.86 : -0.86, 3.0, 0]}>
                        <boxGeometry args={[0.05, 0.4, 2.5]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>

                    {/* Upper floor window */}
                    <mesh position={[isLeft ? 0.8 : -0.8, 4.8, 0]} castShadow>
                        <boxGeometry args={[0.2, 1.5, 2.5]} />
                        <meshStandardMaterial color="#8b4513" roughness={0.9} /> {/* Wooden frame */}
                    </mesh>
                    <mesh position={[isLeft ? 0.92 : -0.92, 4.8, 0]} castShadow>
                        <boxGeometry args={[0.05, 1.3, 2.3]} />
                        <meshStandardMaterial color="#0f172a" roughness={0.1} /> {/* Glass */}
                    </mesh>
                </>
            )}
        </group>
    );
}
