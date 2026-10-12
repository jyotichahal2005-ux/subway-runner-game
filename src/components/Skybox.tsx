import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";

export function Skybox() {
  const currentLevel = useGameStore((s) => s.currentLevel);
  const skyboxStyle = useGameStore((s) => s.skyboxStyle);

  // Determine active skybox theme
  const activeStyle = skyboxStyle === "auto" 
    ? (["spooky", "forest", "sunset", "cyberpunk", "frosty"][(currentLevel - 1) % 5] || "spooky")
    : skyboxStyle;

  // Twinkling stars reference
  const starsRef = useRef<THREE.Group>(null);
  const skyDomeRef = useRef<THREE.Mesh>(null);

  // Generate 120 star coordinates for the nighttime / cyberpunk / sunset skyboxes
  const starsData = useMemo(() => {
    const points: [number, number, number, number][] = [];
    for (let i = 0; i < 150; i++) {
      // Uniform distribution on a hemisphere radius 250
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random()); // upper hemisphere only
      const r = 240;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) + 10; // keep stars above ground level
      const z = r * Math.sin(phi) * Math.sin(theta);
      const size = 0.2 + Math.random() * 0.4;
      points.push([x, y, z, size]);
    }
    return points;
  }, []);

  // Soft drifting clouds
  const cloudsData = useMemo(() => {
    const clouds: { pos: [number, number, number]; scale: [number, number, number]; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({
        pos: [
          (Math.random() - 0.5) * 160,
          30 + Math.random() * 20,
          -120 - Math.random() * 100,
        ],
        scale: [
          15 + Math.random() * 15,
          5 + Math.random() * 5,
          8 + Math.random() * 8,
        ],
        speed: 0.1 + Math.random() * 0.15,
      });
    }
    return clouds;
  }, []);

  // Compute theme colors for the sky dome
  // [Zenith sky, Horizon sky, cloud color, stars intensity]
  const themeColors = useMemo(() => {
    switch (activeStyle) {
      case "forest":
        return {
          zenith: "#bbf7d0",
          horizon: "#86efac",
          cloud: "#e8fdf2",
          starAlpha: 0.0,
          showGrid: false,
        };
      case "sunset":
        return {
          zenith: "#311042",
          horizon: "#ff7e5f",
          cloud: "#fed7aa",
          starAlpha: 0.85,
          showGrid: false,
        };
      case "cyberpunk":
        return {
          zenith: "#082f49", // Deep matrix-style night forest green
          horizon: "#38bdf8", // Beautiful bright cyber-green horizon glow
          cloud: "#075985", // Glowing dark emerald clouds
          starAlpha: 1.0,
          showGrid: true,
        };
      case "frosty":
        return {
          zenith: "#0f172a",
          horizon: "#bae6fd",
          cloud: "#f1f5f9",
          starAlpha: 0.5,
          showGrid: false,
        };
      case "spooky":
      default:
        return {
          zenith: "#0f172a", // Dark slate
          horizon: "#334155", // Moody grey-blue
          cloud: "#64748b", // Grey ghost clouds
          starAlpha: 0.1,
          showGrid: false,
        };
    }
  }, [activeStyle]);

  // Create customized dome shader material to draw natural zenith/horizon gradient
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uZenithColor: { value: new THREE.Color(themeColors.zenith) },
        uHorizonColor: { value: new THREE.Color(themeColors.horizon) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        void main() {
          // Normalize height to coordinate gradient between horizon and zenith dome top
          float height = normalize(vWorldPosition).y;
          float factor = clamp(height * 2.5 + 0.1, 0.0, 1.0);
          vec3 skyColor = mix(uHorizonColor, uZenithColor, factor);
          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }, [themeColors]);

  // Handle dynamic stars twinkle and cloud motion drifting loop!
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Twinkle stars by pulsing scaling factors in our stars group mesh
    if (starsRef.current) {
      const alpha = themeColors.starAlpha;
      starsRef.current.position.z = (state.camera.position.z * 0.98); // follow camera slightly so stars stay infinitely far away
      starsRef.current.children.forEach((child, index) => {
        const pulse = 0.55 + 0.45 * Math.sin(time * 2.5 + index);
        child.scale.setScalar(pulse);
        // Fade out stars when we don't have enough night atmosphere
        if (child instanceof THREE.Mesh && child.material) {
          (child.material as THREE.MeshBasicMaterial).opacity = pulse * alpha;
        }
      });
    }

    // 2. Keep skydome centered closely relative to player coordinate to create infinite skyline illusion
    if (skyDomeRef.current) {
      skyDomeRef.current.position.set(0, -20, state.camera.position.z - 40);
    }
  });

  return (
    <group>
      {/* 1. Giant Enclosing Sky Dome Mesh */}
      <mesh ref={skyDomeRef} geometry={useMemo(() => new THREE.SphereGeometry(250, 32, 16), [])} material={shaderMaterial} />

      {/* 2. Procedural Glowing Stars */}
      <group ref={starsRef}>
        {themeColors.starAlpha > 0 && starsData.map(([x, y, z, size], idx) => (
          <mesh key={`star-${idx}`} position={[x, y, z]}>
            <sphereGeometry args={[size, 4, 4]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={themeColors.starAlpha} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* 3. Volumetric Floating Skyline Clouds */}
      <group>
        {cloudsData.map((cloud, idx) => (
          <mesh 
            key={`cloud-${idx}`} 
            position={[cloud.pos[0], cloud.pos[1], cloud.pos[2]]}
            scale={cloud.scale as [number, number, number]}
          >
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial 
              color={themeColors.cloud} 
              roughness={0.9} 
              metalness={0.0}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
