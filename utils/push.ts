import messaging from "@react-native-firebase/messaging";
import { api } from "../../services/api";

export async function registerPushToken() {
  await messaging().requestPermission();
  const token = await messaging().getToken();

  console.log("FCM TOKEN:", token);

  if (token) {
    await api.post("/users/push-token", { token });
  }
}
