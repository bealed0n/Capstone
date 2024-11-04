import React, { useState, useCallback } from "react";
import { SafeAreaView, View, FlatList, RefreshControl } from "react-native";
import Messages from "../../components/messages";

export default function InboxScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Aquí puedes agregar la lógica para recargar los mensajes
    // Por ejemplo, puedes llamar a una función para obtener los mensajes nuevamente
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // Simula una recarga de 2 segundos
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={[]} // Puedes pasar los datos de los mensajes aquí si es necesario
        renderItem={null} // No necesitas renderizar elementos aquí
        ListHeaderComponent={
          <View>
            <Messages refreshing={refreshing} onRefresh={onRefresh} />
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
