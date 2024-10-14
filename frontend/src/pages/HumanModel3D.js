// src/pages/HumanModel3D.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const HumanModel3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Configuración básica de la escena, cámara y renderizador
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Añadir luz ambiental y direccional
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Cargar el modelo 3D desde la carpeta 'public/models'
    const loader = new GLTFLoader();
    loader.load(
      '/models/cco__male_base_mesh_standing/scene.gltf', // Ruta correcta
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5); // Ajustar la escala del modelo
        model.position.set(0, -1, 0); // Ajustar la posición del modelo
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Error al cargar el modelo 3D:', error);
      }
    );

    // Controles de órbita para el modelo 3D
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Limpiar el canvas al desmontar el componente
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default HumanModel3D;
