// app/admin/AdminView.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SERVER_URL } from "@/constants/constants";
import { adminPass } from "@/constants/constants";

interface Postulacion {
  id: number;
  username: string;
  email: string;
  role: string;
  requisitos: string; // Añade el campo requisitos
}

export default function AdminView() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchPostulaciones();
    }
  }, [isAuthenticated]);

  const fetchPostulaciones = async () => {
    try {
      const response = await axios.get<{ postulaciones: Postulacion[] }>(
        `${SERVER_URL}/postulaciones`
      );
      setPostulaciones(response.data.postulaciones);
    } catch (error) {
      console.error("Error al obtener las postulaciones:", error);
    }
  };

  const aprobarPostulacion = async (id: number) => {
    try {
      await axios.post(`${SERVER_URL}/postulaciones/${id}/aprobar`);
      fetchPostulaciones();
    } catch (error) {
      console.error("Error al aprobar la postulación:", error);
    }
  };

  const rechazarPostulacion = async (id: number) => {
    try {
      await axios.post(`${SERVER_URL}/postulaciones/${id}/rechazar`);
      fetchPostulaciones();
    } catch (error) {
      console.error("Error al rechazar la postulación:", error);
    }
  };

  const handleLogin = () => {
    if (password === adminPass) {
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Admin Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Postulaciones</Text>
      {postulaciones.map((postulacion) => (
        <View key={postulacion.id} style={styles.postulacion}>
          <Text>ID: {postulacion.id}</Text>
          <Text>Username: {postulacion.username}</Text>
          <Text>Email: {postulacion.email}</Text>
          <Text>Role: {postulacion.role}</Text>
          {postulacion.requisitos && (
            <Image
              source={{ uri: `${SERVER_URL}${postulacion.requisitos}` }}
              style={styles.image}
            />
          )}
          <Button
            title="Aprobar"
            onPress={() => aprobarPostulacion(postulacion.id)}
          />
          <Button
            title="Rechazar"
            onPress={() => rechazarPostulacion(postulacion.id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  postulacion: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});
