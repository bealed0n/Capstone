// src/components/ModelPreview.js

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import PropTypes from 'prop-types';

const ModelPreview = ({ modelUrl }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, controls;
    let animationId;

    const initThree = () => {
      // Escena
      scene = new THREE.Scene();

      // Cámara
      camera = new THREE.PerspectiveCamera(
        50,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1, 3);

      // Renderizador
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0); // Transparente
      mountRef.current.appendChild(renderer.domElement);

      // Controles
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = false;
      controls.rotateSpeed = 0.5;
      controls.minDistance = 1.5;
      controls.maxDistance = 5;

      // Iluminación
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Cargar Modelo
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1, 1, 1);
          scene.add(model);

          // Centrar el modelo
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3()).length();

          model.position.x += (model.position.x - center.x);
          model.position.y += (model.position.y - center.y);
          model.position.z += (model.position.z - center.z);

          camera.position.set(size * 1.2, size * 1.2, size * 1.2);
          camera.lookAt(center);
        },
        undefined,
        (error) => {
          console.error('Error al cargar el modelo 3D:', error);
        }
      );
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    initThree();
    animate();

    // Manejar redimensionamiento
    const handleResize = () => {
      if (mountRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>;
};

ModelPreview.propTypes = {
  modelUrl: PropTypes.string.isRequired,
};

export default ModelPreview;