import React from 'react';
import { View, Text, Switch } from 'react-native';
import { FormInput } from './form-input';

interface EquipmentFormProps {
  brand: string;
  setBrand: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
  voltage: string;
  setVoltage: (val: string) => void;
  isRestricted: boolean;
  setIsRestricted: (val: boolean) => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  brand,
  setBrand,
  model,
  setModel,
  voltage,
  setVoltage,
  isRestricted,
  setIsRestricted,
}) => (
  <View>
    <FormInput label="MARCA" value={brand} onChangeText={setBrand} placeholder="Ex.: Gehaka" />
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
          placeholder="Ex.: 220V"
        />
      </View>
    </View>

    <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3.5 mt-4">
      <View className="flex-1 pr-4">
        <Text className="text-sm font-bold text-gray-800">Uso restrito ao local</Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          Impede que este equipamento seja retirado do laboratório
        </Text>
      </View>
      <Switch
        value={isRestricted}
        onValueChange={setIsRestricted}
        trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
        thumbColor={isRestricted ? '#00623B' : '#F3F4F6'}
      />
    </View>
  </View>
);