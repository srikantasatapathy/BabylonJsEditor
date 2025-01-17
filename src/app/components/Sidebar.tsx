"use client";
import React from 'react';
import {Circle, Cylinder, Download, Palette, Square } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { v4 as uuidv4 } from 'uuid';
import { GLTF2Export } from '@babylonjs/serializers';
import { Shape } from './types';

export const Sidebar = () => {
  const { addShape, selectedShapeId, shapes, updateShape } = useEditorStore();

  const createShape = (type: Shape['type']) => {
    const newShape: Shape = {
      id: uuidv4(),
      type,
      metadata: {
        color: '#ffffff',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scaling: { x: 1, y: 1, z: 1 },
      },
    };
    addShape(newShape);
  };

  const handleColorChange = (color: string) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, { color });
    }
  };

  const handleExport = async () => {
    const scene = document.querySelector('canvas')?.scene;
    if (scene) {
      const glb = await GLTF2Export.GLBAsync(scene, 'scene');
      const blob = new Blob([glb.glTFData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene.glb';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-64 bg-[#47476f] shadow-lg p-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Shapes</h2>
          <div className="space-y-2">
            <button 
              onClick={() => createShape('box')}
              className="flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded"
            >
              <Square className="w-5 h-5" />
              <span>Add Cube</span>
            </button>
            <button 
              onClick={() => createShape('sphere')}
              className="flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded"
            >
              <Circle className="w-5 h-5" />
              <span>Add Sphere</span>
            </button>
            <button 
              onClick={() => createShape('cylinder')}
              className="flex items-center space-x-2 w-full p-2 hover:bg-gray-800 rounded"
            >
              <Cylinder className="w-5 h-5" />
              <span>Add Cylinder</span>
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <input 
                type="color" 
                className="w-full"
                value={shapes.find(s => s.id === selectedShapeId)?.metadata.color || '#ffffff'}
                onChange={(e) => handleColorChange(e.target.value)}
                disabled={!selectedShapeId}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Export</h2>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Download className="w-5 h-5" />
            <span>Export GLB</span>
          </button>
        </div>
      </div>
    </div>
  );
};