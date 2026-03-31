import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuthStore } from '../store/slices/authSlice';
import { AnimatedSplash } from '../components/common/AnimatedSplash';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

// Dashboard
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Fleet screens
import { DroneListScreen } from '../screens/fleet/DroneListScreen';
import { DroneDetailScreen } from '../screens/fleet/DroneDetailScreen';
import { PilotProfileScreen } from '../screens/fleet/PilotProfileScreen';
import { RegisterDroneScreen } from '../screens/fleet/RegisterDroneScreen';
import { CreatePilotProfileScreen } from '../screens/fleet/CreatePilotProfileScreen';
import { MaintenanceHistoryScreen } from '../screens/fleet/MaintenanceHistoryScreen';

// Pre-flight screens
import { PreFlightScreen } from '../screens/preflight/PreFlightScreen';
import { AirspaceMapScreen } from '../screens/preflight/AirspaceMapScreen';

// Mission screens
import { CreateMissionScreen } from '../screens/mission/CreateMissionScreen';

// Checklist screens
import { ChecklistScreen } from '../screens/checklist/ChecklistScreen';

// Flight screens
import { ActiveFlightScreen } from '../screens/flight/ActiveFlightScreen';
import { FlightLogListScreen } from '../screens/flight/FlightLogListScreen';
import { FlightLogDetailScreen } from '../screens/flight/FlightLogDetailScreen';

// Emergency screens
import { EmergencyDashboardScreen } from '../screens/emergency/EmergencyDashboardScreen';
import { FlyawayProtocolScreen } from '../screens/emergency/FlyawayProtocolScreen';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const DashboardStack = createNativeStackNavigator();
const FleetStack = createNativeStackNavigator();
const PreFlightStack = createNativeStackNavigator();
const ChecklistStack = createNativeStackNavigator();
const FlightStack = createNativeStackNavigator();
const EmergencyStack = createNativeStackNavigator();

function useStackScreenOptions() {
  const { colors } = useTheme();
  return {
    headerStyle: { backgroundColor: colors.surface1 },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: { fontWeight: '600' as const, color: colors.textPrimary },
    headerShadowVisible: false,
  };
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function DashboardNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Inicio', headerShown: false }} />
    </DashboardStack.Navigator>
  );
}

function FleetNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <FleetStack.Navigator screenOptions={screenOptions}>
      <FleetStack.Screen name="DroneList" component={DroneListScreen} options={{ title: 'Mi Flota' }} />
      <FleetStack.Screen name="DroneDetail" component={DroneDetailScreen} options={{ title: 'Detalle del Drone' }} />
      <FleetStack.Screen name="RegisterDrone" component={RegisterDroneScreen} options={{ title: 'Registrar Drone' }} />
      <FleetStack.Screen name="PilotProfile" component={PilotProfileScreen} options={{ title: 'Perfil del Piloto' }} />
      <FleetStack.Screen name="CreatePilotProfile" component={CreatePilotProfileScreen} options={{ title: 'Crear Perfil' }} />
      <FleetStack.Screen name="MaintenanceHistory" component={MaintenanceHistoryScreen} options={{ title: 'Historial de Mantenimiento' }} />
    </FleetStack.Navigator>
  );
}

function PreFlightNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <PreFlightStack.Navigator screenOptions={screenOptions}>
      <PreFlightStack.Screen name="PreFlightMain" component={PreFlightScreen} options={{ title: 'Pre-Vuelo', headerShown: false }} />
      <PreFlightStack.Screen name="AirspaceMap" component={AirspaceMapScreen} options={{ title: 'Espacio Aereo' }} />
      <PreFlightStack.Screen name="CreateMission" component={CreateMissionScreen} options={{ title: 'Nueva Mision' }} />
    </PreFlightStack.Navigator>
  );
}

function ChecklistNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <ChecklistStack.Navigator screenOptions={screenOptions}>
      <ChecklistStack.Screen name="ChecklistMain" component={ChecklistScreen} options={{ title: 'Checklist' }} />
    </ChecklistStack.Navigator>
  );
}

function FlightNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <FlightStack.Navigator screenOptions={screenOptions}>
      <FlightStack.Screen name="ActiveFlight" component={ActiveFlightScreen} options={{ title: 'Vuelo' }} />
      <FlightStack.Screen name="FlightLogList" component={FlightLogListScreen} options={{ title: 'Bitacora' }} />
      <FlightStack.Screen name="FlightLogDetail" component={FlightLogDetailScreen} options={{ title: 'Detalle' }} />
    </FlightStack.Navigator>
  );
}

function EmergencyNavigator() {
  const screenOptions = useStackScreenOptions();
  return (
    <EmergencyStack.Navigator screenOptions={screenOptions}>
      <EmergencyStack.Screen name="EmergencyMain" component={EmergencyDashboardScreen} options={{ title: 'Emergencia' }} />
      <EmergencyStack.Screen name="FlyawayProtocol" component={FlyawayProtocolScreen} options={{ title: 'Protocolo Flyaway' }} />
    </EmergencyStack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface1,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.danger,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'DashboardTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'FleetTab') iconName = focused ? 'airplane' : 'airplane-outline';
          else if (route.name === 'PreFlightTab') iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          else if (route.name === 'ChecklistTab') iconName = focused ? 'checkbox' : 'checkbox-outline';
          else if (route.name === 'FlightTab') iconName = focused ? 'navigate-circle' : 'navigate-circle-outline';
          else if (route.name === 'EmergencyTab') iconName = focused ? 'warning' : 'warning-outline';

          return <Ionicons name={iconName} size={route.name === 'EmergencyTab' ? 24 : 22} color={route.name === 'EmergencyTab' ? colors.danger : color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardNavigator} options={{ title: 'Inicio' }} />
      <Tab.Screen name="FleetTab" component={FleetNavigator} options={{ title: 'Flota' }} />
      <Tab.Screen name="PreFlightTab" component={PreFlightNavigator} options={{ title: 'Pre-Vuelo' }} />
      <Tab.Screen name="ChecklistTab" component={ChecklistNavigator} options={{ title: 'Checklist' }} />
      <Tab.Screen name="FlightTab" component={FlightNavigator} options={{ title: 'Vuelo' }} />
      <Tab.Screen
        name="EmergencyTab"
        component={EmergencyNavigator}
        options={{
          title: 'SOS',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '800', color: colors.danger },
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuthStore();
  const [splashDone, setSplashDone] = useState(false);

  if (isLoading || !splashDone) {
    return <AnimatedSplash onFinish={() => setSplashDone(true)} />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return <MainTabNavigator />;
}

