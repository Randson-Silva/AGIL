import { HeaderDashboard } from '@/components/dashboard/header-dashboard';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { useReservas } from '@/hooks/useReservas';
import { ReservationItem, UsageLog, getReservations } from '@/services/reservation.service';
import { formatReservationDateTime } from '@/utils/usage-log.utils';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface AvariaItem {
  id?: string;
  insumo_nome?: string;
  insumo?: { nome?: string };
  quantidade?: number;
  descricao?: string;
}

function formatAtaCode(id: string | number) {
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-3).toUpperCase().padStart(3, '0');
  return `A-${suffix}`;
}

function getAvarias(log: UsageLog): AvariaItem[] {
  const maybeAvarias = (log as { avarias?: AvariaItem[] }).avarias;
  return Array.isArray(maybeAvarias) ? maybeAvarias : [];
}

function getAtaStatus(log: UsageLog): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  const avarias = getAvarias(log);
  const reservaStatus = (log.reserva as { status?: string } | undefined)?.status;

  if (avarias.length > 0) {
    return {
      label: 'Com avaria',
      bgClass: 'bg-amber-100',
      textClass: 'text-amber-800',
    };
  }

  if (reservaStatus === 'PENDENTE') {
    return {
      label: 'Pendente',
      bgClass: 'bg-gray-100',
      textClass: 'text-gray-700',
    };
  }

  return {
    label: 'Concluída',
    bgClass: 'bg-[#E6F4EE]',
    textClass: 'text-[#00623B]',
  };
}

export default function AtaRelatorioScreen() {
  const router = useRouter();
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<ReservationItem | null>(null);
  const [log, setLog] = useState<UsageLog | null>(null);
  const [loading, setLoading] = useState(true);

  const { firstName, initials } = useReservas();

  const loadLog = useCallback(async () => {
    if (!reservationId) return;
    try {
      setLoading(true);
      const { data } = await getReservations();

      const reservationById = data.find((res) => reservationId === res.id);

      if (!reservationById || !reservationById.ataUso) return;

      console.log('data:', reservationById);
      console.log('data:', reservationById.ataUso);
      setReservation(reservationById);
      setLog(reservationById.ataUso);
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useFocusEffect(
    useCallback(() => {
      loadLog();
    }, [loadLog]),
  );

  const avarias = log ? getAvarias(log) : [];
  const status = log ? getAtaStatus(log) : null;
  const ataCode = log ? formatAtaCode(log.id) : '';
  const dateTime = log?.reserva
    ? formatReservationDateTime(log.reserva.data_reserva, log.reserva.horarios)
    : log
      ? new Date(log.criadoEm).toLocaleDateString('pt-BR')
      : '';

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Relatório da Ata"
        icon={<Feather name="file-text" size={20} color="#FFF" />}
        hasBorder
      />

      <View className="px-5 pt-4 pb-1">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 self-start mb-3"
        >
          <View className="w-10 h-10 rounded-full bg-[#FFFFFF] items-center justify-center">
            <Feather name="arrow-left" size={18} color="#000000" />
          </View>
          <Text className="text-sm font-bold text-[#00623B]">Voltar</Text>
        </TouchableOpacity>
      </View>

      {loading || !log || !status ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00623B" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 }}
        >
          {/* Card 1: Cabeçalho da Ata (mesma estrutura dos cards do histórico) */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-gray-100 px-2.5 py-0.5 rounded-full">
                <Text className="text-gray-700 text-[11px] font-bold">{ataCode}</Text>
              </View>

              <View className={`${status.bgClass} px-2.5 py-0.5 rounded-full`}>
                <Text className={`${status.textClass} text-[11px] font-semibold`}>
                  {status.label}
                </Text>
              </View>
            </View>

            <Text className="text-gray-900 font-bold text-base">
              {reservation?.local || 'Laboratório não informado'}
            </Text>

            <Text className="text-gray-500 text-xs mt-1">
              {dateTime} ⋅ {log.professorResponsavel}
            </Text>

            <Text className="text-gray-800 font-semibold text-sm mt-2">{log.nomePratica}</Text>
          </View>

          {/* Card 2: Dados da Prática */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
            <Text className="text-gray-900 font-bold text-sm mb-4">Dados da prática</Text>

            <View className="gap-3.5">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-[#F8FAF9] items-center justify-center">
                  <Feather name="user" size={15} color="#00623B" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Professor responsável</Text>
                  <Text className="text-gray-900 font-medium text-sm mt-0.5">
                    {log.professorResponsavel}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-[#F8FAF9] items-center justify-center">
                  <Feather name="users" size={15} color="#00623B" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Alunos participantes</Text>
                  <Text className="text-gray-900 font-medium text-sm mt-0.5">
                    {log.numeroAlunos} alunos
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-[#F8FAF9] items-center justify-center">
                  <Feather name="clock" size={15} color="#00623B" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Registrada em</Text>
                  <Text className="text-gray-900 font-medium text-sm mt-0.5">
                    {new Date(log.criadoEm).toLocaleString('pt-BR')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card 3: Ocorrências / Avarias */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-5">
            <Text className="text-gray-900 font-bold text-sm mb-3">Ocorrências e avarias</Text>

            {avarias.length === 0 ? (
              <View className="flex-row items-center gap-2.5 bg-[#F8FAF9] rounded-2xl p-3.5">
                <Feather name="check-circle" size={16} color="#00623B" />
                <Text className="text-gray-600 text-xs flex-1">
                  Nenhuma avaria registrada nesta aula.
                </Text>
              </View>
            ) : (
              <View className="gap-2.5">
                {avarias.map((avaria, index) => (
                  <View
                    key={avaria.id ?? String(index)}
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="text-amber-900 font-semibold text-xs flex-1">
                        {avaria.insumo_nome || avaria.insumo?.nome || 'Insumo'}
                      </Text>
                      {avaria.quantidade !== undefined && (
                        <Text className="text-amber-800 text-xs font-bold">
                          Qtd: {avaria.quantidade}
                        </Text>
                      )}
                    </View>

                    {Boolean(avaria.descricao) && (
                      <Text className="text-amber-800/80 text-xs mt-1">{avaria.descricao}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <Button
            variant="primary"
            title="Editar ata"
            onPress={() =>
              router.push({
                pathname: '/(protected)/(professor)/(tabs)/ata-form',
                params: { usageLog: JSON.stringify(log) },
              })
            }
            icon={<Feather name="edit-2" size={16} color="#FFF" />}
          />
        </ScrollView>
      )}
    </PageWrapper>
  );
}
