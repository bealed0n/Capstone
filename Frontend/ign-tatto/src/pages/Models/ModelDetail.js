import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

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
      console.log('Model URL:', `http://localhost:4000/${model.model_url}`);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(600, 400); // Ajustar el tamaño del renderizador
      mountRef.current.appendChild(renderer.domElement);

      // Añadir iluminación a la escena
      const light = new THREE.AmbientLight(0xffffff); // Luz ambiental
      scene.add(light);

      const loader = new GLTFLoader();
      loader.load(
        `http://localhost:4000/${model.model_url}`,
        (gltf) => {
          console.log('Model loaded:', gltf);
          scene.add(gltf.scene);

          // Ajustar la posición de la cámara para que el modelo sea visible
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());

          camera.position.set(center.x, center.y, size * 1.5);
          camera.lookAt(center);

          renderer.render(scene, camera);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
        }
      );

      // Configurar OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.update();

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, [model]);

  if (loading) return <Spinner animation="border" role="status"><span className="visualmente-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">{model.name}</h1>
      <div ref={mountRef} style={{ width: '600px', height: '400px', margin: '0 auto' }}></div>
    </Container>
  );
};

export default ModelDetail;