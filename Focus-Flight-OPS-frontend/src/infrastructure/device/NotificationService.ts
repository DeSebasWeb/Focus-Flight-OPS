import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

export async function setupNotifications(): Promise<string | null> {
  if (isExpoGo) {
    // expo-notifications push tokens don't work in Expo Go since SDK 53
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('expiry-alerts', {
        name: 'Alertas de Vencimiento',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    const existingPerms = await Notifications.getPermissionsAsync();
    let finalStatus = (existingPerms as any).status as string;

    if (finalStatus !== 'granted') {
      const newPerms = await Notifications.requestPermissionsAsync();
      finalStatus = (newPerms as any).status as string;
    }

    if (finalStatus !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch {
    return null;
  }
}

export async function scheduleExpiryNotification(
  title: string,
  body: string,
  daysFromNow: number,
): Promise<string | null> {
  if (isExpoGo || daysFromNow <= 0) return null;

  try {
    const Notifications = await import('expo-notifications');

    const trigger = new Date();
    trigger.setDate(trigger.getDate() + daysFromNow);
    trigger.setHours(9, 0, 0, 0);

    if (trigger.getTime() <= Date.now()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'expiry-alerts' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
      },
    });

    return id;
  } catch {
    return null;
  }
}

export async function checkAndScheduleExpiry(
  certificates: any[],
  insurance: any,
): Promise<void> {
  if (isExpoGo) return;

  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    return;
  }

  const ALERT_DAYS = [30, 15, 7];

  for (const cert of certificates) {
    if (!cert.expirationDate) continue;
    const expiryDate = new Date(cert.expirationDate);
    if (expiryDate <= new Date()) continue;

    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    for (const alertDays of ALERT_DAYS) {
      if (daysUntilExpiry > alertDays) {
        await scheduleExpiryNotification(
          'Certificado por vencer',
          `Tu certificado "${cert.certificateType || cert.name || 'Sin nombre'}" vence en ${alertDays} dias.`,
          daysUntilExpiry - alertDays,
        );
      }
    }
  }

  if (insurance?.endDate) {
    const expiryDate = new Date(insurance.endDate);
    if (expiryDate > new Date()) {
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      for (const alertDays of ALERT_DAYS) {
        if (daysUntilExpiry > alertDays) {
          await scheduleExpiryNotification(
            'Poliza por vencer',
            `Tu poliza de seguro vence en ${alertDays} dias. Renuevala para cumplir con RAC 91.`,
            daysUntilExpiry - alertDays,
          );
        }
      }
    }
  }
}
