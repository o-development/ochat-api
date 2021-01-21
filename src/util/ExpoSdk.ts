import { Expo } from "expo-server-sdk";

const ExpoSdk = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export default ExpoSdk;
