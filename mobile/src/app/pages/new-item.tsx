import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';

import { createInventoryItem } from '../services/inventory.service';
import { FormInput } from '../components/form-input';
import { CategorySelector } from '../components/category-selector';

export default function NewItemScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('REAGENTE');
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
    const payload = {
      nome: name,
      categoria: category,
      tipo_medida: measurementUnit,
      data_validade: new Date(expirationDate).toISOString(),
      quantidade_saldo: Number(currentQuantity),
      quantidade_minima: minQuantity ? Number(minQuantity) : null,
      localizacao: location,

      formula,
      cas,
      marca: brand,
      observacao: notes,
      modelo: model,
      voltagem: voltage,
      capacidade: capacity,
    };

    try {
      const response = await createInventoryItem(category, payload);

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Item cadastrado com sucesso!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 400) {
          const errorMessages = error.response.data.message;
          if (Array.isArray(errorMessages)) {
            Alert.alert('Erro de Validação', errorMessages.join('\n'));
          } else {
            Alert.alert('Erro', errorMessages);
          }
        } else {
          Alert.alert('Erro', 'Ocorreu um problema no servidor.');
        }
      } else {
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
        console.error(error);
      }
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-gray-800">Novo Item</Text>

      <CategorySelector selectedCategory={category} onSelect={setCategory} />

      <FormInput
        label="NOME DO ITEM *"
        value={name}
        onChangeText={setName}
        placeholder="Ex.: Ácido Clorídrico 37%"
      />

      <View className="flex-row gap-4">
        <View className="flex-1">
          <FormInput
            label="QTD ATUAL *"
            value={currentQuantity}
            onChangeText={setCurrentQuantity}
            keyboardType="numeric"
            placeholder="Ex.: 100"
          />
        </View>
        <View className="flex-1">
          <FormInput
            label="UNIDADE DE MEDIDA *"
            value={measurementUnit}
            onChangeText={setMeasurementUnit}
            placeholder="Ex.: ML, L, G, UN"
          />
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1">
          <FormInput
            label="QTD MÍNIMA"
            value={minQuantity}
            onChangeText={setMinQuantity}
            keyboardType="numeric"
            placeholder="Ex.: 10"
          />
        </View>
        <View className="flex-1">
          <FormInput
            label="VALIDADE *"
            value={expirationDate}
            onChangeText={setExpirationDate}
            placeholder="AAAA-MM-DD"
          />
        </View>
      </View>

      <FormInput
        label="LOCALIZAÇÃO"
        value={location}
        onChangeText={setLocation}
        placeholder="Ex.: Laboratório 1, Prateleira A"
      />

      {(category === 'REAGENTE' || category === 'VIDRARIA' || category === 'EQUIPAMENTO') && (
        <FormInput
          label="MARCA"
          value={brand}
          onChangeText={setBrand}
          placeholder="Ex.: Sigma-Aldrich"
        />
      )}

      {(category === 'REAGENTE' || category === 'SOLUCAO') && (
        <View>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <FormInput
                label="FÓRMULA"
                value={formula}
                onChangeText={setFormula}
                placeholder="Ex.: HCl"
              />
            </View>
            <View className="flex-1">
              <FormInput
                label="Nº CAS"
                value={cas}
                onChangeText={setCas}
                placeholder="Ex.: 7647-01-0"
              />
            </View>
          </View>
          <FormInput
            label="OBSERVAÇÃO"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholder="Ex.: Observação sobre o item"
          />
        </View>
      )}

      {category === 'VIDRARIA' && (
        <FormInput
          label="CAPACIDADE"
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Ex.: 1000 mL"
        />
      )}

      {category === 'EQUIPAMENTO' && (
        <View className="flex-row gap-4">
          <View className="flex-1">
            <FormInput
              label="MODELO"
              value={model}
              onChangeText={setModel}
              placeholder="Ex.: Model X"
            />
          </View>
          <View className="flex-1">
            <FormInput
              label="VOLTAGEM"
              value={voltage}
              onChangeText={setVoltage}
              placeholder="Ex.: 12V"
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSave}
        className="bg-green-600 rounded-lg p-4 items-center justify-center mt-4 mb-8"
      >
        <Text className="text-white font-bold text-lg">Cadastrar Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
