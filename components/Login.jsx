import { useEffect, useState } from "react";
import { Text, View, Linking, Button } from "react-native";

import { Amplify, Auth, Hub } from "aws-amplify";
import awsconfig from "../src/aws-exports";

Amplify.configure(awsconfig);

export default function Login() {
  const [user, setUser] = useState(null);
  const [customState, setCustomState] = useState(null);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          setUser(data);
          break;
        case "signOut":
          setUser(null);
          break;
        case "customOAuthState":
          setCustomState(data);
      }
    });

    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => console.log("Not signed in"));

    return unsubscribe;
  }, []);

  return (
    <View>
      <Button
        title="Open Google"
        onPress={() =>
          Auth.federatedSignIn({
            provider: "Google",
          })
        }
      />
      <Button
        title="Open Facebook"
        onPress={() =>
          Auth.federatedSignIn({
            provider: "Facebook",
          })
        }
      />
      <Button title="Sign Out" onPress={() => Auth.signOut()} />
      <Text>{user && user.getUsername()}</Text>
    </View>
  );
}
