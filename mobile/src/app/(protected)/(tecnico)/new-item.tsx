// mobile/src/app/(protected)/(tecnico)/new-item.tsx
import axios from 'axios';
import { useState, useCallback } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { BaseForm } from '../../../components/input-form/base-form';
import { EquipmentForm } from '../../../components/input-form/equipment-form';
import { GlasswareForm } from '../../../components/input-form/glassware-form';
import { ReagentForm } from '../../../components/input-form/reagent-form';
import { SolutionForm } from '../../../components/input-form/solution-form';
import { createInventoryItem } from '../../../services/inventory.service';
import { PageWrapper } from '../../../components/ui/page-wrapper';

export default function NewItemScreen() {
  const router = useRouter();

  const [category, setCategory] = useState('REAGENTE');
  const [name, setName] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState('');
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
  const [isRestricted, setIsRestricted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCategory('REAGENTE');
      setName('');
      setCurrentQuantity('');
      setMinQuantity('');
      setLocation('');
      setMeasurementUnit('UN');
      setExpirationDate('');
      setFormula('');
      setCas('');
      setBrand('');
      setNotes('');
      setModel('');
      setVoltage('');
      setCapacity('');
      setIsRestricted(false);
    }, []),
  );

  const handleSave = async () => {
    const isEquipmentOrGlassware = category === 'EQUIPAMENTO' || category === 'VIDRARIA';
    const isUnit = measurementUnit === 'UN';

    const parsedCurrentQuantity = isUnit
      ? parseInt(currentQuantity, 10)
      : parseFloat(currentQuantity.replace(',', '.'));
    const parsedMinQuantity = minQuantity
      ? isUnit
        ? parseInt(minQuantity, 10)
        : parseFloat(minQuantity.replace(',', '.'))
      : null;

    let finalExpirationDate = null;
    if (!isEquipmentOrGlassware) {
      if (!expirationDate && category === 'REAGENTE') {
        Toast.show({
          type: 'error',
          text1: 'Erro de Validação',
          text2: 'A data de validade é obrigatória para reagentes.',
        });
        return;
      }
      if (expirationDate) {
        finalExpirationDate = `${expirationDate}T00:00:00.000Z`;
      }
    }

    const payload: any = {
      nome: name,
      categoria: category,
      tipo_medida: measurementUnit,
      data_validade: finalExpirationDate,
      quantidade_saldo: parsedCurrentQuantity,
      quantidade_minima: parsedMinQuantity,
      localizacao: location || null,
    };

    if (minQuantity) payload.quantidade_minima = Number(minQuantity);
    if (location) payload.localizacao = location;

    if (category === 'REAGENTE') {
      if (brand) payload.marca = brand;
      if (formula) payload.formula = formula;
      if (cas) payload.cas = cas;
      if (notes) payload.observacao = notes;
    } else if (category === 'SOLUCAO') {
      if (formula) payload.formula = formula;
      if (cas) payload.cas = cas;
      if (notes) payload.observacao = notes;
    } else if (category === 'VIDRARIA') {
      if (brand) payload.marca = brand;
      if (capacity) payload.capacidade = capacity;
    } else if (category === 'EQUIPAMENTO') {
      if (brand) payload.marca = brand;
      if (model) payload.modelo = model;
      if (voltage) payload.voltagem = voltage;
      payload.uso_restrito = isRestricted;
    }

    try {
      const response = await createInventoryItem(category, payload);
      if (response.status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Item cadastrado no inventário com sucesso.',
        });
        router.push('/inventory');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const msgs = error.response.data.message;
        Toast.show({
          type: 'error',
          text1: 'Erro de Validação',
          text2: Array.isArray(msgs) ? msgs.join('\n') : msgs,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Ocorreu um problema no servidor.',
        });
      }
    }
  };

  return (
    <PageWrapper className="bg-[#F4F7F4]">
      <View className="flex-row items-center gap-4 px-4 pt-6 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.push('/inventory')}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Novo Item</Text>
      </View>

      <KeyboardAwareScrollView
        style={{ backgroundColor: '#F4F7F4' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 220}
        enableAutomaticScroll={true}
      >
        <BaseForm
          category={category}
          setCategory={setCategory}
          name={name}
          setName={setName}
          currentQuantity={currentQuantity}
          setCurrentQuantity={setCurrentQuantity}
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
            isRestricted={isRestricted}
            setIsRestricted={setIsRestricted}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          className="bg-[#00623B] rounded-2xl py-4 items-center justify-center mt-6 mb-8 shadow-sm"
        >
          <Text className="text-white font-bold text-sm">Cadastrar Item</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </PageWrapper>
  );
}
