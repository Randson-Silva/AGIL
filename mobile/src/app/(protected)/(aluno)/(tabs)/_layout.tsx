import { Tabs } from 'expo-router';
import {
  CalendarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  HomeIcon,
} from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlunoTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00623B',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 60 + Math.max(insets.bottom, 30),
          paddingBottom: Math.max(insets.bottom, 0),
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="painel"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => <CalendarIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="materiais"
        options={{
          title: 'Materiais',
          tabBarIcon: ({ color, size }) => <CubeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="avarias"
        options={{
          title: 'Avarias',
          tabBarIcon: ({ color, size }) => (
            <ExclamationTriangleIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
