import axios from 'axios';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { BaseForm } from '../../components/input-form/base-form';
import { CategorySelector } from '../../components/input-form/category-selector';
import { EquipmentForm } from '../../components/input-form/equipment-form';
import { GlasswareForm } from '../../components/input-form/glassware-form';
import { ReagentForm } from '../../components/input-form/reagent-form';
import { SolutionForm } from '../../components/input-form/solution-form';
import { createInventoryItem } from '../../services/inventory.service';

export default function NewItemScreen() {
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

  const handleSave = async () => {
    const parsedDate = new Date(expirationDate);
    if (isNaN(parsedDate.getTime())) {
      Alert.alert('Erro', 'Por favor, insira uma data válida (Ex: 2026-12-31).');
      return;
    }

    const payload: any = {
      nome: name,
      categoria: category,
      tipo_medida: measurementUnit,
      data_validade: parsedDate.toISOString(),
      quantidade_saldo: Number(currentQuantity),
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
    }

    try {
      const response = await createInventoryItem(category, payload);
      if (response.status === 201) {
        Alert.alert('Sucesso', 'Item cadastrado com sucesso!');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const msgs = error.response.data.message;
        Alert.alert('Erro de Validação', Array.isArray(msgs) ? msgs.join('\n') : msgs);
      } else {
        Alert.alert('Erro', 'Ocorreu um problema no servidor.');
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 240}
      enableAutomaticScroll={true}
    >
      <Text className="text-2xl font-bold mt-2 mb-6 text-gray-800">Novo Item</Text>

      <CategorySelector selectedCategory={category} onSelect={setCategory} />

      <BaseForm
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
        />
      )}

      <TouchableOpacity
        onPress={handleSave}
        className="bg-green-600 rounded-lg p-4 items-center justify-center mt-4 mb-8"
      >
        <Text className="text-white font-bold text-lg">Cadastrar Item</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}