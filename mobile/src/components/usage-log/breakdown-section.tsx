import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BreakdownOccurrenceType } from '../../services/breakdown.service';
import { DamageLogPayload } from '../../services/reservation.service';

export interface InventoryItemOption {
  id: string;
  nome: string;
  unidade?: string;
}

export interface DraftBreakdown extends DamageLogPayload {
  insumo_nome: string;
}

interface BreakdownSectionProps {
  items: InventoryItemOption[];
  avarias: DraftBreakdown[];
  onAdd: (avaria: DraftBreakdown) => void;
  onRemove: (index: number) => void;
}

const TIPO_OCORRENCIA_OPTIONS: { value: BreakdownOccurrenceType; label: string }[] = [
  { value: 'QUEBRA', label: 'Quebra' },
  { value: 'DEFEITO', label: 'Defeito' },
  { value: 'CONTAMINACAO', label: 'Contaminação' },
  { value: 'EXTRAVIO', label: 'Extravio' },
  { value: 'OUTRO', label: 'Outro' },
];

const TIPO_OCORRENCIA_LABELS: Record<BreakdownOccurrenceType, string> = {
  QUEBRA: 'Quebra',
  DEFEITO: 'Defeito',
  CONTAMINACAO: 'Contaminação',
  EXTRAVIO: 'Extravio',
  OUTRO: 'Outro',
};

export function BreakdownSection({ items, avarias, onAdd, onRemove }: BreakdownSectionProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItemOption | null>(null);
  const [tipoOcorrencia, setTipoOcorrencia] = useState<BreakdownOccurrenceType>('QUEBRA');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredItems = items.filter((i) => i.nome.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!selectedItem) return;

    onAdd({
      insumo_id: selectedItem.id,
      insumo_nome: selectedItem.nome,
      quantidade: Number(quantidade) > 0 ? Number(quantidade) : 1,
      tipo_ocorrencia: tipoOcorrencia,
      descricao: descricao.trim() || undefined,
    });

    setSelectedItem(null);
    setTipoOcorrencia('QUEBRA');
    setDescricao('');
    setQuantidade('1');
  };

  return (
    <View className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm mb-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-900 font-bold text-base">Registro de avarias</Text>
        <View className="bg-gray-100 px-2.5 py-1 rounded-full">
          <Text className="text-gray-600 text-xs font-medium">Opcional</Text>
        </View>
      </View>

      <Text className="text-gray-500 text-xs mb-4">
        Caso algum material ou vidraria tenha sido danificado, informe abaixo para notificar o
        técnico automaticamente.
      </Text>

      {/* Lista de avarias já adicionadas */}
      {avarias.map((avaria, index) => (
        <View
          key={`${avaria.insumo_id}-${index}`}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-3 flex-row items-start justify-between"
        >
          <View className="flex-1 pr-3">
            <Text className="text-gray-900 font-semibold text-sm">
              {avaria.insumo_nome} (Qtd: {avaria.quantidade ?? 1})
            </Text>
            <Text className="text-amber-800 text-xs font-medium mt-0.5">
              Tipo: {TIPO_OCORRENCIA_LABELS[avaria.tipo_ocorrencia] ?? avaria.tipo_ocorrencia}
            </Text>
            {avaria.descricao ? (
              <Text className="text-gray-600 text-xs mt-1">{avaria.descricao}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={() => onRemove(index)} className="p-1">
            <Feather name="trash-2" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Seletor de Material */}
      <Text className="text-gray-700 text-sm font-medium mb-1.5">Material avariado</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setPickerOpen(true)}
        className="bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 flex-row items-center justify-between mb-3"
      >
        <Text className={selectedItem ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
          {selectedItem ? selectedItem.nome : 'Selecionar material do inventário'}
        </Text>
        <Feather name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      {/* Tipo de ocorrência */}
      <Text className="text-gray-700 text-sm font-medium mb-1.5">Tipo de avaria</Text>
      <View className="flex-row flex-wrap gap-2 mb-3">
        {TIPO_OCORRENCIA_OPTIONS.map((option) => {
          const selected = tipoOcorrencia === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.75}
              onPress={() => setTipoOcorrencia(option.value)}
              className={`px-3 py-1.5 rounded-full border ${
                selected ? 'bg-[#00623B] border-[#00623B]' : 'bg-[#F8FAF9] border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${selected ? 'text-white' : 'text-gray-700'}`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quantidade */}
      <Text className="text-gray-700 text-sm font-medium mb-1.5">Quantidade</Text>
      <TextInput
        value={quantidade}
        onChangeText={(t) => setQuantidade(t.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
        placeholder="1"
        className="bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm mb-3"
      />

      {/* Descrição do problema */}
      <Text className="text-gray-700 text-sm font-medium mb-1.5">Descrição do problema</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        placeholder="Ex: Béquer trincado durante o aquecimento..."
        className="bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm mb-4 min-h-[80px]"
      />

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!selectedItem}
        onPress={handleAdd}
        className={`py-3 rounded-xl flex-row items-center justify-center gap-2 border ${
          selectedItem
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-gray-50 border-gray-200 opacity-60'
        }`}
      >
        <Feather name="plus" size={16} color={selectedItem ? '#00623B' : '#9CA3AF'} />
        <Text
          className={`font-semibold text-sm ${selectedItem ? 'text-[#00623B]' : 'text-gray-400'}`}
        >
          Adicionar avaria
        </Text>
      </TouchableOpacity>

      {/* Modal de seleção do inventário */}
      <Modal visible={pickerOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[28px] p-5 max-h-[75%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-bold text-base">Selecionar material</Text>
              <TouchableOpacity onPress={() => setPickerOpen(false)}>
                <Feather name="x" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar material..."
              className="bg-[#F8FAF9] border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3"
            />

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSelectedItem(item);
                    setPickerOpen(false);
                    setSearch('');
                  }}
                  className="py-3.5 border-b border-gray-100"
                >
                  <Text className="text-gray-900 font-medium text-sm">{item.nome}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
