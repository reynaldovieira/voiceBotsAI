import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import VoiceTest from "./components/VoiceTest";
import { LogBox } from "react-native";

export default function App() {
  LogBox.ignoreAllLogs();
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <VoiceTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
