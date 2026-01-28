declare module "react-native-push-notification" {
  export interface ChannelConfig {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export interface LocalNotification {
    channelId?: string;
    title?: string;
    message: string;
    playSound?: boolean;
    soundName?: string;
    importance?: string | number;
  }

  const PushNotification: {
    createChannel(
      config: ChannelConfig,
      callback?: (created: boolean) => void
    ): void;

    localNotification(config: LocalNotification): void;
  };

  export default PushNotification;
}
