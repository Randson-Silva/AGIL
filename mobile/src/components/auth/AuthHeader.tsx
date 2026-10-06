import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export function AuthHeader() {
  return (
    <View className="items-center">
      <View className="w-16 h-16 rounded-full bg-[#00623B] items-center justify-center mb-3">
        <MaterialCommunityIcons name="flask-outline" size={32} color="#FFF" />
      </View>
      <Text className="text-3xl font-extrabold text-gray-900 tracking-wider">AGIL</Text>
      <Text className="text-xs text-gray-500 mt-1 text-center">
        Aplicativo de Gestão de Insumos e Laboratórios
      </Text>
    </View>
  );
}
