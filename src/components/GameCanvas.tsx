import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Player, EnemyChaser, GlassShatter } from './Player';
import { WorldItems } from './WorldItems';
import { useGameStore } from '../store/gameStore';
import { Skybox } from './Skybox';

// Simple placeholder fallback to render while high-quality 3D models load
function LoadingPlaceholder() {
    return (
        <group>
            {/* Ambient light for draft scene */}
            <ambientLight intensity={0.5} />
            {/* Draw draft railroad beds in place of GLTFs */}
            {[-2.5, 0, 2.5].map((laneX) => (
                <mesh key={laneX} position={[laneX, 0.5, -20]} castShadow>
                     <boxGeometry args={[2.0, 1.0, 6.0]} />
                     <meshStandardMaterial color="#334155" roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

export function GameCanvas() {
    const currentLevel = useGameStore(s => s.currentLevel);
    const shadowResolution = useGameStore(s => s.shadowResolution);
    const resolutionScale = useGameStore(s => s.resolutionScale);
    const themeIndex = (currentLevel - 1) % 4;

    // Setting up gorgeous custom sky & fog settings dynamically
    const fogColor = 
        themeIndex === 1 ? '#bbf7d0' : // Soft green forest park fog
        themeIndex === 2 ? '#ffedd5' : // Warm desert orange sunrise fog
        themeIndex === 3 ? '#f1f5f9' : // Frosty white mountain tundra fog
        '#64748b'; // Moody haunted fog

    const ambientColor = 
        themeIndex === 1 ? '#dcfce7' : // Soft green tinted daylight
        themeIndex === 2 ? '#ffedd5' : // Warm sunset glow
        themeIndex === 3 ? '#f1f5f9' : // Bright ice reflection
        '#64748b'; // Haunted

    const sunColor = 
        themeIndex === 1 ? '#ffffff' :
        themeIndex === 2 ? '#fdba74' : // Amber sandstone rays
        themeIndex === 3 ? '#ffffff' :
        '#ffffff';

    const ambientIntensity = 1.4;

    const sunIntensity = 
        themeIndex === 0 ? 1.5 : // Dimmer for haunted
        2.4; // Increased from 2.0 to 2.4 for general sunny brightness

    return (
        <div className="w-full h-full absolute inset-0 pointer-events-auto">
            <Canvas 
                camera={{ position: [0, 6.5, 11], fov: 65, rotation: [-0.15, 0, 0] }} 
                shadows 
                dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2.5)]}
                gl={{ alpha: true, antialias: true, logarithmicDepthBuffer: false }}
            >
                {/* Background Skybox System */}
                <Skybox />

                {/* Clear blue sky daylight illumination */}
                <ambientLight intensity={ambientIntensity} color={ambientColor} />
                
                {/* Main directional afternoon sunlight with reactive shadow-map resizing key */}
                <directionalLight 
                    key={`sun-light-shadow-${shadowResolution}`}
                    position={[15, 25, 8]} 
                    color={sunColor}
                    intensity={sunIntensity} 
                    castShadow 
                    shadow-camera-left={-25}
                    shadow-camera-right={25}
                    shadow-camera-top={25}
                    shadow-camera-bottom={-25}
                    shadow-camera-far={120}
                    shadow-mapSize={[shadowResolution, shadowResolution]}
                />

                <Player />
                <EnemyChaser />
                <GlassShatter />

                <WorldItems />

                {/* Premium high-clarity distant horizon fog */}
                <fog attach="fog" args={[fogColor, 50, 320]} />
            </Canvas>
        </div>
    );
}
