import React, { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { BackButton } from '../../../components/ui/Back-button';
import { CalendarModal } from '../../../components/reservation/calendar-modal';
import { useAuth } from '../../../hooks/useAuth';
import {
  formatBrDate,
  formatRelativeDateTime,
  MaterialHistoryFilterStatus,
  ProfessorHistoryMode,
  useProfessorHistorico,
} from '../../../hooks/useProfessorHistorico';

const UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'UND',
};

const OCCURRENCE_LABELS: Record<string, string> = {
  QUEBRA: 'Quebra',
  DEFEITO: 'Defeito',
  CONTAMINACAO: 'Contaminação',
  EXTRAVIO: 'Extravio',
  OUTRO: 'Outro',
};

const MATERIAL_STATUS_PILLS: {
  label: string;
  value: MaterialHistoryFilterStatus;
}[] = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Aprovados', value: 'APROVADA' },
  { label: 'Devolvidos', value: 'DEVOLVIDA' },
  { label: 'Rejeitados', value: 'REJEITADA' },
];

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

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ProfessorHistoricoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { initialMode } = useLocalSearchParams<{ initialMode?: ProfessorHistoryMode }>();
  const resolvedInitialMode: ProfessorHistoryMode =
    initialMode === 'AVARIAS' ? 'AVARIAS' : 'MATERIAIS';

  const {
    firstName,
    initials,
    mode,
    setMode,
    startDate,
    endDate,
    handleChangeStartDate,
    handleChangeEndDate,
    materialStatus,
    setMaterialStatus,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    materialItems,
    hasAnyMaterialHistory,
    breakdownItems,
    hasAnyBreakdownHistory,
    isLoading,
    isRefreshing,
    isExportingPdf,
    handleRefresh,
    handleClearFilters,
    handleExportPdf,
  } = useProfessorHistorico(resolvedInitialMode);

  const [activeDatePicker, setActiveDatePicker] = useState<
    'start' | 'end' | null
  >(null);

  const handleSelectCalendarDate = (dateIso: string) => {
    const selected = isoToLocalDate(dateIso);
    if (activeDatePicker === 'start') {
      handleChangeStartDate(selected);
    } else if (activeDatePicker === 'end') {
      handleChangeEndDate(selected);
    }
  };

  const renderMaterialBadge = (
    status: 'APROVADA' | 'DEVOLVIDA' | 'REJEITADA',
  ) => {
    if (status === 'DEVOLVIDA') {
      return (
        <View className="px-3 py-0.5 rounded-full bg-[#E3F3EC] border border-[#00623B]/40">
          <Text className="text-[11px] font-semibold text-[#00623B]">
            Devolvido
          </Text>
        </View>
      );
    }
    if (status === 'REJEITADA') {
      return (
        <View className="px-3 py-0.5 rounded-full bg-[#FEE2E2] border border-[#DC2626]/40">
          <Text className="text-[11px] font-semibold text-[#DC2626]">
            Rejeitado
          </Text>
        </View>
      );
    }
    return (
      <View className="px-3 py-0.5 rounded-full bg-[#F3F4F6] border border-[#6B7280]/40">
        <Text className="text-[11px] font-semibold text-[#374151]">
          Aprovado
        </Text>
      </View>
    );
  };

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title={mode === 'MATERIAIS' ? 'Histórico de uso' : 'Histórico de avarias'}
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
        {/* Botão Voltar */}
        <View className="mb-4">
          <BackButton />
        </View>

        {/* Seletor de Modo: Materiais vs Avarias */}
        <View className="flex-row bg-white border border-gray-200 rounded-2xl p-1 mb-5">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode('MATERIAIS')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              mode === 'MATERIAIS' ? 'bg-[#00623B]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                mode === 'MATERIAIS' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Materiais
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode('AVARIAS')}
            className={`flex-1 py-2.5 rounded-xl items-center ${
              mode === 'AVARIAS' ? 'bg-[#00623B]' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                mode === 'AVARIAS' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Avarias
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro de Período (De / Até) */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-900 mb-1.5 ml-1">
              De
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveDatePicker('start')}
              className="bg-white border border-gray-200 rounded-2xl px-3.5 py-3 flex-row items-center"
            >
              <MaterialCommunityIcons
                name="calendar-search"
                size={20}
                color="#374151"
              />
              <Text className="text-sm font-medium text-gray-900 ml-2.5">
                {formatBrDate(startDate)}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <Text className="text-xs font-bold text-gray-900 mb-1.5 ml-1">
              Até
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveDatePicker('end')}
              className="bg-white border border-gray-200 rounded-2xl px-3.5 py-3 flex-row items-center"
            >
              <MaterialCommunityIcons
                name="calendar-search"
                size={20}
                color="#374151"
              />
              <Text className="text-sm font-medium text-gray-900 ml-2.5">
                {formatBrDate(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendário Genérico do Sistema */}
        <CalendarModal
          visible={activeDatePicker !== null}
          onClose={() => setActiveDatePicker(null)}
          selectedDate={
            activeDatePicker === 'start'
              ? dateToIso(startDate)
              : dateToIso(endDate)
          }
          onSelectDate={handleSelectCalendarDate}
          allowPastDates
          title={activeDatePicker === 'start' ? 'Data inicial' : 'Data final'}
        />

        {/* Barra de Lupa + Pílulas (Materiais) ou Busca (Avarias) */}
        {mode === 'MATERIAIS' ? (
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
              {MATERIAL_STATUS_PILLS.map((pill) => {
                const isSelected = materialStatus === pill.value;
                return (
                  <TouchableOpacity
                    key={pill.value}
                    activeOpacity={0.8}
                    onPress={() => setMaterialStatus(pill.value)}
                    className={`px-4 py-1.5 rounded-full border ${
                      isSelected
                        ? 'bg-[#00623B] border-[#00623B]'
                        : 'bg-white border-gray-200'
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
        ) : (
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-3.5 h-11 mb-4">
            <Feather name="search" size={16} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por material, ocorrência ou local..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-xs text-gray-900 ml-2.5"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Campo de Busca Expansível (Modo Materiais) */}
        {mode === 'MATERIAIS' && isSearchOpen && (
          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-3.5 h-11 mb-4">
            <Feather name="search" size={16} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por material ou finalidade..."
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

        {/* Listagem */}
        {isLoading && !isRefreshing ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#00623B" />
            <Text className="text-xs text-gray-400 mt-2">
              Carregando histórico...
            </Text>
          </View>
        ) : mode === 'MATERIAIS' ? (
          materialItems.length > 0 ? (
            <View className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-6">
              {materialItems.map((item, index) => {
                const unit =
                  UNIT_LABELS[item.unidadeMedida] || item.unidadeMedida;
                const isLast = index === materialItems.length - 1;
                const qtyColor =
                  item.status === 'DEVOLVIDA'
                    ? 'text-[#00623B]'
                    : item.status === 'REJEITADA'
                      ? 'text-[#DC2626]'
                      : 'text-gray-900';

                return (
                  <View
                    key={item.id}
                    className={`px-4 py-4 flex-row items-center justify-between ${
                      !isLast ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        numberOfLines={1}
                        className="text-sm font-bold text-gray-900 mb-0.5"
                      >
                        {item.materialNome}
                      </Text>
                      <Text numberOfLines={1} className="text-xs text-gray-500">
                        {item.finalidade} ·{' '}
                        {formatRelativeDateTime(item.dataEvento)}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-[11px] text-gray-400 mt-0.5"
                      >
                        Solicitado em {formatDateShort(item.criadaEm)}
                      </Text>
                      {item.status === 'REJEITADA' && item.motivoRejeicao ? (
                        <Text
                          numberOfLines={1}
                          className="text-[11px] text-[#DC2626]/80 mt-0.5"
                        >
                          Motivo: {item.motivoRejeicao}
                        </Text>
                      ) : null}
                    </View>

                    <View className="items-end">
                      <Text className={`text-sm font-bold mb-1.5 ${qtyColor}`}>
                        {item.quantidade} {unit}
                      </Text>
                      {renderMaterialBadge(item.status)}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-white border border-gray-200 rounded-3xl p-8 items-center mb-6">
              <Feather name="inbox" size={28} color="#9CA3AF" />
              <Text className="text-sm font-semibold text-gray-700 mt-3 text-center">
                {!hasAnyMaterialHistory
                  ? 'Ainda não possui materiais no seu histórico'
                  : 'Nenhum registro encontrado'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1 text-center">
                {!hasAnyMaterialHistory
                  ? 'Suas solicitações de materiais aprovadas, devolvidas ou rejeitadas aparecerão aqui.'
                  : 'Não há solicitações para os filtros informados.'}
              </Text>
              {hasAnyMaterialHistory && (
                <TouchableOpacity
                  onPress={handleClearFilters}
                  className="mt-4 px-4 py-2 rounded-full bg-[#E3F3EC]"
                >
                  <Text className="text-xs font-bold text-[#00623B]">
                    Limpar filtros
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        ) : breakdownItems.length > 0 ? (
          <View className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-6">
            {breakdownItems.map((item, index) => {
              const unit =
                UNIT_LABELS[item.insumo.tipo_medida] || item.insumo.tipo_medida;
              const ocorr =
                OCCURRENCE_LABELS[item.tipo_ocorrencia] || item.tipo_ocorrencia;
              const isLast = index === breakdownItems.length - 1;
              const reportCode = `A-${item.id.substring(0, 4).toUpperCase()}`;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname:
                        user?.profile === 'ALUNO'
                          ? '/(protected)/(aluno)/breakdown-details'
                          : '/(protected)/(professor)/breakdown-details',
                      params: { breakdownData: JSON.stringify(item) },
                    })
                  }
                  className={`px-4 py-4 flex-row items-center justify-between ${
                    !isLast ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <Text
                      numberOfLines={1}
                      className="text-sm font-bold text-gray-900 mb-0.5"
                    >
                      {item.insumo.nome}
                    </Text>
                    <Text numberOfLines={1} className="text-xs text-gray-500">
                      {ocorr} · {formatRelativeDateTime(item.data_reporte)}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="text-[11px] text-gray-400 mt-0.5"
                    >
                      {reportCode}
                      {item.insumo.localizacao
                        ? ` · ${item.insumo.localizacao}`
                        : ''}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View className="items-end">
                      <Text className="text-sm font-bold text-[#DC2626] mb-1">
                        -{Number(item.quantidade)} {unit}
                      </Text>
                      <View className="px-3 py-0.5 rounded-full bg-[#FEE2E2] border border-[#DC2626]/40">
                        <Text className="text-[11px] font-semibold text-[#DC2626]">
                          Avaria
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="bg-white border border-gray-200 rounded-3xl p-8 items-center mb-6">
            <Feather name="alert-triangle" size={28} color="#9CA3AF" />
            <Text className="text-sm font-semibold text-gray-700 mt-3 text-center">
              {!hasAnyBreakdownHistory
                ? 'Nenhuma avaria reportada por você'
                : 'Nenhuma avaria encontrada'}
            </Text>
            <Text className="text-xs text-gray-500 mt-1 text-center">
              {!hasAnyBreakdownHistory
                ? 'Quando você reportar uma avaria, o acompanhamento aparecerá aqui.'
                : 'Não há reportes de avaria para os filtros informados.'}
            </Text>
            {hasAnyBreakdownHistory && (
              <TouchableOpacity
                onPress={handleClearFilters}
                className="mt-4 px-4 py-2 rounded-full bg-[#E3F3EC]"
              >
                <Text className="text-xs font-bold text-[#00623B]">
                  Limpar filtros
                </Text>
              </TouchableOpacity>
            )}
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
              <MaterialCommunityIcons
                name="file-download-outline"
                size={20}
                color="#FFF"
              />
              <Text className="text-white font-bold text-sm ml-2">
                Gerar relatório em PDF
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </PageWrapper>
  );
}