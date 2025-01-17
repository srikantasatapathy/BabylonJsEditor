"use client";
import React, { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  ArcRotateCamera,
  MeshBuilder,
  StandardMaterial,
  Color3,
  AbstractMesh,
} from '@babylonjs/core';
import { GizmoManager } from '@babylonjs/core/Gizmos';
import { useEditorStore } from '../store/editorStore';
import { Shape } from '../components/types';
import { v4 as uuidv4 } from 'uuid';

export const BabylonScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const { shapes, selectedShapeId, addShape, selectShape, updateShape } = useEditorStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Setup camera
    const camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // Setup light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // Setup gizmo manager
    const gizmoManager = new GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;
    gizmoManager.attachableMeshes = [];

    // Handle mesh selection
    scene.onPointerDown = (evt) => {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit) {
        const mesh = pickResult.pickedMesh;
        if (mesh) {
          selectShape(mesh.id);
          gizmoManager.attachToMesh(mesh);
        }
      } else {
        selectShape(null);
        gizmoManager.attachToMesh(null);
      }
    };

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resizeHandler = () => {
      engine.resize();
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      engine.dispose();
    };
  }, []);

  // Create and update meshes based on shapes state
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    
    // Clear existing meshes
    scene.meshes.forEach((mesh) => {
      if (!shapes.find(shape => shape.id === mesh.id)) {
        mesh.dispose();
      }
    });

    // Create or update meshes
    shapes.forEach((shape) => {
      let mesh = scene.getMeshById(shape.id) as AbstractMesh;
      
      if (!mesh) {
        // Create new mesh
        switch (shape.type) {
          case 'box':
            mesh = MeshBuilder.CreateBox(shape.id, { size: 1 }, scene);
            break;
          case 'sphere':
            mesh = MeshBuilder.CreateSphere(shape.id, { diameter: 1 }, scene);
            break;
          case 'cylinder':
            mesh = MeshBuilder.CreateCylinder(shape.id, { height: 1, diameter: 1 }, scene);
            break;
        }

        // Create material
        const material = new StandardMaterial(`${shape.id}-material`, scene);
        mesh.material = material;
      }

      // Update mesh properties
      const material = mesh.material as StandardMaterial;
      material.diffuseColor = Color3.FromHexString(shape.metadata.color);
      
      mesh.position = new Vector3(
        shape.metadata.position.x,
        shape.metadata.position.y,
        shape.metadata.position.z
      );
      
      mesh.rotation = new Vector3(
        shape.metadata.rotation.x,
        shape.metadata.rotation.y,
        shape.metadata.rotation.z
      );
      
      mesh.scaling = new Vector3(
        shape.metadata.scaling.x,
        shape.metadata.scaling.y,
        shape.metadata.scaling.z
      );
    });
  }, [shapes]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ outline: 'none' }}
    />
  );
};