import { Text, View } from 'react-native';
import NovoItemScreen from './novo-item';
import InventarioScreen from './inventario';

export default function HomeScreen() {
  return (
    // <View className="flex-1 items-center justify-center bg-slate-900">
    //   <Text className="text-2xl font-bold text-white">AGIL</Text>
    //   <Text className="text-slate-400 mt-2">
    //     Project Running with Native + Expo + NativeWind (tailwind)
    //   </Text>
    // </View>
    <InventarioScreen />
  );
}
