"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  DynamicTexture,
  StandardMaterial,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, StackPanel, TextBlock } from "@babylonjs/gui";
import { GLTF2Export } from "@babylonjs/serializers";
import { GizmoManager } from "@babylonjs/core/Gizmos";

const BabylonEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedShape, setSelectedShape] = useState("None");

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the Babylon.js engine and scene
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    // Create a camera
    const camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      10,
      new Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // Create a light
    new HemisphericLight("Light", new Vector3(0, 1, 0), scene);

    // Add a GUI layer
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Create a stack panel for GUI controls
    const panel = new StackPanel();
    panel.width = "200px";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(panel);

    // Add a text block to show the selected shape
    const text = new TextBlock();
    text.text = `Selected Shape: ${selectedShape}`;
    text.color = "white";
    text.height = "30px";
    panel.addControl(text);

    // Add buttons to create shapes
    const shapes = ["Sphere", "Box", "Cylinder"];
    shapes.forEach((shape) => {
      const button = Button.CreateSimpleButton(`add${shape}`, `Add ${shape}`);
      button.width = "150px";
      button.height = "40px";
      button.color = "white";
      button.background = "blue";
      button.onPointerClickObservable.add(() => {
        let mesh;
        if (shape === "Sphere") {
          mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
        } else if (shape === "Box") {
          mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
        } else if (shape === "Cylinder") {
          mesh = MeshBuilder.CreateCylinder("cylinder", { diameter: 1, height: 2 }, scene);
        }
        if (mesh) {
          mesh.position.y = 1;
        }
        setSelectedShape(shape);
        text.text = `Selected Shape: ${shape}`;
      });
      panel.addControl(button);
    });

    // Add a button to export the scene
    const exportButton = Button.CreateSimpleButton("exportScene", "Export Scene");
    exportButton.width = "150px";
    exportButton.height = "40px";
    exportButton.color = "white";
    exportButton.background = "green";
    exportButton.onPointerClickObservable.add(() => {
      GLTF2Export.GLTFAsync(scene, "scene").then((gltf) => {
        gltf.downloadFiles();
      });
    });
    panel.addControl(exportButton);

    // Add drawing capability using DynamicTexture
    const dynamicTexture = new DynamicTexture("dynamicTexture", 512, scene, true);
    const material = new StandardMaterial("material", scene);
    material.diffuseTexture = dynamicTexture;
    const plane = MeshBuilder.CreatePlane("plane", { size: 5 }, scene);
    plane.material = material;
    plane.position.y = -1;

    // Draw on the dynamic texture
    const ctx = dynamicTexture.getContext();
    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 100, 100);
    dynamicTexture.update();

    // Add gizmo manager for transformations
    const gizmoManager = new GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;

    // Start the render loop
    engine.runRenderLoop(() => scene.render());

    // Resize engine on window resize
    const handleResize = () => engine.resize();
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      engine.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedShape]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default BabylonEditor;
