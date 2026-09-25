import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

import { BaseForm } from '../../components/input-form/base-form';
import { EquipmentForm } from '../../components/input-form/equipment-form';
import { GlasswareForm } from '../../components/input-form/glassware-form';
import { ReagentForm } from '../../components/input-form/reagent-form';
import { SolutionForm } from '../../components/input-form/solution-form';
import { updateInventoryItem, deleteInventoryItem } from '../../services/inventory.service';

export default function EditItemScreen() {
  const router = useRouter();
  const { itemData } = useLocalSearchParams();

  const [itemId, setItemId] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('UN');
  const [expirationDate, setExpirationDate] = useState('');

  const [formula, setFormula] = useState('');
  const [cas, setCas] = useState('');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [model, setModel] = useState('');
  const [voltage, setVoltage] = useState('');
  const [capacity, setCapacity] = useState('');

  useEffect(() => {
    if (itemData) {
      const parsed = JSON.parse(itemData as string);

      setItemId(parsed.id);
      setCategory(parsed.categoria);
      setName(parsed.nome);
      setMinQuantity(parsed.quantidade_minima ? String(parsed.quantidade_minima) : '');
      setLocation(parsed.localizacao || '');
      setMeasurementUnit(parsed.tipo_medida);

      if (parsed.data_validade) {
        setExpirationDate(parsed.data_validade.split('T')[0]);
      }

      if (parsed.categoria === 'REAGENTE' && parsed.reagenteInfo) {
        setBrand(parsed.reagenteInfo.marca || '');
        setFormula(parsed.reagenteInfo.formula || '');
        setCas(parsed.reagenteInfo.cas || '');
        setNotes(parsed.reagenteInfo.observacao || '');
      } else if (parsed.categoria === 'SOLUCAO' && parsed.solucaoInfo) {
        setFormula(parsed.solucaoInfo.formula || '');
        setCas(parsed.solucaoInfo.cas || '');
        setNotes(parsed.solucaoInfo.observacao || '');
      } else if (parsed.categoria === 'VIDRARIA' && parsed.vidrariaInfo) {
        setBrand(parsed.vidrariaInfo.marca || '');
        setCapacity(parsed.vidrariaInfo.capacidade || '');
      } else if (parsed.categoria === 'EQUIPAMENTO' && parsed.equipamentoInfo) {
        setBrand(parsed.equipamentoInfo.marca || '');
        setModel(parsed.equipamentoInfo.modelo || '');
        setVoltage(parsed.equipamentoInfo.voltagem || '');
      }
    }
  }, [itemData]);

  const handleUpdate = async () => {
    const parsedDate = new Date(expirationDate);
    if (isNaN(parsedDate.getTime())) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Insira uma data válida.' });
      return;
    }

    const payload: any = {
      nome: name,
      tipo_medida: measurementUnit,
      data_validade: parsedDate.toISOString(),
      quantidade_minima: minQuantity ? Number(minQuantity) : null,
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
        { text: 'Excluir', style: 'destructive', onPress: handleDelete }
      ]
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
    <KeyboardAwareScrollView
      style={{ backgroundColor: '#F4F7F4' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 120}
    >
      <View className="flex-row justify-between items-center mt-2 mb-6">
        <Text className="text-2xl font-bold text-gray-800">Editar Item</Text>

        <View className="bg-gray-200 px-3 py-1 rounded-full">
          <Text className="text-gray-600 font-bold text-xs">{category}</Text>
        </View>
      </View>

      <BaseForm
        isEditing={true}
        name={name} setName={setName}
        currentQuantity="" setCurrentQuantity={() => {}}
        measurementUnit={measurementUnit} setMeasurementUnit={setMeasurementUnit}
        minQuantity={minQuantity} setMinQuantity={setMinQuantity}
        expirationDate={expirationDate} setExpirationDate={setExpirationDate}
        location={location} setLocation={setLocation}
      />

      {category === 'REAGENTE' && (
        <ReagentForm brand={brand} setBrand={setBrand} formula={formula} setFormula={setFormula} cas={cas} setCas={setCas} notes={notes} setNotes={setNotes} />
      )}
      {category === 'SOLUCAO' && (
        <SolutionForm formula={formula} setFormula={setFormula} cas={cas} setCas={setCas} notes={notes} setNotes={setNotes} />
      )}
      {category === 'VIDRARIA' && (
        <GlasswareForm brand={brand} setBrand={setBrand} capacity={capacity} setCapacity={setCapacity} />
      )}
      {category === 'EQUIPAMENTO' && (
        <EquipmentForm brand={brand} setBrand={setBrand} model={model} setModel={setModel} voltage={voltage} setVoltage={setVoltage} />
      )}

      <View className="mt-8 gap-3">
        <TouchableOpacity onPress={handleUpdate} className="bg-green-700 rounded-lg p-4 items-center shadow-sm">
          <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmDelete} className="bg-red-500 border border-red-500 rounded-lg p-4 items-center shadow-sm">
          <Text className="text-white font-bold text-lg">Excluir Item</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}