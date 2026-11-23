import { HeaderDashboard } from '@/components/dashboard/header-dashboard';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { useReservas } from '@/hooks/useReservas';
import { listUsageLogs, UsageLog } from '@/services/reservation.service';
import { formatReservationDateTime } from '@/utils/usage-log.utils';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type FilterType = 'TODAS' | 'CONCLUIDAS' | 'AVARIAS';

function formatAtaCode(id: string | number) {
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-3).toUpperCase().padStart(3, '0');
  return `A-${suffix}`;
}

function getAvariasCount(log: UsageLog) {
  const maybeAvarias = (log as { avarias?: unknown[] }).avarias;
  return Array.isArray(maybeAvarias) ? maybeAvarias.length : 0;
}

function getAtaStatus(log: UsageLog): {
  label: string;
  bgClass: string;
  textClass: string;
} {
  const avarias = getAvariasCount(log);
  const reservaStatus = (log.reserva as { status?: string } | undefined)?.status;

  if (avarias > 0) {
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

export default function HistoricoAtasScreen() {
  const router = useRouter();
  const { firstName, initials } = useReservas();

  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('TODAS');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await listUsageLogs();
      setLogs(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs]),
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const avarias = getAvariasCount(log);

      if (filter === 'AVARIAS' && avarias === 0) return false;
      if (filter === 'CONCLUIDAS' && avarias > 0) return false;

      if (!query) return true;

      const code = formatAtaCode(log.id).toLowerCase();
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
    { key: 'CONCLUIDAS', label: 'Concluídas' },
    { key: 'AVARIAS', label: 'Com avarias' },
  ];

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Histórico de Atas"
        icon={<Feather name="file-text" size={20} color="#FFF" />}
        hasBorder
      />

      <View className="px-5 pt-4 pb-2">
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

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (searchOpen) setSearch('');
              setSearchOpen((prev) => !prev);
            }}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              searchOpen ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
            }`}
          >
            <Feather
              name={searchOpen ? 'x' : 'search'}
              size={18}
              color={searchOpen ? '#FFFFFF' : '#374151'}
            />
          </TouchableOpacity>

          {/* Tipos para filtragem ao lado da lupa */}
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
                  className={`px-4 h-10 rounded-full justify-center border ${
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

        {/* Campo de pesquisa expandido ao clicar na lupa */}
        {searchOpen && (
          <View className="mt-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center gap-2.5">
            <Feather name="search" size={16} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por código, local, prática ou professor..."
              placeholderTextColor="#9CA3AF"
              autoFocus
              className="flex-1 text-sm text-gray-900"
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 }}
        >
          {filtered.length === 0 ? (
            <Text className="text-gray-500 text-center py-10 px-6 text-sm">
              Nenhuma ata encontrada.
            </Text>
          ) : (
            <View className="gap-3.5">
              {filtered.map((item) => {
                const ataCode = formatAtaCode(item.id);
                const status = getAtaStatus(item);
                const dateTime = item.reserva
                  ? formatReservationDateTime(item.reserva.data_reserva, item.reserva.horarios)
                  : new Date(item.criadoEm).toLocaleDateString('pt-BR');

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push({
                        pathname: '/(protected)/(professor)/(tabs)/ata-relatorio',
                        params: { reservationId: item.reservaId },
                      })
                    }
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex-row items-center justify-between gap-3"
                  >
                    <View className="flex-1">
                      {/* Topo: Código da Ata + Status */}
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="bg-gray-100 px-2.5 py-0.5 rounded-full">
                          <Text className="text-gray-700 text-[11px] font-bold">{ataCode}</Text>
                        </View>

                        <View className={`${status.bgClass} px-2.5 py-0.5 rounded-full`}>
                          <Text className={`${status.textClass} text-[11px] font-semibold`}>
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      {/* LOCAL */}
                      <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>
                        {item.reserva?.local || 'Laboratório não informado'}
                      </Text>

                      {/* DATA ⋅ HORARIO1 - HORARIO2 ⋅ NOMEPROFESSOR */}
                      <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                        {dateTime} ⋅ {item.professorResponsavel}
                      </Text>

                      {/* TITULO */}
                      <Text
                        className="text-gray-800 font-semibold text-sm mt-1.5"
                        numberOfLines={2}
                      >
                        {item.nomePratica}
                      </Text>
                    </View>

                    {/* Ícone de seta no card */}
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
