import React from 'react';
import { View } from 'react-native';
import { FormInput } from './form-input';
import { FormSelect } from './form-select';
import { FormDatePicker } from './form-date-picker';

const MEASUREMENT_UNITS = [
  { label: 'Miligrama (mg)', value: 'MG' },
  { label: 'Grama (g)', value: 'G' },
  { label: 'Quilograma (kg)', value: 'KG' },
  { label: 'Mililitro (ml)', value: 'ML' },
  { label: 'Litro (L)', value: 'L' },
  { label: 'Unidade (un)', value: 'UN' },
];

interface BaseFormProps {
  name: string;
  setName: (val: string) => void;
  currentQuantity: string;
  setCurrentQuantity: (val: string) => void;
  measurementUnit: string;
  setMeasurementUnit: (val: string) => void;
  minQuantity: string;
  setMinQuantity: (val: string) => void;
  expirationDate: string;
  setExpirationDate: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
}

export const BaseForm: React.FC<BaseFormProps> = ({
  name,
  setName,
  currentQuantity,
  setCurrentQuantity,
  measurementUnit,
  setMeasurementUnit,
  minQuantity,
  setMinQuantity,
  expirationDate,
  setExpirationDate,
  location,
  setLocation,
}) => {
  return (
    <View>
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
          <FormSelect
            label="UNIDADE DE MEDIDA *"
            selectedValue={measurementUnit}
            onValueChange={setMeasurementUnit}
            options={MEASUREMENT_UNITS}
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
          <FormDatePicker label="VALIDADE *" value={expirationDate} onChange={setExpirationDate} />
        </View>
      </View>

      <FormInput
        label="LOCALIZAÇÃO"
        value={location}
        onChangeText={setLocation}
        placeholder="Ex.: Laboratório 1, Prateleira A"
      />
    </View>
  );
};
