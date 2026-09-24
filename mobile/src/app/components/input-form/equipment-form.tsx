import React from 'react';
import { View } from 'react-native';
import { FormInput } from './form-input';

interface EquipmentFormProps {
  brand: string;
  setBrand: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
  voltage: string;
  setVoltage: (val: string) => void;
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  brand,
  setBrand,
  model,
  setModel,
  voltage,
  setVoltage,
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
  </View>
);
