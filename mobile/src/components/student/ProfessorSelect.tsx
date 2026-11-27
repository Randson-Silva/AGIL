import { Input } from '@/components/ui/Input';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export interface ProfessorOption {
  id: string;
  nome: string;
  email: string;
}

interface ProfessorSelectProps {
  label?: string;
  placeholder?: string;
  query: string;
  selectedProfessor: ProfessorOption | null;
  professors: ProfessorOption[];
  isListVisible: boolean;
  onQueryChange: (text: string) => void;
  onSelect: (professor: ProfessorOption) => void;
  onClear: () => void;
  onToggleList: () => void;
  onFocus: () => void;
}

export function ProfessorSelect({
  label = 'Professor Responsável',
  placeholder = 'Pesquisar professor...',
  query,
  selectedProfessor,
  professors,
  isListVisible,
  onQueryChange,
  onSelect,
  onClear,
  onToggleList,
  onFocus,
}: ProfessorSelectProps) {
  return (
    <View className="mb-4">
      <Input
        label={label}
        iconName="user"
        rightIconName={selectedProfessor ? 'x' : 'search'}
        onRightIconPress={selectedProfessor ? onClear : onToggleList}
        placeholder={placeholder}
        value={query}
        onChangeText={onQueryChange}
        onFocus={onFocus}
      />

      {!selectedProfessor && query.trim().length > 0 && (
        <Text className="text-xs text-amber-700 mt-1">Selecione um professor na lista abaixo.</Text>
      )}

      {isListVisible && (
        <View className="bg-white border border-gray-200 rounded-xl mt-1 max-h-48 overflow-hidden shadow-sm">
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {professors.length > 0 ? (
              professors.map((prof) => (
                <TouchableOpacity
                  key={prof.id}
                  onPress={() => onSelect(prof)}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-sm font-medium text-gray-900">{prof.nome}</Text>
                  <Text className="text-xs text-gray-500">{prof.email}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-sm text-gray-500 text-center py-3">
                Nenhum professor encontrado.
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
