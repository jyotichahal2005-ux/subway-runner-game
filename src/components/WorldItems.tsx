/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { engineState, useGameStore, getLevelDifficulty } from '../store/gameStore';
import { AutoScaledModel } from './AutoScaledModel';
import { ErrorBoundary3D } from './ErrorBoundary3D';
import { AudioEngine } from '../lib/audioEngine';
import {
    ProceduralTrain,
    SubwayBarricade,
    GoldCoin,
    SubwaySideWall,
    SubwayPillar,
    SubwayTrackArch
} from './ProceduralSubwayElements';
import {
    PineTree,
    DeciduousTree,
    GiantMushroom,
    Boulder,
    MossyLog,
    GhostStructure
} from './NatureElements';

const LANE_WIDTH = 2.5;

class PoolItem {
    lane: number = 0;
    z: number = 0;
    rotY: number = 0;
    collected: boolean = false;
    x: number = 0;
    scaleY: number = 1;
    type: string = 'normal';
    category: 'train' | 'barrier' | 'coin' = 'coin';
    isMagnated: boolean = false;

    constructor(z: number, category: 'train' | 'barrier' | 'coin' = 'coin') {
        this.category = category;
        this.reset(z);
    }

    reset(newZ: number) {
        this.lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        this.z = newZ;
        this.collected = false;
        this.scaleY = 1;
        this.isMagnated = false;

        const currentLvl = useGameStore.getState().currentLevel;
        const normalizedRatio = Math.min(1.0, (currentLvl - 1) / 29); // 0 at level 1, 1 at level 30

        if (this.category === 'train') {
            // Level 1: 15% moving trains. Level 30: 65% moving trains! This makes it extremely dynamic & challenging!
            const movingProb = 0.15 + normalizedRatio * 0.50;
            this.type = Math.random() < movingProb ? 'moving' : 'normal';
        } else if (this.category === 'coin') {
            const rand = Math.random();
            
            // At higher levels, make general powerups a bit more sparse, while retaining their fun
            // We adjust thresholds so standard gold coins/gems are more common than shield/jetpacks at super high levels
            const powerupScarcity = normalizedRatio * 0.08; // reduce powerup range slightly

            if (rand < (0.65 + powerupScarcity)) {
                this.type = 'normal'; // standard Gold Coin
            } else if (rand < 0.77) {
                this.type = 'gem'; // sparkling Cyan Gem / Diamond (+5 Coins)
            } else if (rand < 0.85) {
                this.type = 'star'; // pink Cosmic Star (+50 points score multiplier)
            } else if (rand < 0.90) {
                this.type = 'magnet_power'; // red Magnet power-up item
            } else if (rand < 0.95) {
                this.type = 'hoverboard_power'; // turquoise Hoverboard shield item
            } else {
                this.type = 'sneakers_power'; // purplish high bounce shoes
            }
        } else if (this.category === 'barrier') {
            this.type = 'normal';
        } else {
            this.type = 'normal';
        }

        // Side scenery random offsets: -8 to -25 or 8 to 25
        this.x = Math.random() > 0.5 ? 6 + Math.random() * 18 : -6 - Math.random() * 18;
    }
}

const TrainItem = ({ item, isCarriage, index }: { item: PoolItem, isCarriage: boolean, index: number }) => {
    const ref = useRef<THREE.Group>(null);
    const targetHeight = isCarriage ? 2.6 : 3.0;
    
    useFrame(() => {
        if (ref.current) {
            // Put it on the ground: the anchor is in the center for AutoScaledModel,
            // so we offset by exactly half the target height.
            ref.current.position.set(item.lane * LANE_WIDTH, targetHeight / 2, item.z);
        }
    });

    const modelUrl = isCarriage ? '/Railway carriage.glb' : '/Train.glb';

    return (
        <group ref={ref}>

            {/* We render 3 carriages connected back-to-back to create a long continuous train! */}
            {[-7.0, 0, 7.0].map((zOffset, cIdx) => {
                const isLeadCar = cIdx === 0; // First car acts as the locomotive, others as coupled carriages
                const currentModel = isLeadCar ? '/Train.glb' : '/Railway carriage.glb';
                const currentHeight = isLeadCar ? 3.0 : 2.6;
                return (
                    <group key={cIdx} position={[0, (currentHeight - targetHeight) / 2, zOffset]}>
                        <ErrorBoundary3D fallback={<ProceduralTrain isCarriage={!isLeadCar} index={index + cIdx} />}>
                            <Suspense fallback={<ProceduralTrain isCarriage={!isLeadCar} index={index + cIdx} />}>
                                <AutoScaledModel
                                    url={currentModel}
                                    targetWidth={isLeadCar ? 2.2 : 2.15}
                                    targetHeight={currentHeight}
                                    targetDepth={isLeadCar ? 7.0 : 6.5}
                                    extraRotation={[0, Math.PI, 0]}
                                />
                            </Suspense>
                        </ErrorBoundary3D>
                    </group>
                );
            })}
        </group>
    );
};

const BarrierItem = ({ item }: { item: PoolItem }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
        if (ref.current) {
            ref.current.position.set(item.lane * LANE_WIDTH, 0, item.z);
        }
    });
    return (
        <group ref={ref}>
            <SubwayBarricade type={item.type as 'normal' | 'overhead'} />
        </group>
    );
};

const CoinItem = ({ item, trains }: { item: PoolItem, trains?: PoolItem[] }) => {
    const ref = useRef<THREE.Group>(null);
    const sparksRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (ref.current) {
            // Check if there's a train below this coin to position it on top of the train roof
            let trainHeight = 0;
            if (trains) {
                for (let i = 0; i < trains.length; i++) {
                    const t = trains[i];
                    if (t.lane === item.lane && Math.abs(t.z - item.z) < 10.5) { // Linked triple-carriage half-length is 10.5
                        trainHeight = 2.8;
                        break;
                    }
                }
            }

            let coinRenderY = trainHeight > 0 ? trainHeight + 0.45 : 0.45;
            if (item.isMagnated) {
                coinRenderY = engineState.playerY + 0.45;
            }
            ref.current.position.set(item.lane * LANE_WIDTH, coinRenderY, item.z);
            ref.current.visible = !item.collected;
            // Satisfying fast spin for active collectibles
            ref.current.rotation.y += 2.5 * delta;
        }
        if (sparksRef.current) {
            sparksRef.current.position.set(item.lane * LANE_WIDTH, 1.2, item.z);
            if (item.collected && item.scaleY > 0) {
                sparksRef.current.visible = true;
                const s = item.scaleY; // goes from 2.0 down to 0
                sparksRef.current.scale.set(s, s, s);
                sparksRef.current.rotation.y += 0.2;
            } else {
                sparksRef.current.visible = false;
            }
        }
    });

    return (
        <group>
            <group ref={ref}>
                {item.type === 'magnet_power' ? (
                    // Beautiful red horseshoe magnet
                    <group position={[0, 0.4, 0]}>
                        <mesh rotation={[Math.PI/2, 0, 0]} castShadow>
                            <torusGeometry args={[0.3, 0.1, 8, 16, Math.PI]} />
                            <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.9} emissive="#ef4444" emissiveIntensity={0.5} />
                        </mesh>
                        <mesh position={[-0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.15]} />
                            <meshStandardMaterial color="#e1e8ed" metalness={0.9} />
                        </mesh>
                         <mesh position={[0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.15]} />
                            <meshStandardMaterial color="#e1e8ed" metalness={0.9} />
                        </mesh>
                    </group>
                ) : item.type === 'gem' ? (
                    // Sparkling blue gem/diamond (double pyramid)
                    <group position={[0, 0.4, 0]}>
                        <mesh castShadow>
                            <octahedronGeometry args={[0.32, 0]} />
                            <meshStandardMaterial color="#06b6d4" roughness={0.05} metalness={0.95} emissive="#06b6d4" emissiveIntensity={0.8} />
                        </mesh>
                    </group>
                ) : item.type === 'star' ? (
                    // Sparkling sky blue cosmic star shape
                    <group position={[0, 0.4, 0]}>
                        <mesh castShadow>
                            <icosahedronGeometry args={[0.28, 0]} />
                            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} emissive="#0ea5e9" emissiveIntensity={1.0} />
                        </mesh>
                        <mesh scale={[1.2, 1.2, 1.2]}>
                            <icosahedronGeometry args={[0.28, 0]} />
                            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.3} wireframe />
                        </mesh>
                    </group>
                ) : item.type === 'hoverboard_power' ? (
                    // Glowing cyan mini hoverboard
                    <group position={[0, 0.4, 0]} rotation={[0.3, 0.8, 0.15]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.26, 0.04, 0.65]} />
                            <meshStandardMaterial color="#06b6d4" roughness={0.05} metalness={0.9} emissive="#06b6d4" emissiveIntensity={0.8} />
                        </mesh>
                    </group>
                ) : item.type === 'sneakers_power' ? (
                    // Purple sneakers boots (scaled up for better visibility)
                    <group position={[0, 0.4, 0]} rotation={[0, 0.2, 0.1]} scale={[1.3, 1.3, 1.3]}>
                         {/* Sole */}
                         <mesh position={[0, -0.15, 0]} castShadow>
                              <boxGeometry args={[0.2, 0.08, 0.45]} />
                              <meshStandardMaterial color="#ffffff" roughness={0.5} />
                         </mesh>
                         {/* Main upper shoe body */}
                         <mesh position={[0, -0.05, 0]} castShadow>
                              <boxGeometry args={[0.18, 0.15, 0.42]} />
                              <meshStandardMaterial color="#c084fc" roughness={0.1} emissive="#a855f7" emissiveIntensity={0.5} />
                         </mesh>
                         {/* High top / ankle part */}
                         <mesh position={[0, 0.1, -0.1]} castShadow>
                              <boxGeometry args={[0.18, 0.2, 0.2]} />
                              <meshStandardMaterial color="#c084fc" roughness={0.1} emissive="#a855f7" emissiveIntensity={0.5} />
                         </mesh>
                         {/* White toe cap cap */}
                         <mesh position={[0, -0.05, 0.2]} castShadow>
                             <sphereGeometry args={[0.1, 8, 8]} />
                             <meshStandardMaterial color="#ffffff" />
                         </mesh>
                    </group>
                ) : item.type === 'jetpack_power' ? (
                    // Gold and dark coal mini jetpack
                    <group position={[0, 0.4, 0]} rotation={[0, 0.2, 0.1]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.22, 0.3, 0.12]} />
                            <meshStandardMaterial color="#fbbf24" roughness={0.15} metalness={0.8} emissive="#fbbf24" emissiveIntensity={0.3} />
                        </mesh>
                        <mesh position={[-0.09, -0.15, 0]}>
                            <cylinderGeometry args={[0.04, 0.04, 0.1]} />
                            <meshBasicMaterial color="#1e293b" />
                        </mesh>
                        <mesh position={[0.09, -0.15, 0]}>
                            <cylinderGeometry args={[0.04, 0.04, 0.1]} />
                            <meshBasicMaterial color="#1e293b" />
                        </mesh>
                    </group>
                ) : (
                    <GoldCoin />
                )}
            </group>
            <group ref={sparksRef} visible={false}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <mesh key={i} position={[
                        Math.cos(i * Math.PI / 3) * 0.4,
                        Math.sin(i * Math.PI / 3) * 0.4,
                        0
                    ]}>
                        <tetrahedronGeometry args={[0.15, 0]} />
                        <meshBasicMaterial color={
                            item.type === 'gem' ? "#22d3ee" :
                            item.type === 'star' ? "#f472b6" :
                            item.type === 'magnet_power' ? "#fca5a5" :
                            item.type === 'hoverboard_power' ? "#38bdf8" :
                            item.type === 'sneakers_power' ? "#c084fc" :
                            item.type === 'jetpack_power' ? "#fb923c" :
                            "#fef08a"
                        } />
                    </mesh>
                ))}
            </group>
        </group>
    );
};

const SleeperItem = ({ sleeperZ }: { sleeperZ: number }) => {
    return (
        <group position={[0, 0, sleeperZ]}>
            {[-LANE_WIDTH, 0, LANE_WIDTH].map((laneX) => (
                <mesh key={laneX} position={[laneX, 0.02, 0]} receiveShadow>
                    <boxGeometry args={[1.6, 0.08, 0.45]} />
                    <meshStandardMaterial color="#3e2723" roughness={0.95} />
                </mesh>
            ))}
        </group>
    );
};

const WallItem = ({ wallZ, index, simplified = false }: { wallZ: number, index: number, simplified?: boolean }) => {
    const currentLevel = useGameStore(s => s.currentLevel);
    const themeIndex = (currentLevel - 1) % 4;

    // Theme 0: Haunted Ghost Yard (Level 1, 6, 11...)
    if (themeIndex === 0) {
        return (
            <group position={[0, 0, wallZ]}>
                <group position={[-5.0, 0, 0]}>
                    <GhostStructure index={index} />
                </group>
                <group position={[5.0, 0, 0]}>
                    <GhostStructure index={index + 1} />
                </group>
                {/* Spooky mist / dark boulders */}
                {index % 2 === 0 && (
                    <group position={[-3.5, 0, 0]} scale={[0.8, 0.5, 0.8]}>
                        <Boulder index={index + 2} />
                    </group>
                )}
                {index % 2 === 1 && (
                    <group position={[3.5, 0, 0]} scale={[0.8, 0.5, 0.8]}>
                        <Boulder index={index + 3} />
                    </group>
                )}
            </group>
        );
    }

    // Theme 1: Lush Forest Park (Level 2, 7, 12...)
    if (themeIndex === 1) {
        return (
            <group position={[0, 0, wallZ]}>
                {/* Left Side: Trees & Mushrooms */}
                <group position={[-5.5, 0, 0]}>
                    {index % 4 === 0 && <DeciduousTree index={index} simplified={simplified} />}
                    {index % 4 === 1 && <PineTree index={index} simplified={simplified} />}
                    {index % 4 === 2 && <GiantMushroom index={index} simplified={simplified} />}
                    {index % 4 === 3 && <Boulder index={index} />}
                </group>

                {/* Right Side: Trees & Mushrooms */}
                <group position={[5.5, 0, 0]}>
                    {index % 4 === 0 && <PineTree index={index + 2} simplified={simplified} />}
                    {index % 4 === 1 && <DeciduousTree index={index + 2} simplified={simplified} />}
                    {index % 4 === 2 && <Boulder index={index + 2} />}
                    {index % 4 === 3 && <GiantMushroom index={index + 2} simplified={simplified} />}
                </group>

                {/* Wooden log posts serving as rustic lanterns every 20 units */}
                {!simplified && index % 2 === 0 && (
                    <>
                        {/* Left Light Pole */}
                        <group position={[-4.0, 0, 0]}>
                            <mesh position={[0, 2.5, 0]} castShadow>
                                <cylinderGeometry args={[0.1, 0.12, 5.0, 6]} />
                                <meshStandardMaterial color="#7c2d12" roughness={0.9} />
                            </mesh>
                            {/* Hanging Lantern light bulb */}
                            <mesh position={[0.4, 4.6, 0]}>
                                <sphereGeometry args={[0.2, 8, 8]} />
                                <meshStandardMaterial color="#fef08a" emissive="#fb923c" emissiveIntensity={2.0} />
                            </mesh>
                        </group>
                        {/* Right Light Pole */}
                        <group position={[4.0, 0, 0]}>
                            <mesh position={[0, 2.5, 0]} castShadow>
                                <cylinderGeometry args={[0.1, 0.12, 5.0, 6]} />
                                <meshStandardMaterial color="#7c2d12" roughness={0.9} />
                            </mesh>
                            <mesh position={[-0.4, 4.6, 0]}>
                                <sphereGeometry args={[0.2, 8, 8]} />
                                <meshStandardMaterial color="#fef08a" emissive="#fb923c" emissiveIntensity={2.0} />
                            </mesh>
                        </group>
                    </>
                )}

                {/* Floral Vine Bunting Garland Arch every 40 units */}
                {!simplified && index % 4 === 0 && (
                    <group position={[0, 5.8, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.04, 0.04, 10.0]} />
                            <meshStandardMaterial color="#166534" />
                        </mesh>
                        {/* Leaves / Vines hanging down */}
                        {[-3.5, -1.8, 0, 1.8, 3.5].map((x, i) => (
                            <mesh key={x} position={[x, -0.3, 0]}>
                                <coneGeometry args={[0.3, 0.6, 4]} />
                                <meshStandardMaterial color={i % 2 === 0 ? "#0ea5e9" : "#38bdf8"} roughness={0.7} />
                            </mesh>
                        ))}
                    </group>
                )}
            </group>
        );
    }

    // Theme 2: Desert Sunset Oasis (Level 3, 8, 13...)
    if (themeIndex === 2) {
        return (
            <group position={[0, 0, wallZ]}>
                {/* Canyon sandstone boulders left side */}
                <group position={[-6.0, 0, 0]} scale={[1.4, 1.6, 1.4]} rotation={[0, index * 0.4, 0]}>
                    <Boulder index={index} />
                    {!simplified && index % 2 === 0 && <mesh position={[0, 1.5, 0]} scale={[0.7, 0.7, 0.7]}><icosahedronGeometry args={[1.2, 0]} /><meshStandardMaterial color="#d97706" roughness={0.9} flatShading /></mesh>}
                </group>

                {/* Canyon sandstone boulders right side */}
                <group position={[6.0, 0, 0]} scale={[1.4, 1.6, 1.4]} rotation={[0, index * 0.7, 0]}>
                    <Boulder index={index + 1} />
                    {!simplified && index % 2 === 1 && <mesh position={[0, 1.5, 0]} scale={[0.7, 0.7, 0.7]}><icosahedronGeometry args={[1.2, 0]} /><meshStandardMaterial color="#d97706" roughness={0.9} flatShading /></mesh>}
                </group>

                {/* Rustic Iron Torch Lampposts */}
                {!simplified && index % 2 === 0 && (
                    <>
                        <group position={[-3.8, 0, 0]}>
                            <mesh position={[0, 2.0, 0]}>
                                <cylinderGeometry args={[0.08, 0.1, 4.0, 4]} />
                                <meshStandardMaterial color="#2d2d2d" roughness={0.8} />
                            </mesh>
                            <mesh position={[0, 4.1, 0]}>
                                <coneGeometry args={[0.2, 0.4, 5]} />
                                <meshStandardMaterial color="#ef4444" emissive="#f97316" emissiveIntensity={3.0} />
                            </mesh>
                        </group>
                        <group position={[3.8, 0, 0]}>
                            <mesh position={[0, 2.0, 0]}>
                                <cylinderGeometry args={[0.08, 0.1, 4.0, 4]} />
                                <meshStandardMaterial color="#2d2d2d" roughness={0.8} />
                            </mesh>
                            <mesh position={[0, 4.1, 0]}>
                                <coneGeometry args={[0.2, 0.4, 5]} />
                                <meshStandardMaterial color="#ef4444" emissive="#f97316" emissiveIntensity={3.0} />
                            </mesh>
                        </group>
                    </>
                )}

                {/* Rustic Hanging Garlands with red triangles */}
                {!simplified && index % 4 === 0 && (
                    <group position={[0, 6.0, 0]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.02, 0.02, 10.5]} />
                            <meshStandardMaterial color="#7c2d12" />
                        </mesh>
                        {[-3, -1, 1, 3].map((x, i) => (
                            <mesh key={x} position={[x, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
                                <coneGeometry args={[0.25, 0.5, 3]} />
                                <meshStandardMaterial color="#b45309" roughness={0.8} />
                            </mesh>
                        ))}
                    </group>
                )}
            </group>
        );
    }

    // Theme 3: Snowy Ice Tundra (Level 4, 8, 12...)
    return (
        <group position={[0, 0, wallZ]}>
            {/* Snowy Pine landscape left side */}
            <group position={[-5.6, 0, 0]}>
                {index % 3 === 0 && <PineTree index={index} simplified={simplified} />}
                {index % 3 === 1 && (
                    <group scale={[1.2, 1.4, 1.2]}>
                        {/* Giant frosted crystalline blue iceberg */}
                        <mesh castShadow={!simplified} receiveShadow={!simplified} position={[0, 1.0, 0]}>
                            <icosahedronGeometry args={[1.2, 0]} />
                            <meshStandardMaterial color="#bae6fd" roughness={0.06} metalness={0.7} flatShading />
                        </mesh>
                    </group>
                )}
                {index % 3 === 2 && <Boulder index={index + 2} />}
            </group>

            {/* Snowy Pine landscape right side */}
            <group position={[5.6, 0, 0]}>
                {index % 3 === 0 && (
                    <group scale={[1.2, 1.4, 1.2]}>
                        <mesh castShadow={!simplified} receiveShadow={!simplified} position={[0, 1.0, 0]}>
                            <icosahedronGeometry args={[1.2, 0]} />
                            <meshStandardMaterial color="#bae6fd" roughness={0.06} metalness={0.7} flatShading />
                        </mesh>
                    </group>
                )}
                {index % 3 === 1 && <PineTree index={index + 3} simplified={simplified} />}
                {index % 3 === 2 && <Boulder index={index + 4} />}
            </group>

            {/* Glowing icy posts serving as frozen lanterns every 20 units */}
            {!simplified && index % 2 === 0 && (
                <>
                    {/* Left ice torch */}
                    <group position={[-4.0, 0, 0]}>
                        <mesh position={[0, 2.5, 0]} castShadow>
                            <cylinderGeometry args={[0.08, 0.12, 5.0, 6]} />
                            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.8} />
                        </mesh>
                        {/* Frozen blue glowing bulb */}
                        <mesh position={[0, 5.1, 0]}>
                            <sphereGeometry args={[0.22, 8, 8]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
                        </mesh>
                    </group>
                    {/* Right ice torch */}
                    <group position={[4.0, 0, 0]}>
                        <mesh position={[0, 2.5, 0]} castShadow>
                            <cylinderGeometry args={[0.08, 0.12, 5.0, 6]} />
                            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.8} />
                        </mesh>
                        <mesh position={[0, 5.1, 0]}>
                            <sphereGeometry args={[0.22, 8, 8]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
                        </mesh>
                    </group>
                </>
            )}

            {/* Silver metal flag line over tracks */}
            {!simplified && index % 4 === 0 && (
                <group position={[0, 5.8, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.02, 0.02, 10.0]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>
                    {/* Snowy triangular bunting elements */}
                    {[-3.5, -1.8, 0, 1.8, 3.5].map((x, i) => (
                        <mesh key={x} position={[x, -0.3, 0]}>
                            <coneGeometry args={[0.25, 0.5, 3]} />
                            <meshStandardMaterial color={i % 2 === 0 ? "#cbd5e1" : "#38bdf8"} roughness={0.5} />
                        </mesh>
                    ))}
                </group>
            )}
        </group>
    );
};

export function WorldItems() {
    // Generate pools exactly matching collision mechanics counts
    const trains = useMemo(() => Array.from({ length: 12 }, (_, i) => new PoolItem(-40 - i * 35, 'train')), []);
    const barriers = useMemo(() => Array.from({ length: 15 }, (_, i) => new PoolItem(-30 - i * 25, 'barrier')), []);
    const coins = useMemo(() => Array.from({ length: 60 }, (_, i) => new PoolItem(-15 - i * 8, 'coin')), []);

    const status = useGameStore(s => s.status);
    const currentLevel = useGameStore(s => s.currentLevel);

    const sleepersSpacing = 5.0; // Distance between wooden sleeper planks
    const wallUnitDepth = 10.0; // Spacing between wall blocks (corresponds to ProceduralSubwayElement's depth)

    useEffect(() => {
        if (status === 'playing') {
            const currentLvl = useGameStore.getState().currentLevel;
            const diff = getLevelDifficulty(currentLvl);
            const factor = diff.obstacleSpacingFactor;

            trains.forEach((t, i) => {
                t.reset((-40 - i * 35) * factor);
            });
            barriers.forEach((b, i) => {
                b.reset((-30 - i * 25) * factor);
                
                // Avoid spawning inside trains!
                let overlap = true;
                let attempts = 0;
                while (overlap && attempts < 5) {
                    overlap = false;
                    for (let j = 0; j < trains.length; j++) {
                        if (trains[j].lane === b.lane && Math.abs(trains[j].z - b.z) < 16) {
                            overlap = true;
                            b.lane = (b.lane === 1) ? -1 : b.lane + 1; 
                            break;
                        }
                    }
                    if (overlap && attempts === 3) {
                        b.z -= 25; // if changing lanes doesn't work, push it back
                    }
                    attempts++;
                }
            });
            coins.forEach((c, i) => {
                c.reset((-15 - i * 8) * factor);
            });
        }
    }, [status, trains, barriers, coins]);

    // Track the dynamic player's Z coordinate
    const playerZ = engineState.playerZ || 0;

    useFrame((_, delta) => {
        if (useGameStore.getState().status !== 'playing') return;

        const currentLvl = useGameStore.getState().currentLevel;
        const difficulty = getLevelDifficulty(currentLvl);
        const factor = difficulty.obstacleSpacingFactor;

        const speed = engineState.speed;
        const pz = engineState.playerZ;
        const px = engineState.playerX;
        const py = engineState.playerY; // Ground level is 0

        // Populate active pools into engineState dynamically for cop AI tracking
        (engineState as any).activeTrains = trains;
        (engineState as any).activeBarriers = barriers;

        // Calculate dynamic train floor height so the player can land on/walk on top of trains smoothly
        let activeTrainFloorY = 0;
        trains.forEach((t) => {
            if (t.lane === engineState.playerLane) {
                // Main body of the train is roughly from t.z - 10.5 to t.z + 10.5
                if (pz > t.z - 10.5 && pz < t.z + 10.5) {
                    // Only let them stand on the roof if they are already near roof height
                    // This prevents teleporting to the roof when switching lanes into the side of a train at ground level!
                    if (engineState.playerY >= 1.8) {
                        activeTrainFloorY = 2.8; 
                    }
                } 
            }
        });
        engineState.trainFloorY = activeTrainFloorY;

        const time = Date.now();
        const magnetForce = (engineState.magnetActiveUntil > time);

        // -------------
        // TRAINS (Using double-layer fallback for stability)
        // -------------
        trains.forEach((t) => {
            if (t.type === 'moving') {
                // Oncoming train moves in the positive Z direction relative to the world
                t.z += (20 + difficulty.trainSpeedBonus) * delta;
            }
            
            // Recycle behind the camera
            if (t.z > pz + 15) {
                t.reset(pz - (150 + Math.random() * 80) * factor);
            }

            // Collision checks (Width 2.2, Height 3, Length 21) utilizing relative Z coordinates!
            if (Math.abs(t.z - pz) < 10.5 && Math.abs(t.lane * LANE_WIDTH - px) < 1.0) {
                // The player jumps on top of the train if they are high enough, 
                // but if they hit the sides or front without being high enough, it's a crash!
                if (py < 2.5 && activeTrainFloorY === 0) { 
                    const isInvincible = (engineState.invincibleUntil > time);
                    const isHoverboard = (engineState.hoverboardActiveUntil > time);
                    
                    if (isInvincible) {
                        // Safe! Pass through
                    } else if (isHoverboard) {
                        // Shield rescue mechanics!
                        engineState.hoverboardActiveUntil = 0;
                        engineState.invincibleUntil = time + 1500; // 1.5s buffer
                        t.reset(pz - (150 + Math.random() * 80) * factor); // clear the track
                        if (useGameStore.getState().soundEnabled) AudioEngine.playGlassShatter();
                    } else {
                        useGameStore.getState().setStatus('gameover');
                        engineState.speed = 0;
                        if (useGameStore.getState().soundEnabled) AudioEngine.playGameOver();
                    }
                }
            }
        });

        // -------------
        // BARRIERS (Subway Barricades)
        // -------------
        barriers.forEach((b) => {
            // Static barriers stay static! No movement added in world coordinates.
            
            // Recycle behind the camera
            if (b.z > pz + 15) {
                b.reset(pz - (150 + Math.random() * 50) * factor);
                
                // Avoid spawning inside trains!
                let overlap = true;
                let attempts = 0;
                while (overlap && attempts < 5) {
                    overlap = false;
                    for (let j = 0; j < trains.length; j++) {
                        if (trains[j].lane === b.lane && Math.abs(trains[j].z - b.z) < 16) {
                            overlap = true;
                            b.lane = (b.lane === 1) ? -1 : b.lane + 1;
                            break;
                        }
                    }
                    if (overlap && attempts === 3) {
                        b.z -= 25; // if changing lanes doesn't work, push it back
                    }
                    attempts++;
                }
            }

            // Barrier Hurdles Collision checking utilizing relative Z coordinates!
            if (Math.abs(b.z - pz) < 1.0 && Math.abs(b.lane * LANE_WIDTH - px) < 1.0) {
                let didCrash = false;
                
                // Normal barrier: must jump over (py > 1.3) or slide (engineState.isSliding === true)
                if (py < 1.3 && !engineState.isSliding) didCrash = true;

                if (didCrash) {
                    const isInvincible = (engineState.invincibleUntil > time);
                    const isHoverboard = (engineState.hoverboardActiveUntil > time);
                    
                    if (isInvincible) {
                        // Pass through
                    } else if (isHoverboard) {
                        // Shield rescue mechanics!
                        engineState.hoverboardActiveUntil = 0;
                        engineState.invincibleUntil = time + 1500; // 1.5s buffer
                        b.reset(pz - (150 + Math.random() * 50) * factor); // clear the track
                        if (useGameStore.getState().soundEnabled) AudioEngine.playGlassShatter();
                    } else {
                        useGameStore.getState().setStatus('gameover');
                        engineState.speed = 0;
                        if (useGameStore.getState().soundEnabled) AudioEngine.playGameOver();
                    }
                }
            }
        });

        // -------------
        // COINS (Subway Gold Coins & Magnets)
        // -------------
        const isMagnetChar = useGameStore.getState().selectedCharacter === 'magnet';
        const isAirplane = useGameStore.getState().selectedCharacter === 'airplane';
        const isJetpackActive = (engineState.jetpackActiveUntil > time);
        const shouldAttract = magnetForce || isAirplane || isJetpackActive || isMagnetChar;

        // -------------
        // MAGIC WALL (Spawned on jump)
        // -------------
        if (engineState.magicWallActive) {
            // Because they spawn ahead, they move toward player just like barriers, but they don't move in Z, player does.
            if (engineState.magicWallZ > pz + 15) {
                engineState.magicWallActive = false;
            } else {
                if (Math.abs(engineState.magicWallZ - pz) < 1.0 && Math.abs(engineState.magicWallLane * LANE_WIDTH - px) < 1.0) {
                    if (py > 6.0) { // Only crash if the player is up in the air (using Jetpack)
                        const isInvincible = (engineState.invincibleUntil > time);
                        const isHoverboard = (engineState.hoverboardActiveUntil > time);
                        
                        if (isInvincible) {
                        } else if (isHoverboard) {
                            engineState.hoverboardActiveUntil = 0;
                            engineState.invincibleUntil = time + 1500; 
                            engineState.magicWallActive = false;
                            if (useGameStore.getState().soundEnabled) AudioEngine.playGlassShatter();
                        } else {
                            useGameStore.getState().setStatus('gameover');
                            engineState.speed = 0;
                            if (useGameStore.getState().soundEnabled) AudioEngine.playGameOver();
                        }
                    }
                }
            }
        }

        coins.forEach((c) => {
            if (!c.collected) {
                // Smooth magnet attraction logic
                const isItemNormalCoin = c.type === 'normal' || c.type === 'gem';
                if (isItemNormalCoin && shouldAttract && c.z < pz + 2.0 && c.z > pz - 35.0) {
                    // Fly towards player coordinate along both X and Z dimensions!
                    const zDiff = pz - c.z;
                    c.z += zDiff * 12.0 * delta;
                    
                    // Pull lane smoothly towards player x coordinate
                    const currentX = c.lane * LANE_WIDTH;
                    const diff = px - currentX;
                    c.lane += (diff / LANE_WIDTH) * 12.0 * delta;
                    c.isMagnated = true;
                }
                
                // Recycle behind the camera
                if (c.z > pz + 15) {
                    c.reset(pz - (50 + Math.random() * 30) * factor);
                }

                // Collect collision check 
                if (Math.abs(c.z - pz) < 1.5 && Math.abs(c.lane * LANE_WIDTH - px) < 1.5) {
                    let trainHeight = 0;
                    for (let i = 0; i < trains.length; i++) {
                        const t = trains[i];
                        if (t.lane === Math.round(c.lane) && Math.abs(t.z - c.z) < 10.5) {
                            trainHeight = 2.8;
                            break;
                        }
                    }
                    const coinRenderY = c.isMagnated ? py : (trainHeight > 0 ? trainHeight + 0.45 : 0.45);
                    if (Math.abs(coinRenderY - py) < 4.0) { // Large vertical margin so players collect even while dropping onto a train
                        c.collected = true;
                        c.scaleY = 2.0; // trigger sparks scale
                        
                        const state = useGameStore.getState();
                        const isGoldDouble = state.selectedCharacter === 'gold';

                        if (c.type === 'magnet_power') { 
                            const level = state.magnetUpgradeLevel || 1;
                            const duration = 8000 + (level - 1) * 2000;
                            engineState.magnetActiveUntil = Date.now() + duration;
                            if (state.soundEnabled) AudioEngine.playMagnetActivate();
                        } else if (c.type === 'hoverboard_power') {
                            // Boost hoverboard stock inside store and turn on for 15s instantly!
                            useGameStore.setState((s) => ({ hoverboards: s.hoverboards + 1 }));
                            engineState.hoverboardActiveUntil = Date.now() + 15000;
                            if (state.soundEnabled) AudioEngine.playMagnetActivate();
                        } else if (c.type === 'sneakers_power') {
                            // Turn on Super Sneakers for 15s!
                            const level = state.sneakersUpgradeLevel || 1;
                            const duration = 15000 + (level - 1) * 3000;
                            engineState.sneakersActiveUntil = Date.now() + duration;
                            if (state.soundEnabled) AudioEngine.playJump();
                        } else if (c.type === 'jetpack_power') {
                            // Jetpack disabled - give extra coin reward instead
                            const coinReward = isGoldDouble ? 20 : 10;
                            state.incCoins(coinReward);
                            if (state.soundEnabled) AudioEngine.playCoinCollect();
                        } else if (c.type === 'gem') {
                            const coinReward = isGoldDouble ? 10 : 5;
                            state.incCoins(coinReward);
                            if (state.soundEnabled) AudioEngine.playCoinCollect();
                        } else if (c.type === 'star') {
                            const scoreReward = state.selectedCharacter === 'phantom_star' ? 150 : 100;
                            state.incScore(scoreReward);
                            if (state.soundEnabled) AudioEngine.playJump();
                        } else {
                            const coinReward = isGoldDouble ? 2 : 1;
                            state.incCoins(coinReward);
                            if (state.soundEnabled) AudioEngine.playCoinCollect();
                        }
                    }
                }
            } else if (c.scaleY > 0) {
                // Shrinking collected coin animation (it stays static in place)
                c.scaleY -= delta * 5.0; // scale down
            }
        });

        // -------------
        // INFINITE RUN ENGINE HANDLING
        // -------------
        const currentScore = useGameStore.getState().score;
        let scoreRate = speed * delta * 0.1;
        if (useGameStore.getState().selectedCharacter === 'phantom_star') {
            scoreRate *= 1.5; // Astro has 1.5x score acceleration multiplier
        }
        useGameStore.getState().incScore(scoreRate);

        if (engineState.playerZ < engineState.nextGateZ) {
            engineState.nextGateZ -= 500;
            useGameStore.getState().setCurrentLevel(currentLvl + 1);
            if (useGameStore.getState().soundEnabled) AudioEngine.playMagnetActivate();
        }

        if (engineState.speed < engineState.maxSpeed) {
            engineState.speed += delta * difficulty.accel; // gradually speed up over time
        }
    });

    const themeIndex = (currentLevel - 1) % 4;

    // Quantized base coordinates so sleepers and walls appear stationary and endless
    const baseSleeperZ = Math.floor(playerZ / sleepersSpacing) * sleepersSpacing;
    const baseWallZ = Math.floor(playerZ / wallUnitDepth) * wallUnitDepth;

    const visibleSleepersOffset = useMemo(() => {
        const arr = [];
        for (let offset = 20; offset >= -2000; offset -= sleepersSpacing) {
            arr.push(offset);
        }
        return arr;
    }, []);

    const visibleWallsOffset = useMemo(() => {
        const arr = [];
        for (let offset = 30; offset >= -2000; offset -= wallUnitDepth) {
            arr.push(offset);
        }
        return arr;
    }, []);

    return (
        <group>
            {/* Bright sunny daylight ambiance */}
            <hemisphereLight color="#ffffff" groundColor="#444444" intensity={0.4} />
            <directionalLight position={[10, 20, 10]} intensity={0.5} color="#fdfaed" />

            {/* Render infinite railroad sleepers tracks around player's quantized coordinate */}
            <group position={[0, 0, 0]}>
                {visibleSleepersOffset.map((offset) => {
                    const sleeperZ = baseSleeperZ + offset;
                    const diff = playerZ - sleeperZ;
                    // High-performance culling: skip rendering if behind player or beyond visual horizon (up to 2000 units)
                    if (diff < -15 || diff > 2000) return null;
                    return (
                        <SleeperItem key={`s-${offset}`} sleeperZ={sleeperZ} />
                    );
                })}

                {/* Constant Ground Rails steel bars running infinitely up to 2000 units */}
                {[-LANE_WIDTH, 0, LANE_WIDTH].map((laneX) => (
                    <group key={laneX}>
                        {/* Track runway path under rails for professional aesthetics */}
                        <mesh position={[laneX, 0.005, baseWallZ - 985]} receiveShadow>
                            <boxGeometry args={[1.5, 0.02, 2030]} />
                            <meshStandardMaterial 
                                color={
                                    themeIndex === 1 ? "#14532d" : // deep forest green bed
                                    themeIndex === 2 ? "#7c2d12" : // red-orange canyon bed
                                    themeIndex === 3 ? "#cbd5e1" : // snowy slate-blue bed
                                    "#1e293b" // haunted path bed
                                }
                                roughness={0.85}
                                metalness={0.15}
                            />
                        </mesh>
                        {/* Left Rail */}
                        <mesh position={[laneX - 0.65, 0.14, baseWallZ - 985]} receiveShadow>
                            <boxGeometry args={[0.08, 0.2, 2030]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
                        </mesh>
                        {/* Right Rail */}
                        <mesh position={[laneX + 0.65, 0.14, baseWallZ - 985]} receiveShadow>
                            <boxGeometry args={[0.08, 0.2, 2030]} />
                            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.25} />
                        </mesh>
                    </group>
                ))}

                {/* Lane divider dashed-looking stripes at X = -1.25 and X = 1.25 */}
                {[-1.25, 1.25].map((dividerX, i) => (
                    <mesh key={`divider-${i}`} position={[dividerX, 0.015, baseWallZ - 985]} receiveShadow>
                        <boxGeometry args={[0.08, 0.012, 2030]} />
                        <meshStandardMaterial 
                            color={
                                themeIndex === 2 ? "#fbbf24" : // amber for sunset
                                themeIndex === 1 ? "#22c55e" : // vibrant green for forest
                                themeIndex === 3 ? "#38bdf8" : // icy light-blue for snow
                                "#ffffff" // crisp white for city subway
                            }
                            emissive={
                                themeIndex === 3 ? "#38bdf8" :
                                themeIndex === 2 ? "#fbbf24" :
                                undefined
                            }
                            emissiveIntensity={0.2}
                        />
                    </mesh>
                ))}
            </group>

            {/* Render Train Models (Dual layout fallback: Preloaded GLB -> Procedural Subway train) */}
            {trains.map((t, idx) => (
                <TrainItem key={`t-${idx}`} item={t} index={idx} isCarriage={idx % 2 === 0} />
            ))}

            {/* Render Subway Warn Striped Barricades */}
            {barriers.map((b, idx) => (
                <BarrierItem key={`b-${idx}`} item={b} />
            ))}

            {/* Render Aerial Magic Wall (for Jetpack obstacle dodging) */}
            {engineState.magicWallActive && (
                <group position={[engineState.magicWallLane * LANE_WIDTH, 8.5, engineState.magicWallZ]}>
                    <mesh position={[0, 0, 0]} castShadow>
                        <boxGeometry args={[LANE_WIDTH - 0.2, 5.0, 0.5]} />
                        <meshStandardMaterial color="#8b0000" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, 0.26]}>
                        <boxGeometry args={[LANE_WIDTH - 0.3, 4.9, 0.01]} />
                        <meshStandardMaterial color="#ff0000" emissive="#cc0000" emissiveIntensity={0.5} wireframe />
                    </mesh>
                </group>
            )}

            {/* Render Collectible Gold Spinning Coins */}
            {coins.map((c, idx) => (
                <CoinItem key={`c-${idx}`} item={c} trains={trains} />
            ))}

            {/* Render Theme Gate for entering next level / theme in infinite loop */}
            <group position={[5.5, 0, engineState.nextGateZ]}>
                {/* Beautiful Miniature Gate on the side */}
                <mesh position={[-1.2, 1.5, 0]} castShadow>
                     <cylinderGeometry args={[0.15, 0.15, 3]} />
                     <meshStandardMaterial color="#fcd34d" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[1.2, 1.5, 0]} castShadow>
                     <cylinderGeometry args={[0.15, 0.15, 3]} />
                     <meshStandardMaterial color="#fcd34d" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 3.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                     <cylinderGeometry args={[0.18, 0.18, 2.7]} />
                     <meshStandardMaterial color="#fbbf24" metalness={1.0} roughness={0.1} />
                </mesh>
                {/* Ornate Arch Top Gem */}
                <mesh position={[0, 3.4, 0]} castShadow>
                     <octahedronGeometry args={[0.4, 0]} />
                     <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.1} emissive="#0ea5e9" emissiveIntensity={0.8} />
                </mesh>
                {/* Glowing portal interior */}
                <mesh position={[0, 1.5, 0]}>
                    <planeGeometry args={[2.2, 3]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                </mesh>
                {/* Mystical Floating Rings inside */}
                <group position={[0, 1.5, 0.1]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.6, 0.05, 16, 32]} />
                        <meshBasicMaterial color="#a78bfa" transparent opacity={0.8} />
                    </mesh>
                    <mesh rotation={[Math.PI / 4, 0, 0]}>
                        <torusGeometry args={[0.4, 0.03, 16, 32]} />
                        <meshBasicMaterial color="#60a5fa" transparent opacity={0.9} />
                    </mesh>
                </group>
                <pointLight position={[0, 1.5, 0]} distance={10} intensity={2} color="#38bdf8" />
            </group>

            {/* Render Sliding Subway Environment Wall panels with active distance culling */}
            {visibleWallsOffset.map((offset, idx) => {
                const wallZ = baseWallZ + offset;
                const diff = playerZ - wallZ;
                // High-performance culling: skip rendering if behind player or hidden by distant fog (up to 2000 units)
                if (diff < -20 || diff > 2000) return null;
                return (
                    <WallItem 
                        key={`w-${offset}`} 
                        wallZ={wallZ} 
                        index={Math.floor((baseWallZ + offset) / wallUnitDepth)} 
                        simplified={diff > 180} 
                    />
                );
            })}

            {/* Street trackbed ground platform adaptively styled by theme, drawing seamless 2000 units path */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, baseWallZ - 985]} receiveShadow>
                <planeGeometry args={[15, 2030]} />
                <meshStandardMaterial 
                    color={
                        themeIndex === 1 ? "#15803d" : // Deep Forest Path Grass green for Level 2
                        themeIndex === 2 ? "#b45309" : // Terracotta canyon orange for Level 3
                        themeIndex === 3 ? "#f8fafc" : // Pure winter snow white for Level 4
                        "#334155" // haunted path
                    } 
                    roughness={0.9} 
                    metalness={0.1} 
                />
            </mesh>
        </group>
    );
}
