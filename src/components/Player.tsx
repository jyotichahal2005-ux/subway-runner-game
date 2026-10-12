import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { engineState, useGameStore } from "../store/gameStore";
import { useGLTF, useAnimations } from "@react-three/drei";

import { AudioEngine } from "../lib/audioEngine";

function ManModel() {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations, scene } = useGLTF("/Man.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Try to play the first animation, which is likely 'run'
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0) {
      // Find one that sounds like 'run' or just play the first
      const runActionName =
        actionNames.find((n) => n.toLowerCase().includes("run")) ||
        actionNames[0];
      const action = actions[runActionName];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [actions]);

  return (
    <primitive
      object={scene}
      ref={group}
      dispose={null}
      position={[0, -0.7, 0]}
      scale={[0.4, 0.4, 0.4]}
      rotation={[0, Math.PI, 0]}
    />
  );
}

// Preload
useGLTF.preload("/Man.glb");

function AirplaneModel() {
  const propRef = useRef<THREE.Group>(null);
  const leftSmokeRef = useRef<THREE.Mesh>(null);
  const rightSmokeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (propRef.current) {
      propRef.current.rotation.z += 25 * delta;
    }
    const t = state.clock.getElapsedTime();
    if (leftSmokeRef.current && rightSmokeRef.current) {
      const scale = 1 + Math.sin(t * 30) * 0.15;
      leftSmokeRef.current.scale.set(scale, 1.5 + Math.sin(t * 15) * 0.3, scale);
      rightSmokeRef.current.scale.set(scale, 1.5 + Math.sin(t * 15) * 0.3, scale);
    }
  });

  return (
    <group position={[0, 0.1, 0]}>
      {/* Fuselage - metallic silver and racing sky blue streak */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.13, 1.5, 16]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Nose cone - silver pointing forward */}
      <mesh castShadow position={[0, 0, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.3, 16]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.7} />
      </mesh>

      {/* Canopy / Cockpit glass */}
      <mesh position={[0, 0.15, -0.3]} scale={[1, 0.8, 1.6]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.0} metalness={0.9} transparent opacity={0.6} />
      </mesh>

      {/* Propeller hub and blades */}
      <group position={[0, 0, -1.06]} ref={propRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} />
        </mesh>
        {/* Blade 1 */}
        <mesh position={[0, 0.3, 0]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.6, 0.015]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Blade 2 */}
        <mesh position={[0, -0.3, 0]} rotation={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.6, 0.015]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      </group>

      {/* Left Wing */}
      <mesh position={[0.7, 0, -0.1]} rotation={[0, -0.15, 0.05]} castShadow>
        <boxGeometry args={[1.3, 0.03, 0.35]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Left wing navigaton light */}
      <mesh position={[1.35, 0.03, -0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.06]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Right Wing */}
      <mesh position={[-0.7, 0, -0.1]} rotation={[0, 0.15, -0.05]} castShadow>
        <boxGeometry args={[1.3, 0.03, 0.35]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Right wing navigation light */}
      <mesh position={[-1.35, 0.03, -0.1]}>
        <boxGeometry args={[0.03, 0.03, 0.06]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>

      {/* Tail fin (Vertical) */}
      <mesh position={[0, 0.25, 0.6]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.03, 0.4, 0.25]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>

      {/* Horizontal stabilizers */}
      <mesh position={[0.25, 0, 0.6]} rotation={[0, -0.1, 0.02]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.18]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>
      <mesh position={[-0.25, 0, 0.6]} rotation={[0, 0.1, -0.02]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.18]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} />
      </mesh>

      {/* Triple Thrusters under wings / tail */}
      <group position={[0, -0.05, 0.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.07, 0.2, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.12, 0]} ref={leftSmokeRef}>
          <coneGeometry args={[0.045, 0.25, 8]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      </group>
      
      <group position={[0.3, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.16, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.1, 0]} ref={rightSmokeRef}>
          <coneGeometry args={[0.04, 0.2, 8]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.7} />
        </mesh>
      </group>

      <group position={[-0.3, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.16, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <coneGeometry args={[0.04, 0.2, 8]} />
          <meshBasicMaterial color="#fb923c" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export function EnemyChaser() {
  const enemyRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const enemyY = useRef(0);
  const enemyYVel = useRef(0);

  useFrame((_, delta) => {
    if (!enemyRef.current || !modelRef.current) return;

    const status = useGameStore.getState().status;
    const targetX = engineState.playerLane * 2.5;

    // Follow player lane with easing
    if (status === "playing") {
      enemyRef.current.position.z = engineState.playerZ + 4.5; // Always behind player
      enemyRef.current.position.x +=
        (targetX - enemyRef.current.position.x) * 6 * delta;

      const copZ = enemyRef.current.position.z;
      const copLane = Math.min(1, Math.max(-1, Math.round(enemyRef.current.position.x / 2.5)));

      // 1. Determine active train floor under the cop
      let copTrainFloorY = 0;
      const activeTrains = (engineState as any).activeTrains;
      if (activeTrains) {
        activeTrains.forEach((t: any) => {
          if (t.lane === copLane) {
            // Main body of train is roughly t.z - 10.5 to t.z + 10.5
            if (copZ > t.z - 10.5 && copZ < t.z + 10.5) {
              if (enemyY.current >= 1.8) {
                copTrainFloorY = 2.8;
              }
            }
          }
        });
      }

      // 2. Decide if the cop needs to jump
      let shouldJump = false;

      // A. Train is approaching cop's lane (needs to climb up)
      if (activeTrains) {
        activeTrains.forEach((t: any) => {
          if (t.lane === copLane) {
            // Train front is around t.z + 10.5. Cop approaches t.z + 10.5 from the positive Z side (i.e. copZ > t.z + 10.5)
            if (copZ > t.z + 10.5 && copZ < t.z + 13.5) {
              shouldJump = true;
            }
          }
        });
      }

      // B. Barrier is approaching cop's lane
      const activeBarriers = (engineState as any).activeBarriers;
      if (activeBarriers) {
        activeBarriers.forEach((b: any) => {
          if (b.lane === copLane) {
            // Barrier is at b.z
            if (copZ > b.z && copZ < b.z + 3.5) {
              shouldJump = true;
            }
          }
        });
      }

      // C. Player is up high / jumping
      if (engineState.playerY > enemyY.current + 1.2) {
        if (Math.random() < 0.1) {
          shouldJump = true;
        }
      }

      // D. Jump kinematics
      if (shouldJump && enemyY.current <= copTrainFloorY + 0.05) {
        enemyYVel.current = 18; // Chunky cop jump velocity
      }

      enemyY.current += enemyYVel.current * delta;
      if (enemyY.current > copTrainFloorY) {
        enemyYVel.current -= 65 * delta; // Heavy responsive gravity
      } else {
        enemyY.current = copTrainFloorY;
        enemyYVel.current = 0;
      }

      enemyRef.current.position.y = enemyY.current;

      // Run animation bobbing
      modelRef.current.position.y =
        Math.abs(Math.sin(_.clock.elapsedTime * 15)) * 0.15;
      modelRef.current.rotation.y =
        (targetX - enemyRef.current.position.x) * -0.2; // lean into turns
      modelRef.current.rotation.z =
        (targetX - enemyRef.current.position.x) * -0.1; // lean into turns
    } else if (status === "gameover") {
      // Run past them on game over
      enemyRef.current.position.z -= 10 * delta;
      enemyY.current += enemyYVel.current * delta;
      if (enemyY.current > 0) {
        enemyYVel.current -= 65 * delta;
      } else {
        enemyY.current = 0;
        enemyYVel.current = 0;
      }
      enemyRef.current.position.y = enemyY.current;
    } else {
      enemyRef.current.position.z = 10; // Hide
      enemyY.current = 0;
      enemyYVel.current = 0;
      enemyRef.current.position.y = 0;
    }
  });

  return (
    <group ref={enemyRef} position={[0, 0, 10]}>
      <group ref={modelRef} position={[0, 0, 0]}>
        {/* Potbelly (Mota) Inspector Torso & Clothes */}
        {/* Main Chest - Blue Guard Shirt */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.52, 0.75, 12]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} /> {/* Police deep blue */}
        </mesh>
        
        {/* Round Protruding Belly */}
        <mesh position={[0, 1.1, -0.22]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>

        {/* Heavy Black Waist Belt */}
        <mesh position={[0, 0.8, -0.01]} castShadow>
          <boxGeometry args={[0.9, 0.1, 0.82]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>

        {/* Shiny Golden Belt Buckle */}
        <mesh position={[0, 0.8, -0.42]} castShadow>
          <boxGeometry args={[0.18, 0.14, 0.05]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Reaching Stout Arms */}
        {/* Left Arm */}
        <mesh position={[-0.45, 1.25, -0.2]} rotation={[-1.0, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>
        {/* Left Hand */}
        <mesh position={[-0.45, 1.45, -0.42]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="#fca5a5" roughness={0.5} /> {/* Skin */}
        </mesh>

        {/* Right Arm */}
        <mesh position={[0.45, 1.25, -0.2]} rotation={[-1.0, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.1, 0.08, 0.5, 8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
        </mesh>
        {/* Right Hand */}
        <mesh position={[0.45, 1.45, -0.42]} castShadow>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="#fca5a5" roughness={0.5} /> {/* Skin */}
        </mesh>

        {/* Human Face Details (Insaan jaisa face) */}
        {/* Main Skin Head */}
        <mesh position={[0, 1.62, 0]} castShadow>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial color="#fca5a5" roughness={0.5} /> {/* Flesh peachy skin */}
        </mesh>

        {/* Double Chin / Chubby Chin */}
        <mesh position={[0, 1.38, -0.05]} castShadow>
          <boxGeometry args={[0.38, 0.1, 0.38]} />
          <meshStandardMaterial color="#fca5a5" roughness={0.5} />
        </mesh>

        {/* Human Ears */}
        {/* Left Ear */}
        <mesh position={[-0.22, 1.62, 0]}>
          <boxGeometry args={[0.04, 0.09, 0.06]} />
          <meshStandardMaterial color="#fca5a5" />
        </mesh>
        {/* Right Ear */}
        <mesh position={[0.22, 1.62, 0]}>
          <boxGeometry args={[0.04, 0.09, 0.06]} />
          <meshStandardMaterial color="#fca5a5" />
        </mesh>

        {/* Human Expression: White Eyes & Pupils */}
        {/* Left Eye White */}
        <mesh position={[-0.1, 1.70, -0.215]}>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Left Pupil */}
        <mesh position={[-0.1, 1.70, -0.222]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Right Eye White */}
        <mesh position={[0.1, 1.70, -0.215]}>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Right Pupil */}
        <mesh position={[0.1, 1.70, -0.222]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Stout Human Nose */}
        <mesh position={[0, 1.62, -0.23]} castShadow>
          <boxGeometry args={[0.07, 0.09, 0.08]} />
          <meshStandardMaterial color="#f87171" roughness={0.5} />
        </mesh>

        {/* Black Bushy Mustache */}
        <mesh position={[0, 1.51, -0.23]} castShadow>
          <boxGeometry args={[0.24, 0.06, 0.06]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>

        {/* Open Shouting/Chasing Mouth */}
        <mesh position={[0, 1.45, -0.22]}>
          <boxGeometry args={[0.1, 0.04, 0.02]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>

        {/* Security / Police Cap */}
        {/* Hat Crown */}
        <mesh position={[0, 1.86, 0]} castShadow>
          <boxGeometry args={[0.46, 0.12, 0.46]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
        {/* Visor Brim */}
        <mesh position={[0, 1.82, -0.22]} castShadow>
          <boxGeometry args={[0.46, 0.03, 0.22]} />
          <meshStandardMaterial color="#111827" roughness={0.2} />
        </mesh>
        {/* Golden Hat Badge */}
        <mesh position={[0, 1.88, -0.235]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Stout short legs */}
        {/* Left Leg */}
        <mesh position={[-0.22, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} /> {/* Dark Pants */}
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.22, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.15, 0.8, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Large Black Policeman Boots */}
        <mesh position={[-0.22, 0.05, -0.06]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.28]} />
          <meshStandardMaterial color="#000000" roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0.05, -0.06]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.28]} />
          <meshStandardMaterial color="#000000" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export function GlassShatter() {
  const groupRef = useRef<THREE.Group>(null);
  const shards = useRef(
    Array.from({ length: 15 }).map(() => ({
      pos: new THREE.Vector3(
        -8 + (Math.random() - 0.5) * 2,
        4 + (Math.random() - 0.5) * 2,
        0,
      ),
      vel: new THREE.Vector3(
        Math.random() * 8 + 2,
        Math.random() * 5 - 2,
        (Math.random() - 0.5) * 4,
      ),
      rot: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
      rotSpeed: new THREE.Vector3(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
      ),
      scale: Math.random() * 0.4 + 0.1,
    })),
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const status = useGameStore.getState().status;
    if (status !== "playing") {
      groupRef.current.visible = false;
      return;
    }

    if (engineState.introProgress === 0) {
      // Reset
      shards.current.forEach((s) => {
        s.pos.set(
          -8 + (Math.random() - 0.5) * 2,
          4 + (Math.random() - 0.5) * 2,
          0,
        );
      });
      groupRef.current.visible = true;
    }

    if (
      engineState.introProgress > 0 &&
      engineState.introProgress < 1 &&
      groupRef.current.visible
    ) {
      groupRef.current.children.forEach((child, i) => {
        const s = shards.current[i];
        s.pos.add(s.vel.clone().multiplyScalar(delta));
        s.vel.y -= 20 * delta; // Gravity
        child.position.copy(s.pos);
        child.rotation.x += s.rotSpeed.x * delta;
        child.rotation.y += s.rotSpeed.y * delta;
        child.rotation.z += s.rotSpeed.z * delta;
      });
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {shards.current.map((s, i) => (
        <mesh key={i} position={s.pos} scale={s.scale}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            opacity={1}
            transparent
            roughness={0.1}
            thickness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const yVel = useRef(0);
  const modelRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const status = useGameStore.getState().status;
      if (status !== "playing") return;

      const key = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || key === "a") {
        engineState.playerLane = Math.max(-1, engineState.playerLane - 1);
      }
      if (e.key === "ArrowRight" || key === "d") {
        engineState.playerLane = Math.min(1, engineState.playerLane + 1);
      }
      // Enter, Shift, or H key triggers Hoverboard summon!
      if (e.key === "Enter" || e.key === "Shift" || key === "h") {
        const activated = useGameStore.getState().useHoverboard();
        if (activated && useGameStore.getState().soundEnabled) {
          AudioEngine.playMagnetActivate();
        }
      }

      if (engineState.introProgress < 1) return;
      if (e.key === "ArrowUp" || key === "w" || e.key === " ") {
        if (e.key === " ") {
          e.preventDefault(); // Prevent page scrolling
        }
        if (yVel.current === 0 && !engineState.isSliding) {
          const character = useGameStore.getState().selectedCharacter;
          const hasShoePowerup = engineState.sneakersActiveUntil > Date.now();
          const isSneakers = hasShoePowerup || character === "shoe";
          const baseJump = character === "hopper" ? 28 : 18; 
          yVel.current = isSneakers ? baseJump + 10 : baseJump;
          if (useGameStore.getState().soundEnabled) AudioEngine.playJump();
        }
      }
      if (e.key === "ArrowDown" || key === "s") {
        if (yVel.current === 0) {
          engineState.isSliding = true;
          setTimeout(() => {
            engineState.isSliding = false;
          }, 800);
        } else {
          yVel.current = -40; // fast fall to slide
          engineState.isSliding = true;
          setTimeout(() => {
            engineState.isSliding = false;
          }, 800);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Touch swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (useGameStore.getState().status !== "playing") return;
      const changeX = e.changedTouches[0].clientX - touchStartX;
      const changeY = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(changeX);
      const absY = Math.abs(changeY);

      if (Math.max(absX, absY) > 30) {
        if (absX > absY) {
          // Horizontal
          if (changeX > 0)
            engineState.playerLane = Math.min(1, engineState.playerLane + 1);
          else
            engineState.playerLane = Math.max(-1, engineState.playerLane - 1);
        } else {
          if (engineState.introProgress < 1) return;
          // Vertical
          if (
            changeY < 0 &&
            yVel.current === 0 &&
            !engineState.isSliding
          ) {
            const character = useGameStore.getState().selectedCharacter;
            const hasShoePowerup = engineState.sneakersActiveUntil > Date.now();
            const isSneakers = hasShoePowerup || character === "shoe";
            const baseJump = character === "hopper" ? 28 : 18;
            yVel.current = isSneakers ? baseJump + 10 : baseJump; // Jump
            if (useGameStore.getState().soundEnabled) AudioEngine.playJump();
            } else if (changeY > 0) {
            engineState.isSliding = true;
            setTimeout(() => {
              engineState.isSliding = false;
            }, 800);
            if (yVel.current !== 0) yVel.current = -40;
          }
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useFrame((state, delta) => {
    if (!playerRef.current || !modelRef.current) return;
    const status = useGameStore.getState().status;
    if (status === "paused") return;

    const targetX = engineState.playerLane * 2.5;

    // Intro animation
    if (engineState.introProgress < 1) {
      engineState.introProgress += delta * 1.5;
      if (engineState.introProgress > 1) {
        engineState.introProgress = 1;
        engineState.playerY = 0;
      }
      const p = engineState.introProgress;

      // Start from the side of the stage (e.g. jumping out of a building window)
      const startX = -8;
      const startY = 4;
      const startZ = 12;

      // Easing function for smoother landing (Ease Out Cubic)
      const easeP = 1 - Math.pow(1 - p, 3);

      playerRef.current.position.x = startX + (targetX - startX) * easeP;
      engineState.playerX = playerRef.current.position.x;
      playerRef.current.position.z = startZ * (1 - easeP);

      // Jump arc
      const arc = Math.sin(p * Math.PI);
      engineState.playerY = startY * (1 - p) + arc * 3;

      // Flip
      modelRef.current.rotation.x = (1 - p) * Math.PI * 4;
      engineState.playerZ = playerRef.current.position.z;
    } else {
      modelRef.current.rotation.x = 0;

      // X Lerp
      playerRef.current.position.x +=
        (targetX - playerRef.current.position.x) * 15 * delta;
      engineState.playerX = playerRef.current.position.x;

      // Gravity & Y Pos with dynamic train roof platform logic
      let currentFloor = 0;
      if (engineState.trainFloorY > 0) {
        // Automatically climb onto the train without needing to jump
        currentFloor = engineState.trainFloorY;
        if (engineState.playerY < currentFloor) {
          engineState.playerY = currentFloor;
          yVel.current = 0;
        }
      }

      engineState.playerY += yVel.current * delta;
      if (engineState.playerY > currentFloor) {
        yVel.current -= 80 * delta; // Heavy gravity for snappier jumps
      } else {
        engineState.playerY = currentFloor;
        yVel.current = 0;
      }

      if (status === "playing") {
        engineState.playerZ -= engineState.speed * delta;
      }
      playerRef.current.position.z = engineState.playerZ;
    }

    // Sliding Scale Y
    const targetScaleY = engineState.isSliding ? 0.5 : 1;
    modelRef.current.scale.y +=
      (targetScaleY - modelRef.current.scale.y) * 15 * delta;

    // When scaling down, adjusting position so it stays on floor
    const baseHeightCenter = 0.9;
    modelRef.current.position.y =
      engineState.playerY + baseHeightCenter * modelRef.current.scale.y;

    // Spin slightly while jumping if desired, or tilt when turning
    const tiltX = (targetX - playerRef.current.position.x) * -0.1;
    if (engineState.introProgress >= 1) {
      modelRef.current.rotation.z = tiltX;
    }

    // Let the camera follow the player seamlessly, with dynamic offsets that scale when flying high (e.g., jetpack)
    const pZ = playerRef.current.position.z;
    const pX = playerRef.current.position.x;
    const pY = engineState.playerY;
    
    // Check viewport dimensions to adapt camera dynamically for computer displays/widescreen panels
    const { width, height } = state.size;
    const aspect = width / height;

    // For better visibility on landscape displays (aspect >= 1.0, like computers & TV panels), 
    // we keep the camera closer (baseCamDepth = 7.5 instead of 11.0 / 14.2) and slightly lower (baseCamHeight = 4.5).
    // This allows the player to appear large, prominent, and highly distinguishable.
    // Crucially, we reduce camXFollow to 0.1 so the camera does not sway or slide wildly horizontal,
    // which makes the three lane tracks stable on the screen and lets the player visually change lanes clearly.
    const baseCamHeight = aspect >= 1.0 ? 4.5 : 4.8;
    const baseCamDepth = aspect >= 1.0 ? 7.5 : 8.5;
    const camXFollow = aspect >= 1.0 ? 0.1 : 0.15;
    const lookAtXFollow = aspect >= 1.0 ? 0.0 : 0.05;

    const zoomOutFactor = Math.min(1.0, Math.max(0, pY / 15)); // scales 0 to 1 as pY goes 0 to 15
    const targetCamHeight = pY + baseCamHeight + zoomOutFactor * 4.5;    // dynamic Y elevation
    const targetCamDepth = pZ + baseCamDepth + zoomOutFactor * 6.0;    // dynamic Z distance
    const targetCamX = pX * camXFollow;

    state.camera.position.x += (targetCamX - state.camera.position.x) * 10 * delta;
    state.camera.position.y += (targetCamHeight - state.camera.position.y) * 10 * delta;
    state.camera.position.z += (targetCamDepth - state.camera.position.z) * 10 * delta;
    
    // Keep look-at matching the higher camera elevation smoothly
    const lookAtYOffset = aspect >= 1.0 ? 1.3 : 1.0;
    state.camera.lookAt(pX * lookAtXFollow, pY * 0.75 + lookAtYOffset, pZ - 6 - zoomOutFactor * 4);
  });

  const character = useGameStore((s) => s.selectedCharacter);
  const mainColor =
    character === "blue"
      ? "#3b82f6"
      : character === "green"
        ? "#22c55e"
        : character === "purple"
          ? "#a855f7"
          : character === "magnet"
            ? "#38bdf8"
            : character === "shoe"
              ? "#c084fc"
            : character === "gold"
              ? "#fbbf24"
              : character === "hopper"
                ? "#84cc16"
                : "#f97316";

  return (
    <group ref={playerRef}>
      {/* Hero spotlight following the player to provide rich volume shadows and crisp visibility */}
      <spotLight 
        position={[0, 8, 4]} 
        intensity={3.5} 
        angle={0.6} 
        penumbra={0.65} 
        color="#ffffff" 
        castShadow
        shadow-bias={-0.00015}
      />
      {/* A dynamic ambient glow under the player's feet matching their character aesthetic */}
      <pointLight
        position={[0, 0.5, 0]}
        intensity={2.8}
        distance={9}
        color={mainColor}
      />

      <group ref={modelRef} position={[0, 0.8, 0]}>
        {/* Load the uploaded 3D model */}
        {character === "airplane" ? (
          <AirplaneModel />
        ) : character === "shoe" ? (
          <group position={[0, -0.6, 0]} scale={[3.5, 3.5, 3.5]}>
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
        ) : (
          <group position={[0, 0.2, 0]}>
            <ManModel />
          </group>
        )}

        {/* Character specific visual 3D effects & floaters */}
        {character === 'magnet' && (
          <group position={[0, -0.4, 0]}>
            {/* Floaty magnetic wave rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.62, 32]} />
              <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.65} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.15, 1.15, 1.15]}>
              <ringGeometry args={[0.5, 0.56, 32]} />
              <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
            {/* Floating double shoulder magnet gadgets */}
            <group position={[-0.35, 1.0, 0]} rotation={[0, 0, Math.PI / 5]}>
              <mesh castShadow>
                <torusGeometry args={[0.08, 0.025, 8, 12, Math.PI]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
              </mesh>
            </group>
            <group position={[0.35, 1.0, 0]} rotation={[0, 0, -Math.PI / 5]}>
              <mesh castShadow>
                <torusGeometry args={[0.08, 0.025, 8, 12, Math.PI]} />
                <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
              </mesh>
            </group>
          </group>
        )}

        {character === 'gold' && (
          <group position={[0, -0.4, 0]}>
            {/* Golden light disk under player */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.42, 0.58, 32]} />
              <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.7} />
            </mesh>
            {/* Double thin golden orbits */}
            <mesh rotation={[Math.PI / 2, 0.2, 0]} scale={[1.1, 1.1, 1.1]}>
              <ringGeometry args={[0.48, 0.52, 32]} />
              <meshBasicMaterial color="#d97706" side={THREE.DoubleSide} transparent opacity={0.4} />
            </mesh>
          </group>
        )}

        {character === 'phantom_star' && (
          <group position={[0, -0.4, 0]}>
            {/* Multiplier Cosmic Star floating ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.55, 6]} />
              <meshBasicMaterial color="#c084fc" side={THREE.DoubleSide} transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {['blue', 'green', 'purple'].includes(character) && (
          <group position={[0, -0.4, 0]}>
            {/* Neon halo under foot matching player's primary aesthetic energy */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.46, 0.54, 32]} />
              <meshBasicMaterial color={mainColor} side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
          </group>
        )}

        {/* Hoverboard 3D model active shield */}
        {engineState.hoverboardActiveUntil > Date.now() && (
          <group position={[0, -0.5, 0]}>
            {/* Main Board deck */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.75, 0.08, 1.45]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.8} emissive="#0284c7" emissiveIntensity={1.2} />
            </mesh>
            {/* Left neon rail */}
            <mesh position={[-0.4, 0.02, 0]}>
              <boxGeometry args={[0.08, 0.14, 1.35]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Right neon rail */}
            <mesh position={[0.4, 0.02, 0]}>
              <boxGeometry args={[0.08, 0.14, 1.35]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Glowing booster flame behind board */}
            <mesh position={[0, -0.06, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.14, 0.4, 8]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.85} />
            </mesh>
          </group>
        )}

        {/* Twin rocket Jetpack on back */}
        {engineState.jetpackActiveUntil > Date.now() && (
          <group position={[0, 0.5, 0.3]} rotation={[0, 0, 0]}>
            {/* Center golden backpack container */}
            <mesh castShadow>
              <boxGeometry args={[0.48, 0.58, 0.24]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.15} metalness={0.9} emissive="#d97706" emissiveIntensity={0.2} />
            </mesh>
            {/* Left thruster cylinder */}
            <mesh position={[-0.22, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.5, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Left flame engine */}
            <mesh position={[-0.22, -0.45, 0]}>
              <coneGeometry args={[0.085, 0.25, 8]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.9} />
            </mesh>
            {/* Right thruster cylinder */}
            <mesh position={[0.22, -0.15, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.5, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Right flame engine */}
            <mesh position={[0.22, -0.45, 0]}>
              <coneGeometry args={[0.085, 0.25, 8]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.9} />
            </mesh>
          </group>
        )}

        {/* Super Bouncy Sneakers (spring shoes for high hopping) */}
        {engineState.sneakersActiveUntil > Date.now() && (
          <group position={[0, -0.48, 0]}>
            {/* Left Sneaker block */}
            <group position={[-0.22, 0, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#c084fc" roughness={0.1} emissive="#a855f7" emissiveIntensity={0.8} />
              </mesh>
              {/* Retro spring coil */}
              <mesh position={[0, -0.12, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.16, 8]} />
                <meshBasicMaterial color="#fb7185" wireframe />
              </mesh>
            </group>
            {/* Right Sneaker block */}
            <group position={[0.22, 0, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial color="#c084fc" roughness={0.1} emissive="#a855f7" emissiveIntensity={0.8} />
              </mesh>
              {/* Retro spring coil */}
              <mesh position={[0, -0.12, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.16, 8]} />
                <meshBasicMaterial color="#fb7185" wireframe />
              </mesh>
            </group>
          </group>
        )}

      </group>
    </group>
  );
}
