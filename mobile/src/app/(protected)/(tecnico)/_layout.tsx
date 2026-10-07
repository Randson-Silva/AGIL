import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ClockIcon,
  CalendarIcon,
  BeakerIcon,
  ArchiveBoxIcon,
} from 'react-native-heroicons/outline';

export default function TecnicoLayout() {
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
          // Calcula a altura somando um tamanho base com o inset inferior do sistema
          height: 60 + Math.max(insets.bottom, 30),
          // Adiciona padding dinâmico (no mínimo 10 para dispositivos sem gestos)
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
      {/* Abas Visíveis */}
      <Tabs.Screen
        name="painel"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color, size }) => (
            <ClockIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="aprovacoes"
        options={{
          title: 'Aprovações',
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventário',
          tabBarIcon: ({ color, size }) => (
            <BeakerIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <ArchiveBoxIcon size={size} color={color} />
          ),
        }}
      />

      {/* Abas Ocultas (Navegação via Botões na Tela) */}
      <Tabs.Screen
        name="new-item"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="adjust-inventory"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-item"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
