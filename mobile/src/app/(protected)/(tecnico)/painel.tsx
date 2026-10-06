import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { StatCard } from '../../../components/dashboard/stat-card';
import { AlertCard } from '../../../components/dashboard/alert-card';
import { QuickAccessCard } from '../../../components/dashboard/quick-access-card';
import { useDashboard } from '../../../hooks/useDashboard';

export default function TecnicoPainelScreen() {
  const { firstName, initials, stats, isLoadingStats, alertsMock, quickAccessMock } =
    useDashboard();

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        style={{ backgroundColor: '#F8FAF9' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
      >
        <HeaderDashboard userName={firstName} initials={initials} />

        {/* Estatísticas */}
        <View className="pl-6 mb-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stats.map((stat) => (
              <StatCard key={stat.id} item={stat} />
            ))}
            {/* Espaço extra no final da rolagem horizontal */}
          </ScrollView>
        </View>

        {/* Alertas Pendentes */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Alertas pendentes
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-[#00623B] font-semibold text-sm">
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          {alertsMock.map((alert) => (
            <AlertCard key={alert.id} item={alert} />
          ))}
        </View>

        {/* Acesso Rápido */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Acesso rápido
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickAccessMock.map((action) => (
              <QuickAccessCard key={action.id} item={action} />
            ))}
          </View>
        </View>

        {/* Rodapé */}
        <View className="items-center mt-4">
          <Text className="text-gray-400 text-xs">Atualização automática</Text>
        </View>
      </ScrollView>
    </PageWrapper>
  );
}
