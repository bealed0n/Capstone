// src/pages/ModelDetail.js

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Image } from 'react-bootstrap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import './ModelDetail.css';

const ModelDetail = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountRef = useRef(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/models/${id}`);
        setModel(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar el modelo 3D.');
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  useEffect(() => {
    if (model) {
      let scene, camera, renderer, controls, animationId;

      // Configuración de la escena
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      // Configuración de la cámara
      camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.5, 3);

      // Configuración del renderizador
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.appendChild(renderer.domElement);

      // Controles de órbita
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = true;
      controls.minDistance = 1;
      controls.maxDistance = 10;

      // Iluminación
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);

      // Cargar modelo 3D
      const loader = new GLTFLoader();
      loader.load(
        `http://localhost:4000/${model.model_url}`,
        (gltf) => {
          const loadedModel = gltf.scene;

          // Escalar el modelo si es necesario
          loadedModel.scale.set(1, 1, 1);

          // Centrar el modelo
          const box = new THREE.Box3().setFromObject(loadedModel);
          const center = box.getCenter(new THREE.Vector3());
          loadedModel.position.sub(center); // Mover el modelo al origen

          scene.add(loadedModel);

          // Ajustar la cámara para que el modelo quepa en la vista
          const size = box.getSize(new THREE.Vector3()).length();
          const distance = size * 1.5;
          camera.position.set(distance, distance, distance);
          camera.lookAt(new THREE.Vector3(0, 0, 0));
        },
        undefined,
        (error) => {
          console.error('Error al cargar el modelo 3D:', error);
          setError('Error al renderizar el modelo 3D.');
        }
      );

      // Animación
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // Manejar el redimensionamiento de la ventana
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

      // Limpieza al desmontar el componente
      return () => {
        window.removeEventListener('resize', handleResize);

        // Cancelar la animación
        if (animationId) {
          cancelAnimationFrame(animationId);
        }

        // Disponer controles
        if (controls) {
          controls.dispose();
        }

        // Remover el renderer del DOM si existe
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }

        // Disponer el renderer
        if (renderer) {
          renderer.dispose();
        }
      };
    }
  }, [model]);

  if (loading)
    return (
      <div className="center-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );

  if (error) return <Alert variant="danger" className="alert-custom">{error}</Alert>;

  return (
    <Container className="detail-container">
      <h1>{model.name}</h1>
      <div ref={mountRef} className="model-viewer"></div>
      
      {/* Información del Diseñador */}
      <div className="designer-info">
        <h3 className="diseñador">Diseñado por: <Link to={`/profile/${model.user_id}`} className="designer-link">
          {model.username}
        </Link></h3>
     
        {/* Mostrar imagen de perfil si está disponible */}
        {model.profile_picture && (
          <Image 
            src={`http://localhost:4000/uploads/${model.profile_picture}`} 
            roundedCircle 
            width={50} 
            height={50} 
            alt={`${model.username} perfil`} 
          />
        )}
      </div>

      <p className="model-description">{model.description}</p>
    </Container>
  );
};

export default ModelDetail;