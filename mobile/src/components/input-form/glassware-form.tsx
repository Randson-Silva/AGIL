import React from 'react';
import { View } from 'react-native';
import { FormInput } from './form-input';

interface GlasswareFormProps {
  brand: string;
  setBrand: (val: string) => void;
  capacity: string;
  setCapacity: (val: string) => void;
}

export const GlasswareForm: React.FC<GlasswareFormProps> = ({
  brand,
  setBrand,
  capacity,
  setCapacity,
}) => (
  <View>
    <FormInput label="MARCA" value={brand} onChangeText={setBrand} placeholder="Ex.: Pyrex" />
    <FormInput
      label="CAPACIDADE"
      value={capacity}
      onChangeText={setCapacity}
      placeholder="Ex.: 1000 mL"
    />
  </View>
);
