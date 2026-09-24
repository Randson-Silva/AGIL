import { Text, View } from 'react-native';
import NewItemScreen from './pages/new-item';
import InventoryScreen from './pages/inventory';

export default function HomeScreen() {
  return (
    // <View className="flex-1 items-center justify-center bg-slate-900">
    //   <Text className="text-2xl font-bold text-white">AGIL</Text>
    //   <Text className="text-slate-400 mt-2">
    //     Project Running with Native + Expo + NativeWind (tailwind)
    //   </Text>
    // </View>
    <InventoryScreen />
  );
}
