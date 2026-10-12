/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface AutoScaledModelProps {
    url: string;
    targetWidth: number;
    targetHeight: number;
    targetDepth: number;
    extraRotation?: [number, number, number];
}

export function AutoScaledModel({
    url,
    targetWidth,
    targetHeight,
    targetDepth,
    extraRotation = [0, 0, 0],
}: AutoScaledModelProps) {
    const { scene } = useGLTF(url);

    const container = useMemo(() => {
        // Create an outer wrapper group to handle scale, rotation and offsets cleanly
        const parent = new THREE.Group();
        const clone = scene.clone();

        // Enable shadow propagation and double-sided rendering across meshes
        clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    // If the material has texture, make sure filters are high quality
                    if (child.material.map) {
                        child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                        child.material.map.magFilter = THREE.LinearFilter;
                    }
                }
            }
            // Mute any scene lights that might look harsh or cause glitches
            if (child instanceof THREE.Light) {
                child.visible = false;
            }
        });

        // Calculate bounding coordinates
        const bbox = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // Center the child model inside the local space of our parent group
        clone.position.set(-center.x, -center.y, -center.z);
        parent.add(clone);

        // Compute exact scales required to match the game collider dimensions
        const scaleX = size.x > 0 ? targetWidth / size.x : 1;
        const scaleY = size.y > 0 ? targetHeight / size.y : 1;
        const scaleZ = size.z > 0 ? targetDepth / size.z : 1;

        parent.scale.set(scaleX, scaleY, scaleZ);
        parent.rotation.set(extraRotation[0], extraRotation[1], extraRotation[2]);

        return parent;
    }, [scene, targetWidth, targetHeight, targetDepth, extraRotation]);

    return <primitive object={container} />;
}

// Preload the user assets to eliminate pop-in delays
useGLTF.preload('/Train.glb');
useGLTF.preload('/Railway carriage.glb');
