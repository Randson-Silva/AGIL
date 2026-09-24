import React from 'react';
import { View } from 'react-native';
import { FormInput } from './form-input';

interface ReagentFormProps {
  brand: string;
  setBrand: (val: string) => void;
  formula: string;
  setFormula: (val: string) => void;
  cas: string;
  setCas: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
}

export const ReagentForm: React.FC<ReagentFormProps> = ({
  brand,
  setBrand,
  formula,
  setFormula,
  cas,
  setCas,
  notes,
  setNotes,
}) => (
  <View>
    <FormInput
      label="MARCA"
      value={brand}
      onChangeText={setBrand}
      placeholder="Ex.: Sigma-Aldrich"
    />
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
        <FormInput label="Nº CAS" value={cas} onChangeText={setCas} placeholder="Ex.: 7647-01-0" />
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
);
