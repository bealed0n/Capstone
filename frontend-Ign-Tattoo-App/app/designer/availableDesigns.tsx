import React, { useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  Image,
  useColorScheme,
  Button,
  Alert,
} from "react-native";

import { UserContext } from "../context/userContext";
import { View, Text } from "../../components/Themed";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SERVER_URL } from "@/constants/constants";
interface Project {
  is_requested: boolean;
  id: number;
  designer_id: number;
  title: string;
  description: string;
  price: string;
  currency: string;
  image?: string;
  username: string;
  status: "available" | "pending" | "accepted" | "rejected";
  is_available: boolean;
}

interface RouteParams {
  id: string;
}

type TattooArtistProjectsRouteProp = RouteProp<
  { params: RouteParams },
  "params"
>;

const TattooArtistProjects = () => {
  const route = useRoute<TattooArtistProjectsRouteProp>();
  const { id } = route.params; // ID del tatuador
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const { user } = React.useContext(UserContext);

  useEffect(() => {
    fetchProjects();
  }, [id]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/designer/${id}/projects`);
      if (!response.ok) {
        throw new Error("Error al obtener proyectos disponibles");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error al obtener proyectos disponibles:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestDesign = async (project: Project) => {
    try {
      const response = await fetch(`${SERVER_URL}/request-design`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id, // Aquí coloca el ID del usuario real
          designer_id: project.designer_id,
          project_id: project.id,
          price: project.price,
          status: "Requested", // Inicia en estado "Requested"
          image: project.image,
        }),
      });

      if (response.ok) {
        Alert.alert("Solicitud enviada correctamente");
        fetchProjects(); // Recarga proyectos para actualizar el estado
      } else {
        throw new Error("Error al solicitar el diseño");
      }
    } catch (error) {
      console.error("Error al solicitar el diseño:", error);
    }
  };

  const renderProject = ({ item }: { item: Project }) => {
    const imageUrl = item.image ? `${SERVER_URL}${item.image}` : null;

    return (
      <View
        className={`p-4 rounded mb-2 ${
          colorScheme === "dark" ? "bg-neutral-800" : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-lg font-bold ${
            colorScheme === "dark" ? "text-white" : "text-black"
          }`}
        >
          {item.title}
        </Text>
        <Text
          className={`mb-2 ${
            colorScheme === "dark" ? "text-gray-400" : "text-gray-700"
          }`}
        >
          {item.description}
        </Text>
        <Text className="text-green-600 mb-2">
          Precio: {item.price} {item.currency}
        </Text>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-auto aspect-[4/5] rounded mb-2"
            resizeMode="cover"
          />
        )}
        <Text
          className={`text-base font-medium mb-2 ${
            item.is_available ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.is_available ? "Disponible" : "No disponible"}
        </Text>
        <Button
          title={item.is_requested ? "Diseño solicitado" : "Solicitar diseño"}
          onPress={() => requestDesign(item)}
          color="#007bff"
          disabled={!item.is_available || item.is_requested}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {projects.length === 0 ? (
        <Text className="text-center mt-5 text-lg text-gray-600">
          No hay proyectos disponibles.
        </Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProject}
        />
      )}
    </View>
  );
};

export default TattooArtistProjects;
