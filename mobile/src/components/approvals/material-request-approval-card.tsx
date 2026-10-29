import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import {
  MaterialRequestItemDetail,
  MaterialRequestResponse,
} from '../../services/material-request.service';
import { OBJECTIVE_LABELS, ReservationObjective } from '../../utils/constants';
import { PriorityBadge } from './priority-badge';

interface MaterialRequestApprovalCardProps {
  item: MaterialRequestResponse;
  mode: 'PENDING' | 'WITHDRAWN';
  isProcessing?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (item: MaterialRequestResponse) => void;
  onConfirmReturn?: (id: string) => void;
}

const UNIT_SHORT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'x',
};

function formatDateBr(isoDate?: string | null): string {
  if (!isoDate) return 'Não informada';
  const datePart = isoDate.split('T')[0];
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function formatQuantity(detail: MaterialRequestItemDetail): string {
  const num = Number(detail.quantidade);
  const formattedNum = Number.isInteger(num) ? String(num) : String(num);
  const unit = detail.insumo?.tipo_medida || 'UN';
  const suffix = UNIT_SHORT_LABELS[unit] || unit;
  return `${formattedNum}${suffix}`;
}

function formatFinalidade(finalidade: string): string {
  if (finalidade in OBJECTIVE_LABELS) {
    return OBJECTIVE_LABELS[finalidade as ReservationObjective];
  }
  return finalidade;
}

export function MaterialRequestApprovalCard({
  item,
  mode,
  isProcessing = false,
  onApprove,
  onReject,
  onConfirmReturn,
}: MaterialRequestApprovalCardProps) {
  const roleLabel =
    item.solicitante?.perfil === 'ALUNO' ? 'Aluno' : 'Professor';
  const protocol = `S-${item.id.substring(0, 4).toUpperCase()}`;
  const finalidadeLabel = formatFinalidade(item.finalidade);
  const isHighPriority =
    item.solicitante?.perfil === 'PROFESSOR' ||
    item.finalidade.toUpperCase().includes('AULA');

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-200/80 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-gray-900">
            {item.solicitante?.nome || 'Solicitante'}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {roleLabel} · {finalidadeLabel} · {protocol}
          </Text>
        </View>
        {mode === 'PENDING' && (
          <PriorityBadge isHighPriority={isHighPriority} />
        )}
      </View>

      <View className="bg-[#F2F5F3] rounded-2xl p-4 my-4">
        {item.itens && item.itens.length > 0 ? (
          item.itens.map((reqItem) => (
            <View
              key={reqItem.id}
              className="flex-row justify-between items-center py-1.5 border-b border-gray-200/80"
            >
              <Text
                className="text-xs text-gray-900 font-medium flex-1 pr-2"
                numberOfLines={1}
              >
                {reqItem.insumo?.nome || 'Insumo'}
              </Text>
              <Text className="text-xs text-gray-900 font-medium">
                {formatQuantity(reqItem)}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-xs text-gray-500 py-1">
            Nenhum item listado
          </Text>
        )}

        <View className="mt-3">
          <Text className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">
            DATA DE DEVOLUÇÃO
          </Text>
          <Text className="text-xs font-medium text-gray-900">
            {formatDateBr(item.data_devolucao)}
          </Text>
        </View>
      </View>

      {mode === 'PENDING' ? (
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isProcessing}
            onPress={() => onReject && onReject(item)}
            className="flex-1 bg-[#F8FAF9] border border-gray-200 rounded-full py-3 items-center justify-center"
          >
            <Text className="text-gray-800 font-semibold text-xs">
              Rejeitar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isProcessing}
            onPress={() => onApprove && onApprove(item.id)}
            className="flex-1 bg-[#00623B] rounded-full py-3 items-center justify-center"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-xs">Aprovar</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isProcessing}
          onPress={() => onConfirmReturn && onConfirmReturn(item.id)}
          className="bg-[#00623B] rounded-full py-3 items-center justify-center"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-xs">
              Confirmar devolução
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
