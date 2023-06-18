import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, LogBox } from "react-native";
import VoiceTest from "./components/VoiceTest";
import { useEffect } from "react";
// import * as Crypto from "expo-crypto";
import { Amplify, Auth } from "aws-amplify";
import awsExports from "./src/aws-exports";
import Login from "./components/Login";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  useEffect(() => {
    Amplify.configure(awsExports);

    // // Função para gerar o certificado Fingerprint (SHA-1)
    // const generateCertificateFingerprint = async (data) => {
    //   const digest = await Crypto.digestStringAsync(
    //     Crypto.CryptoDigestAlgorithm.SHA1,
    //     data,
    //     { encoding: Crypto.CryptoEncoding.HEX }
    //   );

    //   return digest;
    // };

    // // Exemplo de uso
    // generateCertificateFingerprint("./keystore.jks").then((fingerprint) => {
    //   console.log("Certificado Fingerprint (SHA-1):", fingerprint);
    // });
  }, []);

  LogBox.ignoreAllLogs();
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Login />
        {/* <VoiceTest /> */}
      </View>
    </NavigationContainer>
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
