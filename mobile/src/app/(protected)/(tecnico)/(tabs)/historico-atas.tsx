import { HeaderDashboard } from '@/components/dashboard/header-dashboard';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { useAuth } from '@/hooks/useAuth';
import {
  listUsageLogs,
  UsageLog,
  UsageLogOccurrence,
  UsageLogStatus,
} from '@/services/reservation.service';
import { formatAtaCode, formatReservationDateTime } from '@/utils/usage-log.utils';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

type FilterType = 'TODAS' | 'COM_OCORRENCIA' | 'NOVAS' | 'EM_ANALISE' | 'RESOLVIDAS';

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

function formatProfessorName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'Prof. não informado';
  return /^prof\.?\s/i.test(trimmed) ? trimmed : `Prof. ${trimmed}`;
}

function padTwo(value: number) {
  return String(value).padStart(2, '0');
}

function hasLogOccurrence(log: UsageLog) {
  const ocorrencias = log.ocorrencias?.length
    ? log.ocorrencias
    : (['SEM_INTERCORRENCIAS'] as UsageLogOccurrence[]);

  return ocorrencias.some((o) => o !== 'SEM_INTERCORRENCIAS') || (log.avarias?.length ?? 0) > 0;
}

export default function AtasTecnicoScreen() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('TODAS');

  const fetchLogs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const { data } = await listUsageLogs();
      setLogs(data ?? []);
    } catch (error) {
      console.error('Erro ao buscar atas:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar as atas de aula.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs]),
  );

  const summary = useMemo(() => {
    const recebidas = logs.length;
    const comOcorrencia = logs.filter(hasLogOccurrence).length;
    const emAnalise = logs.filter((log) => log.status === 'EM_ANALISE').length;
    return { recebidas, comOcorrencia, emAnalise };
  }, [logs]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const hasOccurrence = hasLogOccurrence(log);

      if (filter === 'COM_OCORRENCIA' && !hasOccurrence) return false;
      if (filter === 'NOVAS' && log.status !== 'PENDENTE') return false;
      if (filter === 'EM_ANALISE' && log.status !== 'EM_ANALISE') return false;
      if (filter === 'RESOLVIDAS' && log.status !== 'RESOLVIDA') return false;

      if (!query) return true;

      const code = formatAtaCode(log).toLowerCase();
      const local = (log.reserva?.local ?? '').toLowerCase();
      const pratica = log.nomePratica.toLowerCase();
      const professor = log.professorResponsavel.toLowerCase();

      return (
        code.includes(query) ||
        local.includes(query) ||
        pratica.includes(query) ||
        professor.includes(query)
      );
    });
  }, [logs, search, filter]);

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'TODAS', label: 'Todas' },
    { key: 'COM_OCORRENCIA', label: 'Com ocorrência' },
    { key: 'NOVAS', label: 'Novas' },
    { key: 'EM_ANALISE', label: 'Em análise' },
    { key: 'RESOLVIDAS', label: 'Resolvidas' },
  ];

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Atas de Aula"
        icon={<Feather name="file-text" size={20} color="#FFF" />}
        hasBorder
      />

      <View className="px-5 pt-4 pb-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.navigate('..')}
          className="flex-row items-center gap-1.5 self-start mb-4"
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100">
            <Feather name="arrow-left" size={18} color="#000000" />
          </View>
          <Text className="text-sm font-bold text-[#00623B]">Voltar</Text>
        </TouchableOpacity>

        {/* Cards de resumo */}
        <View className="flex-row gap-2.5 mb-4">
          <View className="flex-1 bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm items-center">
            <Text className="text-2xl font-extrabold text-[#17221C]">
              {padTwo(summary.recebidas)}
            </Text>
            <Text className="text-[11px] font-medium text-gray-500 text-center mt-1 leading-4">
              Atas{'\n'}recebidas
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm items-center">
            <Text className="text-2xl font-extrabold text-[#CC2C2A]">
              {padTwo(summary.comOcorrencia)}
            </Text>
            <Text className="text-[11px] font-medium text-gray-500 text-center mt-1 leading-4">
              Com{'\n'}ocorrência
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-3.5 border border-gray-100 shadow-sm items-center">
            <Text className="text-2xl font-extrabold text-[#17221C]">
              {padTwo(summary.emAnalise)}
            </Text>
            <Text className="text-[11px] font-medium text-gray-500 text-center mt-1 leading-4">
              Ata em{'\n'}análise
            </Text>
          </View>
        </View>

        {/* Botão de pesquisa + filtros */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (searchOpen) setSearch('');
              setSearchOpen((prev) => !prev);
            }}
            className={`w-9 h-9 rounded-full items-center justify-center border ${
              searchOpen ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
            }`}
          >
            <Feather
              name={searchOpen ? 'x' : 'search'}
              size={16}
              color={searchOpen ? '#FFFFFF' : '#374151'}
            />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {filterOptions.map((opt) => {
              const active = filter === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setFilter(opt.key)}
                  className={`px-4 h-9 rounded-full justify-center border ${
                    active ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-600'}`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {searchOpen && (
          <View className="mt-3 h-11 bg-white border border-gray-200 rounded-2xl px-4 flex-row items-center gap-2.5">
            <Feather name="search" size={16} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por código, local, prática ou professor..."
              placeholderTextColor="#9CA3AF"
              autoFocus
              multiline={false}
              numberOfLines={1}
              returnKeyType="search"
              className="flex-1 h-full py-0 text-sm text-gray-900"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00623B" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLogs(true)}
              tintColor="#00623B"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 }}
        >
          <Text className="text-gray-900 font-bold text-base mb-3">Atas</Text>

          {filtered.length === 0 ? (
            <Text className="text-gray-500 text-center py-10 px-6 text-sm">
              Nenhuma ata encontrada.
            </Text>
          ) : (
            <View className="gap-3.5">
              {filtered.map((item) => {
                const ataCode = formatAtaCode(item);
                const occurrenceBadges = (
                  item.ocorrencias?.length
                    ? item.ocorrencias
                    : (['SEM_INTERCORRENCIAS'] as UsageLogOccurrence[])
                ).map((ocorrencia) => ({
                  key: ocorrencia,
                  ...getOccurrenceBadge(ocorrencia),
                }));
                const statusBadge = getStatusBadge(item.status);
                const dateTime = item.reserva
                  ? formatReservationDateTime(item.reserva.data_reserva, item.reserva.horarios)
                  : new Date(item.criadoEm).toLocaleDateString('pt-BR');

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push({
                        pathname: '/(protected)/(tecnico)/(tabs)/ata-relatorio' as any,
                        params: { reservationId: item.reservaId },
                      })
                    }
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex-row items-center justify-between gap-3"
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-2 mb-2.5">
                        <View className="flex-row items-center flex-wrap gap-1.5 flex-1">
                          {occurrenceBadges.map((badge) => (
                            <View
                              key={badge.key}
                              className={`${badge.bgClass} px-2.5 py-0.5 rounded-full`}
                            >
                              <Text className={`${badge.textClass} text-[11px] font-semibold`}>
                                {badge.label}
                              </Text>
                            </View>
                          ))}

                          <View className={`${statusBadge.bgClass} px-2.5 py-0.5 rounded-full`}>
                            <Text className={`${statusBadge.textClass} text-[11px] font-semibold`}>
                              {statusBadge.label}
                            </Text>
                          </View>
                        </View>

                        <Text className="text-gray-400 text-xs font-bold">{ataCode}</Text>
                      </View>

                      <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {item.reserva?.local || 'Laboratório não informado'}
                      </Text>

                      <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                        {dateTime} ⋅ {formatProfessorName(item.professorResponsavel)}
                      </Text>

                      <Text
                        className="text-gray-800 font-semibold text-sm mt-1.5"
                        numberOfLines={2}
                      >
                        {item.nomePratica}
                      </Text>
                    </View>

                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </PageWrapper>
  );
}
