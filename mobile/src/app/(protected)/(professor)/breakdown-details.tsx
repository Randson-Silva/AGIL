import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { BackButton } from '../../../components/ui/Back-button';
import { useAuth } from '../../../hooks/useAuth';
import { MyBreakdownHistoryItem } from '../../../services/breakdown.service';

const OCCURRENCE_LABELS: Record<string, string> = {
  QUEBRA: 'Quebra',
  DEFEITO: 'Defeito',
  CONTAMINACAO: 'Contaminação',
  EXTRAVIO: 'Extravio',
  OUTRO: 'Outro',
};

const CATEGORY_LABELS: Record<string, string> = {
  EQUIPAMENTO: 'Equipamento',
  VIDRARIA: 'Vidraria',
  SOLUCAO: 'Solução',
  REAGENTE: 'Reagente',
};

const UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'UND',
};

function formatDateTimeBr(dateStr?: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BreakdownDetailsScreen() {
  const { firstName, initials } = useAuth();
  const { breakdownData } = useLocalSearchParams<{ breakdownData?: string }>();

  const breakdown = useMemo<MyBreakdownHistoryItem | null>(() => {
    if (!breakdownData) return null;
    try {
      return JSON.parse(breakdownData) as MyBreakdownHistoryItem;
    } catch {
      return null;
    }
  }, [breakdownData]);

  if (!breakdown) {
    return (
      <PageWrapper className="bg-[#F8FAF9]">
        <HeaderDashboard
          userName={firstName}
          initials={initials}
          title="Histórico de avarias"
          icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
          hasBorder
        />
        <View className="px-5 pt-4">
          <BackButton />
          <View className="bg-white border border-gray-200 rounded-3xl p-8 items-center mt-6">
            <Feather name="alert-circle" size={28} color="#9CA3AF" />
            <Text className="text-sm font-semibold text-gray-700 mt-3 text-center">
              Não foi possível carregar os dados do reporte.
            </Text>
          </View>
        </View>
      </PageWrapper>
    );
  }

  const occurrenceLabel = OCCURRENCE_LABELS[breakdown.tipo_ocorrencia] || breakdown.tipo_ocorrencia;
  const categoryLabel = CATEGORY_LABELS[breakdown.insumo.categoria] || breakdown.insumo.categoria;
  const unitLabel = UNIT_LABELS[breakdown.insumo.tipo_medida] || breakdown.insumo.tipo_medida;
  const reportCode = `A-${breakdown.id.substring(0, 4).toUpperCase()}`;

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Histórico de avarias"
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
      >
        <View className="mb-4">
          <BackButton />
        </View>

        <View className="self-start px-3.5 py-1 rounded-full bg-[#E3F3EC] border border-[#00623B]/40 mb-5">
          <Text className="text-xs font-semibold text-[#00623B]">Reportada</Text>
        </View>

        <Text className="text-base font-bold text-gray-900 mb-3">Dados do reporte</Text>

        <View className="bg-white border border-gray-200 rounded-3xl overflow-hidden mb-6">
          <View className="px-4 py-3.5 flex-row items-center border-b border-gray-200">
            <Feather name="info" size={20} color="#00623B" />
            <View className="ml-3.5 flex-1">
              <Text className="text-sm font-bold text-gray-900">Tipo de ocorrência</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{occurrenceLabel}</Text>
            </View>
          </View>

          <View className="px-4 py-3.5 flex-row items-center border-b border-gray-200">
            <Feather name="clipboard" size={20} color="#00623B" />
            <View className="ml-3.5 flex-1">
              <Text className="text-sm font-bold text-gray-900">Itens afetados</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {breakdown.insumo.nome} · {categoryLabel} ({Number(breakdown.quantidade)}{' '}
                {unitLabel})
              </Text>
            </View>
          </View>

          <View className="px-4 py-3.5 flex-row items-center border-b border-gray-200">
            <Feather name="search" size={20} color="#00623B" />
            <View className="ml-3.5 flex-1">
              <Text className="text-sm font-bold text-gray-900">Localização</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {breakdown.insumo.localizacao || 'Não informada'}
              </Text>
            </View>
          </View>

          <View className="px-4 py-3.5 flex-row items-center">
            <Feather name="file-text" size={20} color="#00623B" />
            <View className="ml-3.5 flex-1">
              <Text className="text-sm font-bold text-gray-900">Número do reporte</Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {reportCode} · {formatDateTimeBr(breakdown.data_reporte)}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-base font-bold text-gray-900 pb-2.5 border-b border-gray-200 mb-3">
          Relato enviado
        </Text>
        <Text className="text-sm text-gray-800 leading-5 pb-6 border-b border-gray-200 mb-5">
          {breakdown.descricao?.trim() || 'Nenhum relato adicional foi enviado.'}
        </Text>

        <Text className="text-base font-bold text-gray-900 mb-3">Parecer do técnico</Text>
        <View className="bg-[#FEF3C7] rounded-3xl p-4">
          <Text className="text-sm text-gray-800 leading-5">
            Aguardando parecer do técnico responsável pelo laboratório.
          </Text>
        </View>
      </ScrollView>
    </PageWrapper>
  );
}
