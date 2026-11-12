import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import axios from 'axios';

import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { CategorySelector, CategoryType } from '../../../components/input-form/category-selector';
import { BreakdownMaterialCard } from '../../../components/breakdown/breakdown-material-card';
import { useAuth } from '../../../hooks/useAuth';
import { InventoryItem } from '../../../hooks/useInventory';
import { getInventoryItems } from '../../../services/inventory.service';
import { createBreakdown } from '../../../services/breakdown.service';

type OccurrenceType = 'QUEBRA' | 'DEFEITO' | 'EXTRAVIO' | 'CONTAMINACAO';

const OCCURRENCE_OPTIONS: { label: string; value: OccurrenceType }[] = [
  { label: 'Quebra', value: 'QUEBRA' },
  { label: 'Defeito', value: 'DEFEITO' },
  { label: 'Extravio', value: 'EXTRAVIO' },
  { label: 'Contaminação', value: 'CONTAMINACAO' },
];

export default function ReportBreakdownScreen() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [category, setCategory] = useState<CategoryType>('REAGENTE');
  const [occurrenceType, setOccurrenceType] = useState<OccurrenceType>('QUEBRA');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, string>>({});
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setCategory('REAGENTE');
      setOccurrenceType('QUEBRA');
      setSelectedQuantities({});
      setDescription('');

      const fetchItems = async () => {
        setIsLoadingInventory(true);
        try {
          const res = await getInventoryItems();
          if (isActive) {
            setInventoryItems(res.data || []);
          }
        } catch (error) {
          console.error('Erro ao buscar inventário:', error);
        } finally {
          if (isActive) {
            setIsLoadingInventory(false);
          }
        }
      };

      fetchItems();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const filteredMaterials = useMemo(() => {
    return inventoryItems.filter((item) => item.categoria === category);
  }, [inventoryItems, category]);

  const handleToggleMaterial = (itemId: string) => {
    setSelectedQuantities((prev) => {
      const next = { ...prev };
      if (next[itemId] !== undefined) {
        delete next[itemId];
      } else {
        next[itemId] = '';
      }
      return next;
    });
  };

  const handleChangeQuantity = (itemId: string, value: string) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSubmit = async () => {
    const selectedIds = Object.keys(selectedQuantities);

    if (selectedIds.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Material obrigatório',
        text2: 'Selecione pelo menos um material afetado.',
      });
      return;
    }

    const payloadsToCreate = [];

    for (const id of selectedIds) {
      const item = inventoryItems.find((i) => i.id === id);
      if (!item) continue;

      const rawQty = selectedQuantities[id]?.trim() || '';
      const isUnit =
        item.tipo_medida === 'UN' ||
        item.categoria === 'VIDRARIA' ||
        item.categoria === 'EQUIPAMENTO';

      const parsedQty = isUnit ? parseInt(rawQty, 10) : parseFloat(rawQty.replace(',', '.'));

      if (!rawQty || isNaN(parsedQty) || parsedQty <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Quantidade inválida',
          text2: `Informe uma quantidade maior que zero para "${item.nome}".`,
        });
        return;
      }

      if (parsedQty > Number(item.quantidade_saldo)) {
        Toast.show({
          type: 'error',
          text1: 'Estoque insuficiente',
          text2: `"${item.nome}" possui apenas ${item.quantidade_saldo} disponíveis.`,
        });
        return;
      }

      payloadsToCreate.push({
        insumo_id: item.id,
        quantidade: parsedQty,
        tipo_ocorrencia: occurrenceType,
        descricao: description.trim() || undefined,
      });
    }

    try {
      setIsSubmitting(true);
      await Promise.all(payloadsToCreate.map((payload) => createBreakdown(payload)));

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Avaria reportada e estoque atualizado.',
      });
      router.back();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || 'Não foi possível registrar o reporte.';
        Toast.show({
          type: 'error',
          text1: 'Erro na requisição',
          text2: Array.isArray(msg) ? msg.join('\n') : msg,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível reportar a avaria.',
        });
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
        icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
        hasBorder
      />

      <KeyboardAwareScrollView
        style={{ backgroundColor: '#F8FAF9' }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 180}
        enableAutomaticScroll={true}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="flex-row items-center self-start mb-4"
        >
          <View className="w-7 h-7 rounded-full border border-gray-200 bg-white items-center justify-center mr-2">
            <Feather name="arrow-left" size={14} color="#374151" />
          </View>
          <Text className="text-[#00623B] font-bold text-sm">Voltar</Text>
        </TouchableOpacity>

        <View className="bg-[#FEF3C7] rounded-2xl p-4 flex-row items-center mb-6">
          <Feather name="alert-triangle" size={20} color="#1F2937" style={{ marginRight: 12 }} />
          <Text className="flex-1 text-gray-800 text-xs leading-4">
            O reporte gera baixa no estoque e notifica todos os técnicos por e-mail institucional e
            no painel administrativo.
          </Text>
        </View>

        <CategorySelector
          selectedCategory={category}
          onSelect={setCategory}
          label="Tipo de ocorrência"
        />

        <Text className="text-base font-bold text-gray-900 mb-2.5">Tipo de ocorrência</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {OCCURRENCE_OPTIONS.map((option) => {
            const isSelected = occurrenceType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                onPress={() => setOccurrenceType(option.value)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-base font-bold text-gray-900 mb-2.5">Material afetado</Text>
        <View className="mb-4">
          {isLoadingInventory ? (
            <ActivityIndicator size="small" color="#00623B" className="my-6" />
          ) : filteredMaterials.length > 0 ? (
            filteredMaterials.map((item) => (
              <BreakdownMaterialCard
                key={item.id}
                item={item}
                isSelected={selectedQuantities[item.id] !== undefined}
                quantity={selectedQuantities[item.id] || ''}
                onToggleSelect={() => handleToggleMaterial(item.id)}
                onChangeQuantity={(val) => handleChangeQuantity(item.id, val)}
              />
            ))
          ) : (
            <View className="bg-white border border-gray-200 rounded-2xl p-6 items-center">
              <Text className="text-gray-500 text-xs font-medium">
                Nenhum item desta categoria cadastrado no estoque.
              </Text>
            </View>
          )}
        </View>

        <Text className="text-base font-bold text-gray-900 mb-2.5">Descrição do problema</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Ex.: bureta que quebrou durante a titulação da turma de Química Analítica."
          placeholderTextColor="#6B7280"
          className="bg-white border border-gray-200 rounded-2xl p-4 text-xs text-gray-900 min-h-[110px] mb-6"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-white border border-dashed border-gray-300 rounded-2xl py-7 px-4 items-center justify-center mb-6"
        >
          <Feather name="camera" size={22} color="#00623B" style={{ marginBottom: 8 }} />
          <Text className="text-gray-500 text-xs">Anexar foto do material (opcional)</Text>
        </TouchableOpacity>

        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="flex-1 bg-white border border-gray-200 rounded-2xl py-3.5 items-center justify-center"
          >
            <Text className="text-gray-900 font-bold text-xs">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 rounded-2xl py-3.5 items-center justify-center ${
              isSubmitting ? 'bg-[#00623B]/70' : 'bg-[#00623B]'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text className="text-white font-bold text-xs">Confirmar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </PageWrapper>
  );
}
