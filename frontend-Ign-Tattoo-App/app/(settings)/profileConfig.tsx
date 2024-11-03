import { StyleSheet } from "react-native";
import PrincipalSettings from "../../components/principalSettings";
import { Text, View } from "../../components/Themed";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

export default function ProfileConfig() {
  const { user } = useContext(UserContext);

  return (
    <View className="flex-1 items-start">
      <PrincipalSettings path="app/profileConfig.tsx" />
    </View>
  );
}
