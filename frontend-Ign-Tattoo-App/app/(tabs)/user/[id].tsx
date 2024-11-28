// app/(tabs)/profile/[id].tsx
import React from "react";
import { View } from "../../../components/Themed";
import { useRoute, RouteProp } from "@react-navigation/native";
import UsersProfile from "../../../components/usersProfile";

interface RouteParams {
  id: string;
}

const UserPage = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, "params">>();
  const { id } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <UsersProfile userId={id} />
    </View>
  );
};

export default UserPage;
