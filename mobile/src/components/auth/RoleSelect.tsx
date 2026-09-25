import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export type RoleType = 'ALUNO' | 'PROFESSOR' | 'TECNICO';

interface RoleSelectorProps {
  selectedRole: RoleType;
  onSelectRole: (role: RoleType) => void;
}

const roles: { label: string; value: RoleType }[] = [
  { label: 'Aluno', value: 'ALUNO' },
  { label: 'Professor', value: 'PROFESSOR' },
  { label: 'Técnico', value: 'TECNICO' },
];

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3 ml-1">
        <Feather name="user" size={16} color="#6B7280" />
        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider ml-2">
          Perfil de Acesso
        </Text>
      </View>

      <View className="flex-row justify-between">
        {roles.map((item) => {
          const isActive = selectedRole === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => onSelectRole(item.value)}
              className={`flex-1 items-center justify-center py-2.5 mx-1 rounded-full border ${
                isActive ? 'border-[#00623B] bg-emerald-50' : 'border-gray-200 bg-white'
              }`}
            >
              <Text
                className={`text-sm ${isActive ? 'text-[#00623B] font-semibold' : 'text-gray-500'}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
