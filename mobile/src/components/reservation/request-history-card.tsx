import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  MaterialRequestItemDetail,
  MaterialRequestResponse,
} from '../../services/material-request.service';
import { formatMaterialProtocol } from '../../utils/protocol.utils';

interface RequestHistoryCardProps {
  item: MaterialRequestResponse;
}

const UNIT_SHORT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'un',
};

const COLLAPSED_ITEMS_LIMIT = 3;

function formatQuantity(detail: MaterialRequestItemDetail): string {
  const num = Number(detail.quantidade);
  const formattedNum = Number.isNaN(num) ? String(detail.quantidade) : String(num);
  const unit = detail.insumo?.tipo_medida || 'UN';
  const suffix = UNIT_SHORT_LABELS[unit] || unit;
  return `${formattedNum} ${suffix}`;
}

export function RequestHistoryCard({ item }: RequestHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  let badgeConfig = { bg: 'bg-gray-100', text: 'text-gray-600', label: item.status as string };

  if (item.status === 'APROVADA') {
    badgeConfig = { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Aprovada' };
  } else if (item.status === 'PENDENTE') {
    badgeConfig = { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendente' };
  } else if (item.status === 'REJEITADA') {
    badgeConfig = { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitada' };
  } else if (item.status === 'CANCELADA') {
    badgeConfig = { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Cancelada' };
  } else if (item.status === 'DEVOLVIDA') {
    badgeConfig = { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Devolvida' };
  }

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const datePart = iso.split('T')[0];
      const [year, month, day] = datePart.split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return iso;
    }
  };

  const retiradaStr = item.data_retirada ? `Retirada ${formatDateTime(item.data_retirada)}` : null;
  const devolucaoStr = item.data_devolucao
    ? `Devolução ${formatDateTime(item.data_devolucao)}`
    : 'Sem devolução';

  const items = item.itens || [];
  const itemsCount = items.length;
  const itemsLabel = itemsCount === 1 ? '1 item' : `${itemsCount} itens`;
  const hasMoreItems = itemsCount > COLLAPSED_ITEMS_LIMIT;
  const visibleItems = expanded ? items : items.slice(0, COLLAPSED_ITEMS_LIMIT);
  const protocolCode = formatMaterialProtocol(item.id);

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm mx-6">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-gray-900 font-bold text-base mb-0.5">{protocolCode}</Text>
          <Text className="text-gray-500 text-xs">
            {itemsLabel}
            {retiradaStr ? ` · ${retiradaStr}` : ''} · {devolucaoStr}
          </Text>
        </View>

        <View className={`${badgeConfig.bg} px-3 py-1 rounded-full`}>
          <Text className={`${badgeConfig.text} font-medium text-xs`}>{badgeConfig.label}</Text>
        </View>
      </View>

      <View className="bg-[#F2F5F3] rounded-2xl px-3.5 py-2.5">
        {visibleItems.length > 0 ? (
          visibleItems.map((reqItem, index) => {
            const isLast = index === visibleItems.length - 1;
            return (
              <View
                key={reqItem.id || `${reqItem.insumo_id}-${index}`}
                className={`flex-row justify-between items-center py-1.5 ${
                  !isLast ? 'border-b border-gray-200/80' : ''
                }`}
              >
                <Text className="text-xs text-gray-900 font-medium flex-1 pr-2" numberOfLines={1}>
                  {reqItem.insumo?.nome || 'Insumo'}
                </Text>
                <Text className="text-xs text-gray-700 font-semibold">
                  {formatQuantity(reqItem)}
                </Text>
              </View>
            );
          })
        ) : (
          <Text className="text-xs text-gray-500 py-1">Nenhum item listado.</Text>
        )}

        {hasMoreItems && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setExpanded((prev) => !prev)}
            className="pt-2 items-center"
          >
            <Text className="text-xs font-bold text-[#00623B]">
              {expanded ? 'Mostrar menos' : `Ver todos (${itemsCount} itens)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {item.status === 'REJEITADA' && Boolean(item.motivo_rejeicao) && (
        <View className="bg-red-50 rounded-xl p-3 mt-3">
          <Text className="text-xs text-red-700">Motivo: {item.motivo_rejeicao}</Text>
        </View>
      )}
    </View>
  );
}
