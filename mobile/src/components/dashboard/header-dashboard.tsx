import { BeakerIcon, BellIcon } from 'react-native-heroicons/outline';
import { Text, View } from 'react-native';

interface HeaderDashboardProps {
  userName: string;
  initials: string;
}

export function HeaderDashboard({ userName, initials }: HeaderDashboardProps) {
  return (
    <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
      {/* Esquerda: Logo e Nome */}
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-[#00623B] rounded-full items-center justify-center mr-3">
          <BeakerIcon size={20} color="#FFF" />
        </View>
        <Text className="text-xl font-bold text-gray-900">Olá, {userName}</Text>
      </View>

      {/* Direita: Sino e Iniciais */}
      <View className="flex-row items-center">
        <View className="relative mr-4 p-2 bg-white rounded-full border border-gray-100 shadow-sm">
          <BellIcon size={20} color="#6B7280" />
          {/* Bolinha vermelha de notificação */}
          <View className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </View>
        <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
          <Text className="text-[#00623B] font-bold text-sm uppercase">{initials}</Text>
        </View>
      </View>
    </View>
  );
}
