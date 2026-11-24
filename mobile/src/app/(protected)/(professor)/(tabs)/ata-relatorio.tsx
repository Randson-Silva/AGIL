import { HeaderDashboard } from '@/components/dashboard/header-dashboard';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { useAuth } from '@/hooks/useAuth';
import {
  DamageType,
  getUsageLog,
  ReservationTimeSlot,
  UsageLog,
  UsageLogOccurrence,
  UsageLogStatus,
} from '@/services/reservation.service';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

function formatReservationCode(reservaId: string) {
  const clean = String(reservaId).replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-4).toUpperCase().padStart(4, '0');
  return `R-${suffix}`;
}

function formatDateBR(dateStr?: string | null) {
  if (!dateStr) return '--/--/----';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? '--/--/----' : date.toLocaleDateString('pt-BR');
}

function formatTimeRange(horarios?: ReservationTimeSlot[]) {
  if (!horarios || horarios.length === 0) return '';
  const sorted = [...horarios].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const inicio = sorted[0].hora_inicio.slice(0, 5);
  const fim = sorted[sorted.length - 1].hora_fim.slice(0, 5);
  return `${inicio}  ${fim}`;
}

function getOccurrenceBadge(ocorrencia: UsageLogOccurrence): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  switch (ocorrencia) {
    case 'AVARIA_MATERIAL':
      return {
        label: 'Avaria de Material',
        bgClass: 'bg-red-100',
        textClass: 'text-red-700',
      };
    case 'FALTA_REAGENTE':
      return {
        label: 'Falta de reagente',
        bgClass: 'bg-amber-100',
        textClass: 'text-amber-800',
      };
    case 'INCIDENTE_SEGURANCA':
      return {
        label: 'Incidente de segurança',
        bgClass: 'bg-red-100',
        textClass: 'text-red-800',
      };
    case 'SEM_INTERCORRENCIAS':
    default:
      return {
        label: 'Sem ocorrência',
        bgClass: 'bg-emerald-100',
        textClass: 'text-emerald-800',
      };
  }
}

function getStatusBadge(status: UsageLogStatus): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  switch (status) {
    case 'RESOLVIDA':
      return {
        label: 'Resolvida',
        bgClass: 'bg-[#E6F4EE]',
        textClass: 'text-[#00623B]',
      };
    case 'EM_ANALISE':
      return {
        label: 'Em análise',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-800',
      };
    case 'PENDENTE':
    default:
      return {
        label: 'Pendente',
        bgClass: 'bg-amber-100',
        textClass: 'text-amber-800',
      };
  }
}

const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  QUEBRA: 'Quebra',
  DEFEITO: 'Defeito',
  CONTAMINACAO: 'Contaminação',
  EXTRAVIO: 'Extravio',
  OUTRO: 'Outro',
};

export default function AtaRelatorioScreen() {
  const router = useRouter();
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const { firstName, initials } = useAuth();

  const [log, setLog] = useState<UsageLog | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLog = useCallback(async () => {
    if (!reservationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUsageLog(reservationId);
      setLog(data);
    } catch (error) {
      console.error('Erro ao carregar relatório da ata:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar o relatório da ata.',
      });
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useFocusEffect(
    useCallback(() => {
      loadLog();
    }, [loadLog]),
  );

  const occurrenceBadges = log
    ? (log.ocorrencias?.length
        ? log.ocorrencias
        : (['SEM_INTERCORRENCIAS'] as UsageLogOccurrence[])
      ).map((ocorrencia) => ({
        key: ocorrencia,
        ...getOccurrenceBadge(ocorrencia),
      }))
    : [];
  const statusBadge = log ? getStatusBadge(log.status) : null;
  const avarias = log?.avarias ?? [];

  const formattedDate = formatDateBR(log?.reserva?.data_reserva ?? log?.criadoEm);
  const formattedTime = formatTimeRange(log?.reserva?.horarios);
  const quantidadeAlunos = `${log?.numeroAlunos ?? 0} alunos`;

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Ata de Aula"
        icon={<Feather name="file-text" size={20} color="#FFF" />}
        hasBorder
      />

      <View className="px-5 pt-4 pb-1">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 self-start mb-2"
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100">
            <Feather name="arrow-left" size={18} color="#000000" />
          </View>
          <Text className="text-sm font-bold text-[#00623B]">Voltar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00623B" />
        </View>
      ) : !log || !statusBadge ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-500 text-sm text-center">
            Relatório da ata não encontrado.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 110 }}
        >
          <View className="flex-row items-center flex-wrap gap-2 mb-4">
            {occurrenceBadges.map((badge) => (
              <View key={badge.key} className={`${badge.bgClass} px-3 py-1 rounded-full`}>
                <Text className={`${badge.textClass} text-xs font-semibold`}>{badge.label}</Text>
              </View>
            ))}

            <View className={`${statusBadge.bgClass} px-3 py-1 rounded-full`}>
              <Text className={`${statusBadge.textClass} text-xs font-semibold`}>
                {statusBadge.label}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
            <Text className="text-gray-900 font-bold text-base mb-4">Dados de aula</Text>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Laboratório</Text>
                <Text className="text-gray-900 font-bold text-sm mt-0.5">
                  {log.reserva?.local || 'Não informado'}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Data e horário</Text>
                <Text className="text-gray-900 font-bold text-sm mt-0.5">{formattedDate}</Text>
                {Boolean(formattedTime) && (
                  <Text className="text-gray-900 font-bold text-sm">
                    {formattedTime.split(' ')[0] + ' - ' + formattedTime.split(' ')[2]}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Presentes</Text>
                <Text className="text-gray-900 font-bold text-sm mt-0.5">{quantidadeAlunos}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-gray-400 text-xs">Reserva vinculada</Text>
                <Text className="text-gray-900 font-bold text-sm mt-0.5">
                  {formatReservationCode(log.reservaId)}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-gray-400 text-xs">Conteúdo trabalhado</Text>
              <Text className="text-gray-900 font-bold text-sm mt-0.5">{log.nomePratica}</Text>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-4">
            <Text className="text-gray-900 font-bold text-base mb-2.5">Relato enviado</Text>
            <Text className="text-gray-600 text-sm leading-5">
              {log.relatoAula?.trim() || 'Nenhum relato enviado para esta aula.'}
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-5">
            <Text className="text-gray-900 font-bold text-base mb-2.5">
              Pendências para o técnico
            </Text>

            {log.pendenciasTecnico?.trim() ? (
              <Text className="text-gray-600 text-sm leading-5">{log.pendenciasTecnico}</Text>
            ) : avarias.length === 0 ? (
              <Text className="text-gray-500 text-sm">
                Nenhuma pendência registrada para o técnico.
              </Text>
            ) : null}

            {avarias.length > 0 && (
              <View className="gap-2.5 mt-3">
                {avarias.map((avaria) => (
                  <View
                    key={avaria.id}
                    className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5"
                  >
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="text-amber-900 font-semibold text-xs flex-1">
                        {avaria.insumo?.nome || 'Insumo'} •{' '}
                        {DAMAGE_TYPE_LABELS[avaria.tipo_ocorrencia] ?? avaria.tipo_ocorrencia}
                      </Text>
                      <Text className="text-amber-800 text-xs font-bold">
                        Qtd: {avaria.quantidade}
                      </Text>
                    </View>

                    {Boolean(avaria.descricao) && (
                      <Text className="text-amber-800/80 text-xs mt-1">{avaria.descricao}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {log.status !== 'RESOLVIDA' && (
            <Button
              variant="primary"
              title="Editar ata"
              onPress={() =>
                router.push({
                  pathname: '/(protected)/(professor)/(tabs)/ata-form',
                  params: { usageLog: JSON.stringify(log), reservation: '' },
                })
              }
              icon={<Feather name="edit-2" size={16} color="#FFF" className="m-2" />}
            />
          )}
        </ScrollView>
      )}
    </PageWrapper>
  );
}
