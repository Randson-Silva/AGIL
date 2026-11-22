import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarModal } from '../../../../components/reservation/calendar-modal';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

import { PageWrapper } from '../../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../../components/dashboard/header-dashboard';
import { BackButton } from '../../../../components/ui/Back-button';
import {
  formatBrDate,
  formatRelativeDateTime,
  ReservationFilterStatus,
  UsageFilterType,
  useTecnicoHistorico,
} from '../../../../hooks/useTecnicoHistorico';

const UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'UND',
};

const USAGE_PILLS: { label: string; value: UsageFilterType }[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Entrada', value: 'ENTRADA' },
  { label: 'Baixa', value: 'BAIXA' },
  { label: 'Avaria', value: 'AVARIA' },
];

const RESERVATION_PILLS: { label: string; value: ReservationFilterStatus }[] = [
  { label: 'Todas', value: 'TODAS' },
  { label: 'Aceitas', value: 'ACEITAS' },
  { label: 'Recusadas', value: 'RECUSADAS' },
];

function formatReservationDateUtc(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function TecnicoHistoricoScreen() {
  const {
    firstName,
    initials,
    mode,
    setMode,
    startDate,
    endDate,
    handleChangeStartDate,
    handleChangeEndDate,
    usageType,
    setUsageType,
    reservationStatus,
    setReservationStatus,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    usageItems,
    reservationItems,
    isLoading,
    isRefreshing,
    isExportingPdf,
    handleRefresh,
    handleClearFilters,
    handleExportPdf,
  } = useTecnicoHistorico();

  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);

  const handleSelectCalendarDate = (dateIso: string) => {
    const selected = isoToLocalDate(dateIso);
    if (activeDatePicker === 'start') {
      handleChangeStartDate(selected);
    } else if (activeDatePicker === 'end') {
      handleChangeEndDate(selected);
    }
  };

  const renderUsageBadge = (tipo: 'ENTRADA' | 'BAIXA' | 'AVARIA') => {
    if (tipo === 'ENTRADA') {
      return (
        <View className="px-3 py-0.5 rounded-full bg-[#E3F3EC] border border-[#00623B]/40">
          <Text className="text-[11px] font-semibold text-[#00623B]">Entrada</Text>
        </View>
      );
    }
    if (tipo === 'AVARIA') {
      return (
        <View className="px-3 py-0.5 rounded-full bg-[#FEE2E2] border border-[#DC2626]/40">
          <Text className="text-[11px] font-semibold text-[#DC2626]">Avaria</Text>
        </View>
      );
    }
    return (
      <View className="px-3 py-0.5 rounded-full bg-[#F3F4F6] border border-[#6B7280]/40">
        <Text className="text-[11px] font-semibold text-[#374151]">Baixa</Text>
      </View>
    );
  };

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title={mode === 'USO' ? 'Histórico de Uso' : 'Histórico de Reservas'}
        icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
        hasBorder
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#00623B']}
            tintColor="#00623B"
          />
        }
      >
        <View className="mb-4">
          <BackButton />
        </View>

        <View className="flex-row bg-white border border-gray-200 rounded-2xl p-1 mb-5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode('USO')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              mode === 'USO' ? 'bg-[#00623B]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${mode === 'USO' ? 'text-white' : 'text-gray-600'}`}
            >
              Uso de Materiais
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode('RESERVAS')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              mode === 'RESERVAS' ? 'bg-[#00623B]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                mode === 'RESERVAS' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Reservas
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-900 mb-1.5 ml-1">De</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveDatePicker('start')}
              className="bg-white border border-gray-200 rounded-2xl px-3.5 py-3 flex-row items-center"
            >
              <MaterialCommunityIcons name="calendar-search" size={20} color="#374151" />
              <Text className="text-sm font-medium text-gray-900 ml-2.5">
                {formatBrDate(startDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-900 mb-1.5 ml-1">Até</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveDatePicker('end')}
              className="bg-white border border-gray-200 rounded-2xl px-3.5 py-3 flex-row items-center"
            >
              <MaterialCommunityIcons name="calendar-search" size={20} color="#374151" />
              <Text className="text-sm font-medium text-gray-900 ml-2.5">
                {formatBrDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CalendarModal
          visible={activeDatePicker !== null}
          onClose={() => setActiveDatePicker(null)}
          selectedDate={activeDatePicker === 'start' ? dateToIso(startDate) : dateToIso(endDate)}
          onSelectDate={handleSelectCalendarDate}
          allowPastDates
          title={activeDatePicker === 'start' ? 'Data inicial' : 'Data final'}
        />

        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsSearchOpen((prev) => !prev)}
            className={`w-9 h-9 rounded-full items-center justify-center mr-2 ${
              isSearchOpen || searchQuery ? 'bg-[#E3F3EC]' : 'bg-transparent'
            }`}
          >
            <Feather
              name="search"
              size={20}
              color={isSearchOpen || searchQuery ? '#00623B' : '#4B5563'}
            />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {mode === 'USO'
              ? USAGE_PILLS.map((pill) => {
                  const isSelected = usageType === pill.value;
                  return (
                    <TouchableOpacity
                      key={pill.value}
                      activeOpacity={0.8}
                      onPress={() => setUsageType(pill.value)}
                      className={`px-4 py-1.5 rounded-full border ${
                        isSelected ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {pill.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : RESERVATION_PILLS.map((pill) => {
                  const isSelected = reservationStatus === pill.value;
                  return (
                    <TouchableOpacity
                      key={pill.value}
                      activeOpacity={0.8}
                      onPress={() => setReservationStatus(pill.value)}
                      className={`px-4 py-1.5 rounded-full border ${
                        isSelected ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        {pill.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
          </ScrollView>
        </View>

        {isSearchOpen && (
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-3.5 h-11 mb-4">
            <Feather name="search" size={16} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                mode === 'USO'
                  ? 'Buscar por usuário ou material...'
                  : 'Buscar por professor, laboratório ou atividade...'
              }
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-xs text-gray-900 ml-2.5"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {isLoading && !isRefreshing ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#00623B" />
            <Text className="text-xs text-gray-400 mt-2">Carregando histórico...</Text>
          </View>
        ) : mode === 'USO' ? (
          usageItems.length > 0 ? (
            <View className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-6">
              {usageItems.map((item, index) => {
                const unit = UNIT_LABELS[item.unidadeMedida] || item.unidadeMedida;
                const isLast = index === usageItems.length - 1;
                const qtyColor = item.tipo === 'ENTRADA' ? 'text-[#00623B]' : 'text-[#DC2626]';

                return (
                  <View
                    key={item.id}
                    className={`px-4 py-4 flex-row items-center justify-between ${
                      !isLast ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text numberOfLines={1} className="text-sm font-bold text-gray-900 mb-1">
                        {item.materialNome}
                      </Text>
                      <Text numberOfLines={1} className="text-xs text-gray-500">
                        {item.usuarioNome} · {formatRelativeDateTime(item.dataEvento)}
                      </Text>
                      {item.tipo === 'AVARIA' && item.detalhes ? (
                        <Text numberOfLines={1} className="text-[11px] text-[#DC2626]/80 mt-0.5">
                          {item.detalhes}
                        </Text>
                      ) : null}
                    </View>

                    <View className="items-end">
                      <Text className={`text-sm font-bold mb-1.5 ${qtyColor}`}>
                        {item.sinal}
                        {item.quantidade} {unit}
                      </Text>
                      {renderUsageBadge(item.tipo)}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-white border border-gray-200 rounded-3xl p-8 items-center mb-6">
              <Feather name="inbox" size={28} color="#9CA3AF" />
              <Text className="text-sm font-semibold text-gray-700 mt-3 text-center">
                Nenhum registro encontrado
              </Text>
              <Text className="text-xs text-gray-500 mt-1 text-center">
                Não há movimentações ou avarias para os critérios informados.
              </Text>
              <TouchableOpacity
                onPress={handleClearFilters}
                className="mt-4 px-4 py-2 rounded-full bg-[#E3F3EC]"
              >
                <Text className="text-xs font-bold text-[#00623B]">Limpar filtros</Text>
              </TouchableOpacity>
            </View>
          )
        ) : reservationItems.length > 0 ? (
          <View className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-6">
            {reservationItems.map((res, index) => {
              const isLast = index === reservationItems.length - 1;
              const isAccepted = res.status === 'APROVADA';
              const slots =
                res.horarios.length > 0
                  ? `${res.horarios[0].hora_inicio}–${res.horarios[res.horarios.length - 1].hora_fim}`
                  : '';

              return (
                <View
                  key={res.id}
                  className={`px-4 py-4 flex-row items-center justify-between ${
                    !isLast ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <Text numberOfLines={1} className="text-sm font-bold text-gray-900 mb-0.5">
                      {res.local}
                    </Text>
                    <Text numberOfLines={1} className="text-xs text-gray-500">
                      {res.professor?.nome || 'Professor'} ·{' '}
                      {formatRelativeDateTime(res.analisada_em || res.created_at)}
                    </Text>
                    <Text numberOfLines={1} className="text-[11px] text-gray-500 mt-0.5">
                      {res.titulo} · Aula: {formatReservationDateUtc(res.data_reserva)}
                      {slots ? `, ${slots}` : ''}
                    </Text>
                    {!isAccepted && res.motivo_rejeicao ? (
                      <Text numberOfLines={1} className="text-[11px] text-[#DC2626]/80 mt-0.5">
                        Motivo: {res.motivo_rejeicao}
                      </Text>
                    ) : null}
                  </View>

                  <View className="items-end">
                    <View
                      className={`px-3 py-1 rounded-full border ${
                        isAccepted
                          ? 'bg-[#E3F3EC] border-[#00623B]/40'
                          : 'bg-[#FEE2E2] border-[#DC2626]/40'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-semibold ${
                          isAccepted ? 'text-[#00623B]' : 'text-[#DC2626]'
                        }`}
                      >
                        {isAccepted ? 'Aceita' : 'Recusada'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-white border border-gray-200 rounded-3xl p-8 items-center mb-6">
            <Feather name="calendar" size={28} color="#9CA3AF" />
            <Text className="text-sm font-semibold text-gray-700 mt-3 text-center">
              Nenhuma reserva encontrada
            </Text>
            <Text className="text-xs text-gray-500 mt-1 text-center">
              Não há reservas no histórico para os filtros informados.
            </Text>
            <TouchableOpacity
              onPress={handleClearFilters}
              className="mt-4 px-4 py-2 rounded-full bg-[#E3F3EC]"
            >
              <Text className="text-xs font-bold text-[#00623B]">Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isExportingPdf}
          onPress={handleExportPdf}
          className={`rounded-2xl py-3.5 px-5 flex-row items-center justify-center ${
            isExportingPdf ? 'bg-[#00623B]/70' : 'bg-[#00623B]'
          }`}
        >
          {isExportingPdf ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-download-outline" size={20} color="#FFF" />
              <Text className="text-white font-bold text-sm ml-2">Gerar relatório em PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </PageWrapper>
  );
}
