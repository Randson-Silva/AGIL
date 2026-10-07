import { Text, View } from 'react-native';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { WrenchScrewdriverIcon } from 'react-native-heroicons/outline';

export default function PerfilScreen() {
  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <View className="flex-1 items-center justify-center px-6">
        <WrenchScrewdriverIcon size={48} color="#00623B" />
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          Perfil
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Esta aba ainda está em construção.
        </Text>
      </View>
    </PageWrapper>
  );
}
