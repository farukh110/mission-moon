"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useKeys } from "@/hooks/useKeys";
import type { ViewDef } from "@/data/types";

interface CameraRigProps {
  view: ViewDef;
  /** Changes when the player picks a guided view. */
  viewKey: number;
  /** Changes when the scene changes; the camera then jumps instead of gliding. */
  snapKey: string;
  zoom: { min: number; max: number };
  /** Walking stages: the students own the arrow keys and WASD, so only the mouse turns the view. */
  walk: boolean;
  /** A scene is moving the camera itself (e.g. following the rocket). */
  locked: boolean;
}

/** Guided camera views, smooth transitions, and keyboard turning/zooming. */
export function CameraRig({ view, viewKey, snapKey, zoom, walk, locked }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const keys = useKeys();
  const mode = useRef<"snap" | "glide" | "none">("snap");
  const lastSnap = useRef(snapKey);
  const viewRef = useRef(view);

  useEffect(() => {
    viewRef.current = view;
    if (lastSnap.current !== snapKey) {
      lastSnap.current = snapKey;
      mode.current = "snap";
    } else mode.current = "glide";
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react only to explicit view requests
  }, [snapKey, viewKey]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      if (mode.current === "glide") mode.current = "none";
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  useFrame((_, delta) => {
    if (!controls || locked) return;
    const goal = viewRef.current;

    if (mode.current === "snap") {
      camera.position.set(...goal.position);
      controls.target.set(...goal.target);
      controls.update();
      mode.current = "none";
      return;
    }

    const held = (...names: string[]) => names.some((n) => keys.current.has(n));
    const turn = walk ? 0 : (held("arrowright", "d") ? 1 : 0) - (held("arrowleft", "a") ? 1 : 0);
    const tilt = walk ? 0 : (held("arrowup", "w") ? 1 : 0) - (held("arrowdown", "s") ? 1 : 0);
    const zoomDir = (held("q") ? 1 : 0) - (held("e") ? 1 : 0);
    if (turn || tilt || zoomDir) {
      mode.current = "none";
      const offset = camera.position.clone().sub(controls.target);
      const sph = new THREE.Spherical().setFromVector3(offset);
      sph.theta -= turn * delta * 1.2;
      sph.phi = THREE.MathUtils.clamp(sph.phi - tilt * delta * 1.2, 0.15, Math.PI - 0.15);
      sph.radius = THREE.MathUtils.clamp(sph.radius * (1 - zoomDir * delta * 1.2), zoom.min, zoom.max);
      camera.position.copy(controls.target).add(offset.setFromSpherical(sph));
      controls.update();
      return;
    }

    if (mode.current === "glide") {
      const k = 1 - Math.exp(-3 * delta);
      const targetPos = new THREE.Vector3(...goal.position);
      camera.position.lerp(targetPos, k);
      controls.target.lerp(new THREE.Vector3(...goal.target), k);
      controls.update();
      if (camera.position.distanceTo(targetPos) < 0.02) mode.current = "none";
    }
  });

  return null;
}
