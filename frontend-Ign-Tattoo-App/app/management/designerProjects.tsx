import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { UserContext } from "../context/userContext";
import * as ImagePicker from "expo-image-picker";

interface Project {
  id: number;
  title: string;
  description: string;
  price: string;
  currency: string;
  image?: string;
  is_available: boolean;
}

const SERVER_URL = "http://192.168.100.87:3000"; // Cambia esto a la IP de tu servidor

export default function DesignerProjects() {
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("CLP");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${SERVER_URL}/designer/projects/${user.id}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los proyectos.");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
      Alert.alert("Error", "No se pudieron obtener los proyectos.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (
    projectId: number,
    currentStatus: boolean
  ) => {
    const newStatus = !currentStatus;
    try {
      const response = await fetch(
        `${SERVER_URL}/designer/projects/${projectId}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_available: newStatus,
          }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Éxito",
          `El proyecto ha sido marcado como ${newStatus ? "Disponible" : "No Disponible"}.`
        );
        fetchProjects();
      } else {
        throw new Error("Error al actualizar la disponibilidad del proyecto.");
      }
    } catch (error) {
      console.error("Error al actualizar la disponibilidad:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar la disponibilidad del proyecto."
      );
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("CLP");
    setImageUri(null);
    setIsAvailable(true);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permiso requerido",
        "Se requiere permiso para acceder a tu galería."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitProject = async () => {
    if (!title || !description || !price || !currency) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    const formData = new FormData();
    formData.append("designer_id", user.id.toString());
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("currency", currency);
    formData.append("is_available", isAvailable.toString());

    if (imageUri) {
      formData.append("image", {
        uri: imageUri,
        name: "project-image.jpg",
        type: "image/jpeg",
      } as any);
    }

    try {
      const response = await fetch(`${SERVER_URL}/designer/projects`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // No es necesario establecer "Content-Type" al usar FormData
        },
      });

      if (response.ok) {
        Alert.alert("Éxito", "Proyecto creado correctamente.");
        fetchProjects();
        closeModal();
      } else {
        const errorResponse = await response.json();
        console.error("Error del servidor:", errorResponse);
        Alert.alert("Error", "No se pudo crear el proyecto.");
      }
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      Alert.alert("Error", "Hubo un problema al crear el proyecto.");
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View
      style={[
        styles.projectContainer,
        {
          backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
        },
      ]}
    >
      <Text
        style={[
          styles.projectTitle,
          { color: colorScheme === "dark" ? "#ffffff" : "#000000" },
        ]}
      >
        {item.title}
      </Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
      <Text style={styles.projectPrice}>
        Precio: {item.price} {item.currency}
      </Text>
      {item.image && (
        <Image
          source={{ uri: `${SERVER_URL}${item.image}` }}
          style={styles.projectImage}
          resizeMode="cover"
        />
      )}
      <Text
        style={[
          styles.projectStatus,
          {
            color: item.is_available ? "green" : "red",
          },
        ]}
      >
        Estado: {item.is_available ? "Disponible" : "No Disponible"}
      </Text>
      <TouchableOpacity
        onPress={() => toggleAvailability(item.id, item.is_available)}
        style={[
          styles.availabilityButton,
          {
            backgroundColor: item.is_available ? "red" : "green",
          },
        ]}
      >
        <Text style={styles.buttonText}>
          {item.is_available
            ? "Marcar como No Disponible"
            : "Marcar como Disponible"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openModal} style={styles.addButton}>
        <Text style={styles.addButtonText}>Agregar Nuevo Proyecto</Text>
      </TouchableOpacity>

      {projects.length === 0 ? (
        <Text style={styles.noProjectsText}>No tienes proyectos aún.</Text>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProject}
          contentContainerStyle={styles.flatListContent}
        />
      )}

      {/* Modal para agregar nuevo proyecto */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colorScheme === "dark" ? "#1f2937" : "#ffffff",
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colorScheme === "dark" ? "#ffffff" : "#000000" },
              ]}
            >
              Agregar Nuevo Proyecto
            </Text>

            <TextInput
              placeholder="Título"
              value={title}
              onChangeText={setTitle}
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#ffffff" : "#000000",
                  borderColor: colorScheme === "dark" ? "#374151" : "#d1d5db",
                },
              ]}
              placeholderTextColor={
                colorScheme === "dark" ? "#9ca3af" : "#6b7280"
              }
            />

            <TextInput
              placeholder="Descripción"
              value={description}
              onChangeText={setDescription}
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colorScheme === "dark" ? "#ffffff" : "#000000",
                  borderColor: colorScheme === "dark" ? "#374151" : "#d1d5db",
                },
              ]}
              placeholderTextColor={
                colorScheme === "dark" ? "#9ca3af" : "#6b7280"
              }
              multiline
              numberOfLines={4}
            />

            <TextInput
              placeholder="Precio"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#ffffff" : "#000000",
                  borderColor: colorScheme === "dark" ? "#374151" : "#d1d5db",
                },
              ]}
              placeholderTextColor={
                colorScheme === "dark" ? "#9ca3af" : "#6b7280"
              }
            />

            <TextInput
              placeholder="Moneda (e.g., CLP)"
              value={currency}
              onChangeText={setCurrency}
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#ffffff" : "#000000",
                  borderColor: colorScheme === "dark" ? "#374151" : "#d1d5db",
                },
              ]}
              placeholderTextColor={
                colorScheme === "dark" ? "#9ca3af" : "#6b7280"
              }
            />

            <TouchableOpacity
              onPress={pickImage}
              style={styles.pickImageButton}
            >
              <Text style={styles.pickImageButtonText}>
                {imageUri ? "Cambiar Imagen" : "Seleccionar Imagen"}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityText}>Disponible:</Text>
              <TouchableOpacity
                onPress={() => setIsAvailable(!isAvailable)}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: isAvailable ? "green" : "red",
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {isAvailable ? "Sí" : "No"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={submitProject}
              style={styles.submitButton}
            >
              <Text style={styles.buttonText}>Crear Proyecto</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  noProjectsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6b7280",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  projectContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  projectDescription: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  projectPrice: {
    marginTop: 8,
    fontSize: 16,
    color: "green",
  },
  projectImage: {
    width: "100%",
    height: 200,
    marginTop: 8,
    borderRadius: 8,
  },
  projectStatus: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  availabilityButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000080",
  },
  modalContainer: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickImageButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  pickImageButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    marginTop: 12,
    borderRadius: 8,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  availabilityText: {
    fontSize: 16,
    marginRight: 10,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
