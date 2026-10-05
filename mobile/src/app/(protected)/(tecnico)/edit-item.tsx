import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

import { BaseForm } from '../../../components/input-form/base-form';
import { EquipmentForm } from '../../../components/input-form/equipment-form';
import { GlasswareForm } from '../../../components/input-form/glassware-form';
import { ReagentForm } from '../../../components/input-form/reagent-form';
import { SolutionForm } from '../../../components/input-form/solution-form';
import { updateInventoryItem, deleteInventoryItem } from '../../../services/inventory.service';
import { BackButton } from '../../../components/ui/Back-button';
import { PageWrapper } from '../../../components/ui/page-wrapper';

// Converte o item recebido pela rota nos valores iniciais do formulário
function getInitialForm(itemData: unknown) {
  const form = {
    itemId: '',
    category: '',
    name: '',
    minQuantity: '',
    location: '',
    measurementUnit: 'UN',
    expirationDate: '',
    formula: '',
    cas: '',
    brand: '',
    notes: '',
    model: '',
    voltage: '',
    capacity: '',
  };

  if (!itemData) return form;

  const parsed = JSON.parse(itemData as string);

  form.itemId = parsed.id;
  form.category = parsed.categoria;
  form.name = parsed.nome;
  form.minQuantity = parsed.quantidade_minima ? String(parsed.quantidade_minima) : '';
  form.location = parsed.localizacao || '';
  form.measurementUnit = parsed.tipo_medida;

  if (parsed.data_validade) {
    form.expirationDate = parsed.data_validade.split('T')[0];
  }

  if (parsed.categoria === 'REAGENTE' && parsed.reagenteInfo) {
    form.brand = parsed.reagenteInfo.marca || '';
    form.formula = parsed.reagenteInfo.formula || '';
    form.cas = parsed.reagenteInfo.cas || '';
    form.notes = parsed.reagenteInfo.observacao || '';
  } else if (parsed.categoria === 'SOLUCAO' && parsed.solucaoInfo) {
    form.formula = parsed.solucaoInfo.formula || '';
    form.cas = parsed.solucaoInfo.cas || '';
    form.notes = parsed.solucaoInfo.observacao || '';
  } else if (parsed.categoria === 'VIDRARIA' && parsed.vidrariaInfo) {
    form.brand = parsed.vidrariaInfo.marca || '';
    form.capacity = parsed.vidrariaInfo.capacidade || '';
  } else if (parsed.categoria === 'EQUIPAMENTO' && parsed.equipamentoInfo) {
    form.brand = parsed.equipamentoInfo.marca || '';
    form.model = parsed.equipamentoInfo.modelo || '';
    form.voltage = parsed.equipamentoInfo.voltagem || '';
  }

  return form;
}

export default function EditItemScreen() {
  const router = useRouter();
  const { itemData } = useLocalSearchParams();

  // Lido uma única vez ao abrir a tela: os estados já nascem preenchidos,
  // sem precisar de um useEffect copiando os dados depois do primeiro render
  const [initial] = useState(() => getInitialForm(itemData));
  const { itemId } = initial;

  const [category, setCategory] = useState(initial.category);
  const [name, setName] = useState(initial.name);
  const [minQuantity, setMinQuantity] = useState(initial.minQuantity);
  const [location, setLocation] = useState(initial.location);
  const [measurementUnit, setMeasurementUnit] = useState(initial.measurementUnit);
  const [expirationDate, setExpirationDate] = useState(initial.expirationDate);

  const [formula, setFormula] = useState(initial.formula);
  const [cas, setCas] = useState(initial.cas);
  const [brand, setBrand] = useState(initial.brand);
  const [notes, setNotes] = useState(initial.notes);
  const [model, setModel] = useState(initial.model);
  const [voltage, setVoltage] = useState(initial.voltage);
  const [capacity, setCapacity] = useState(initial.capacity);

  const handleUpdate = async () => {
    const isEquipmentOrGlassware = category === 'EQUIPAMENTO' || category === 'VIDRARIA';
    const isUnit = measurementUnit === 'UN' || measurementUnit === 'unidades';

    const parsedMinQuantity = minQuantity
      ? isUnit
        ? parseInt(minQuantity, 10)
        : parseFloat(minQuantity.replace(',', '.'))
      : null;

    let finalExpirationDate = null;

    if (!isEquipmentOrGlassware && expirationDate && expirationDate.trim() !== '') {
      const parsedDate = new Date(expirationDate);
      if (isNaN(parsedDate.getTime())) {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Insira uma data válida.' });
        return;
      }
      finalExpirationDate = parsedDate.toISOString();
    }

    const payload: any = {
      nome: name,
      tipo_medida: measurementUnit,
      data_validade: finalExpirationDate,
      quantidade_minima: parsedMinQuantity,
      localizacao: location || null,
    };

    if (category === 'REAGENTE') {
      payload.marca = brand || null;
      payload.formula = formula || null;
      payload.cas = cas || null;
      payload.observacao = notes || null;
    } else if (category === 'SOLUCAO') {
      payload.formula = formula || null;
      payload.cas = cas || null;
      payload.observacao = notes || null;
    } else if (category === 'VIDRARIA') {
      payload.marca = brand || null;
      payload.capacidade = capacity || null;
    } else if (category === 'EQUIPAMENTO') {
      payload.marca = brand || null;
      payload.modelo = model || null;
      payload.voltagem = voltage || null;
    }

    try {
      await updateInventoryItem(itemId, category, payload);
      Toast.show({ type: 'success', text1: 'Atualizado', text2: 'Item atualizado com sucesso!' });
      router.back();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao atualizar o item.' });
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Excluir Item',
      `Tem a certeza que deseja excluir "${name}" do inventário? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: handleDelete },
      ],
    );
  };

  const handleDelete = async () => {
    try {
      await deleteInventoryItem(itemId);
      Toast.show({ type: 'success', text1: 'Excluído', text2: 'Item removido do inventário.' });
      router.back();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao excluir o item.' });
    }
  };

  return (
    <PageWrapper>
      <KeyboardAwareScrollView
        style={{ backgroundColor: '#F4F7F4' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 120}
      >
        <View className="flex-row justify-between items-center mt-2 mb-6">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-800">Editar Item</Text>

          <View className="bg-gray-200 px-3 py-1 rounded-full">
            <Text className="text-gray-600 font-bold text-xs">{category}</Text>
          </View>
        </View>

        <BaseForm
          isEditing={true}
          name={name}
          setName={setName}
          category={category}
          setCategory={setCategory}
          currentQuantity=""
          setCurrentQuantity={() => {}}
          measurementUnit={measurementUnit}
          setMeasurementUnit={setMeasurementUnit}
          minQuantity={minQuantity}
          setMinQuantity={setMinQuantity}
          expirationDate={expirationDate}
          setExpirationDate={setExpirationDate}
          location={location}
          setLocation={setLocation}
        />

        {category === 'REAGENTE' && (
          <ReagentForm
            brand={brand}
            setBrand={setBrand}
            formula={formula}
            setFormula={setFormula}
            cas={cas}
            setCas={setCas}
            notes={notes}
            setNotes={setNotes}
          />
        )}
        {category === 'SOLUCAO' && (
          <SolutionForm
            formula={formula}
            setFormula={setFormula}
            cas={cas}
            setCas={setCas}
            notes={notes}
            setNotes={setNotes}
          />
        )}
        {category === 'VIDRARIA' && (
          <GlasswareForm
            brand={brand}
            setBrand={setBrand}
            capacity={capacity}
            setCapacity={setCapacity}
          />
        )}
        {category === 'EQUIPAMENTO' && (
          <EquipmentForm
            brand={brand}
            setBrand={setBrand}
            model={model}
            setModel={setModel}
            voltage={voltage}
            setVoltage={setVoltage}
          />
        )}

        <View className="mt-8 gap-3">
          <TouchableOpacity
            onPress={handleUpdate}
            className="bg-green-700 rounded-lg p-4 items-center shadow-sm"
          >
            <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmDelete}
            className="bg-red-500 border border-red-500 rounded-lg p-4 items-center shadow-sm"
          >
            <Text className="text-white font-bold text-lg">Excluir Item</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </PageWrapper>
  );
}
