import React, { useState } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function NovoItemScreen() {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('REAGENTE');
  const [quantidadeAtual, setQuantidadeAtual] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [quantidadeMin, setQuantidadeMin] = useState('');

  //Reagente e Solução
  const [formula, setFormula] = useState('');
  const [cas, setCas] = useState('');
  const [marca, setMarca] = useState('');
  const [observacao, setObservacao] = useState('');

  //Equipamento
  const [modelo, setModelo] = useState('');
  const [voltagem, setVoltagem] = useState('');

  //Vidraria
  const [capacidade, setCapacidade] = useState('');

  const handleSalvar = async () => {
    const payload = {
      nome,
      categoria,
      quantidade_saldo: Number(quantidadeAtual),
      quantidade_minima: quantidadeMin ? Number(quantidadeMin) : null,
      localizacao,
      formula,
      cas,
      marca,
      observacao,
      modelo,
      voltagem,
      capacidade,
    };

    try {
      const response = await axios.post('http://192.168.0.5:3000/inventory/insumos', payload);

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Item cadastrado com sucesso!');

        setNome('');
        setCategoria('REAGENTE');
        setQuantidadeAtual('');
        setLocalizacao('');
        setQuantidadeMin('');
        setFormula('');
        setCas('');
        setMarca('');
        setObservacao('');
        setModelo('');
        setVoltagem('');
        setCapacidade('');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 400) {
          const mensagensDeErro = error.response.data.message;

          if (Array.isArray(mensagensDeErro)) {
            Alert.alert('Erro de Validação', mensagensDeErro.join('\n'));
          } else {
            Alert.alert('Erro', mensagensDeErro);
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

      <Text className="text-sm font-semibold mb-2 text-gray-600">CATEGORIA *</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <TouchableOpacity
          onPress={() => setCategoria('REAGENTE')}
          className={`px-4 py-2 rounded-full border ${categoria === 'REAGENTE' ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-300'}`}
        >
          <Text className={categoria === 'REAGENTE' ? 'text-white' : 'text-gray-700'}>
            Reagente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCategoria('SOLUCAO')}
          className={`px-4 py-2 rounded-full border ${categoria === 'SOLUCAO' ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-300'}`}
        >
          <Text className={categoria === 'SOLUCAO' ? 'text-white' : 'text-gray-700'}>Solução</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCategoria('VIDRARIA')}
          className={`px-4 py-2 rounded-full border ${categoria === 'VIDRARIA' ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-300'}`}
        >
          <Text className={categoria === 'VIDRARIA' ? 'text-white' : 'text-gray-700'}>
            Vidraria
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCategoria('EQUIPAMENTO')}
          className={`px-4 py-2 rounded-full border ${categoria === 'EQUIPAMENTO' ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-300'}`}
        >
          <Text className={categoria === 'EQUIPAMENTO' ? 'text-white' : 'text-gray-700'}>
            Equipamento
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-sm font-semibold mb-1 text-gray-600">NOME DO ITEM *</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Ácido Clorídrico 37%"
        className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
      />
      <Text className="text-sm font-semibold mb-1 text-gray-600">QUANTIDADE ATUAL *</Text>
      <TextInput
        value={quantidadeAtual}
        onChangeText={setQuantidadeAtual}
        keyboardType="numeric"
        placeholder="Ex.: 100"
        className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
      />
      <Text className="text-sm font-semibold mb-1 text-gray-600">QUANTIDADE MÍNIMA</Text>
      <TextInput
        value={quantidadeMin}
        onChangeText={setQuantidadeMin}
        keyboardType="numeric"
        placeholder="Ex.: 10"
        className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
      />
      <Text className="text-sm font-semibold mb-1 text-gray-600">LOCALIZAÇÃO</Text>
      <TextInput
        value={localizacao}
        onChangeText={setLocalizacao}
        placeholder="Ex.: Laboratório 1, Prateleira A"
        className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
      />

      {(categoria === 'REAGENTE' || categoria === 'VIDRARIA' || categoria === 'EQUIPAMENTO') && (
        <View>
          <Text className="text-sm font-semibold mb-1 text-gray-600">MARCA</Text>
          <TextInput
            value={marca}
            onChangeText={setMarca}
            placeholder="Ex.: Sigma-Aldrich"
            className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
          />
        </View>
      )}

      {(categoria === 'REAGENTE' || categoria === 'SOLUCAO') && (
        <View>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1 text-gray-600">FÓRMULA</Text>
              <TextInput
                value={formula}
                onChangeText={setFormula}
                placeholder="Ex.: HCl"
                className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold mb-1 text-gray-600">Nº CAS</Text>
              <TextInput
                value={cas}
                onChangeText={setCas}
                placeholder="Ex.: 7647-01-0"
                className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
              />
            </View>
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-1 text-gray-600">OBSERVAÇÃO</Text>
            <TextInput
              value={observacao}
              onChangeText={setObservacao}
              multiline={true}
              numberOfLines={4}
              placeholder="Ex.: Observação sobre o item"
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
            />
          </View>
        </View>
      )}

      {categoria === 'VIDRARIA' && (
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1 text-gray-600">CAPACIDADE</Text>
            <TextInput
              value={capacidade}
              onChangeText={setCapacidade}
              placeholder="Ex.: 1000 mL"
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
            />
          </View>
        </View>
      )}

      {categoria === 'EQUIPAMENTO' && (
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1 text-gray-600">MODELO</Text>
            <TextInput
              value={modelo}
              onChangeText={setModelo}
              placeholder="Ex.: Model X"
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold mb-1 text-gray-600">VOLTAGEM</Text>
            <TextInput
              value={voltagem}
              onChangeText={setVoltagem}
              placeholder="Ex.: 12V"
              className="border border-gray-300 rounded-lg p-3 mb-4 text-base"
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSalvar}
        className="bg-green-600 rounded-lg p-4 items-center justify-center mt-8"
      >
        <Text className="text-white font-bold text-lg">Cadastrar Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
