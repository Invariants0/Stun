"use client";

import { useEffect } from "react";
import { useReactFlow } from "reactflow";

export default function CameraController() {
  const reactFlow = useReactFlow();

  useEffect(() => {
    reactFlow.fitView({ duration: 300, padding: 0.2 });
  }, [reactFlow]);

  return null;
}
