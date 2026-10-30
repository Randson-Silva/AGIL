import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import axios from 'axios';

import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { useAuth } from '../../../hooks/useAuth';
import { getInventoryItems } from '../../../services/inventory.service';
import { createBreakdown } from '../../../services/breakdown.service';
import { UNIT_LABELS } from '../../../utils/constants';

const MaterialSelectModal = ({ visible, onClose, onSelect, items, isLoading }: any) => {
  const [search, setSearch] = useState('');
  const filtered = items.filter((item: any) =>
    item.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#F8FAF9] h-[80%] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">Selecionar Material</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-200 rounded-full">
              <Feather name="x" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Buscar material..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-900"
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#00623B" className="mt-10" />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="bg-white p-4 rounded-2xl border border-gray-200 mb-3"
                >
                  <Text className="font-bold text-gray-900 text-base mb-1">{item.nome}</Text>
                  <Text className="text-gray-500 text-xs">
                    {item.localizacao || 'Sem localização'} • {item.quantidade_saldo}{' '}
                    {UNIT_LABELS[item.tipo_medida] || 'un'} disponíveis
                  </Text>
                </TouchableOpacity>
              ))}
              {filtered.length === 0 && (
                <Text className="text-center text-gray-500 mt-10">Nenhum material encontrado.</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function ReportBreakdownScreen() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [tipoOcorrencia, setTipoOcorrencia] = useState<
    'QUEBRA' | 'DEFEITO' | 'CONTAMINACAO' | 'EXTRAVIO' | 'OUTRO'
  >('QUEBRA');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [quantidade, setQuantidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados do Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  const TIPO_OPCOES = [
    { label: 'Quebra', value: 'QUEBRA' },
    { label: 'Defeito', value: 'DEFEITO' },
    { label: 'Contaminação', value: 'CONTAMINACAO' },
    { label: 'Extravio', value: 'EXTRAVIO' },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingInventory(true);
      try {
        const res = await getInventoryItems();
        setInventoryItems(res.data || []);
      } catch (error) {
        console.error('Erro ao buscar inventário', error);
      } finally {
        setIsLoadingInventory(false);
      }
    };
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    if (!selectedMaterial) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Selecione o material afetado.' });
      return;
    }

    const parsedQty = parseFloat(quantidade.replace(',', '.'));
    if (!quantidade || isNaN(parsedQty) || parsedQty <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Informe uma quantidade válida maior que zero.',
      });
      return;
    }

    if (parsedQty > Number(selectedMaterial.quantidade_saldo)) {
      Toast.show({
        type: 'error',
        text1: 'Estoque insuficiente',
        text2: `Existem apenas ${selectedMaterial.quantidade_saldo} unidades disponíveis.`,
      });
      return;
    }

    if (!descricao.trim()) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'A descrição do problema é obrigatória.' });
      return;
    }

    try {
      setIsSubmitting(true);
      await createBreakdown({
        insumo_id: selectedMaterial.id,
        quantidade: parsedQty,
        tipo_ocorrencia: tipoOcorrencia as any,
        descricao,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Avaria reportada e estoque atualizado.',
      });
      router.back();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || 'Verifique sua conexão ou a rota da API.';
        Toast.show({
          type: 'error',
          text1: `Erro ${error.response?.status || ''}`,
          text2: Array.isArray(msg) ? msg.join('\n') : msg,
        });
        console.log('DETALHES DO ERRO API:', error.response?.data);
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível reportar a avaria.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Reportar Avaria"
        icon={<FontAwesome5 name="exclamation-triangle" size={18} color="#FFF" />}
      />

      <View className="flex-row items-center gap-3 px-6 pt-4 pb-2 bg-[#F8FAF9]">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <Feather name="arrow-left" size={20} color="#00623B" />
          <Text className="text-[#00623B] font-bold text-base ml-2">Voltar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 100}
        enableAutomaticScroll={true}
      >
        <View className="bg-[#FEF3C7] rounded-xl p-4 flex-row items-start mb-6 border border-[#FDE68A]">
          <Feather name="alert-triangle" size={20} color="#92400E" className="mt-0.5 mr-3" />
          <Text className="flex-1 text-[#92400E] text-sm font-medium leading-5">
            O reporte gera baixa no estoque e notifica todos os técnicos por e-mail institucional e
            no painel administrativo.
          </Text>
        </View>

        <Text className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
          TIPO DE OCORRÊNCIA
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {TIPO_OPCOES.map((opcao) => {
            const isSelected = tipoOcorrencia === opcao.value;
            return (
              <TouchableOpacity
                key={opcao.value}
                onPress={() => setTipoOcorrencia(opcao.value as any)}
                className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-300'}`}
              >
                <Text
                  className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}
                >
                  {opcao.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
          MATERIAL AFETADO *
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
          className="bg-white border border-gray-300 rounded-2xl p-4 mb-6 flex-row justify-between items-center shadow-sm"
        >
          {selectedMaterial ? (
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-base mb-1">
                {selectedMaterial.nome}
              </Text>
              <Text className="text-gray-500 text-xs">
                {selectedMaterial.localizacao || 'Sem localização'} —{' '}
                {selectedMaterial.quantidade_saldo}{' '}
                {UNIT_LABELS[selectedMaterial.tipo_medida] || 'un'} disp.
              </Text>
            </View>
          ) : (
            <Text className="text-gray-400 text-base font-medium">Toque para selecionar...</Text>
          )}
          <Feather name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        <Text className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
          QUANTIDADE AFETADA *
        </Text>
        <TextInput
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="decimal-pad"
          placeholder="Ex: 1"
          placeholderTextColor="#9CA3AF"
          className="bg-white border border-gray-300 rounded-2xl h-[54px] px-4 text-base text-gray-900 mb-6 shadow-sm"
        />

        <Text className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">
          DESCRIÇÃO DO PROBLEMA *
        </Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Ex.: bureta quebrou durante a titulação da turma de Química Analítica."
          placeholderTextColor="#9CA3AF"
          className="bg-white border border-gray-300 rounded-2xl p-4 text-base text-gray-900 min-h-[120px] mb-6 shadow-sm"
        />

        <TouchableOpacity className="border-2 border-dashed border-[#A7F3D0] bg-[#ECFDF5] rounded-3xl p-6 items-center justify-center mb-8">
          <Feather name="camera" size={24} color="#059669" className="mb-2" />
          <Text className="text-[#059669] font-semibold text-sm">
            Anexar foto do material (opcional)
          </Text>
        </TouchableOpacity>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-white border border-gray-300 rounded-full py-4 items-center justify-center shadow-sm"
          >
            <Text className="text-gray-800 font-bold text-sm">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 rounded-full py-4 items-center justify-center shadow-sm ${isSubmitting ? 'bg-[#00623B]/70' : 'bg-[#00623B]'}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-bold text-sm">Enviar reporte</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <MaterialSelectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelect={setSelectedMaterial}
        items={inventoryItems}
        isLoading={isLoadingInventory}
      />
    </PageWrapper>
  );
}
