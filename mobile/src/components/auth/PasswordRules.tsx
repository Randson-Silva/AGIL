import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface PasswordRulesProps {
  password: string;
}

interface RuleItemProps {
  isValid: boolean;
  text: string;
  hasInput: boolean;
  isDefaultRed?: boolean;
}

function RuleItem({ isValid, text, hasInput, isDefaultRed = false }: RuleItemProps) {
  let iconName: keyof typeof Feather.glyphMap = 'info';
  let colorClass = 'text-gray-500';

  if (isValid) {
    iconName = 'check-circle';
    colorClass = 'text-green-600';
  } else if (isDefaultRed && hasInput) {
    iconName = 'x-circle';
    colorClass = 'text-red-500';
  }

  return (
    <View className="flex-row items-center mb-1">
      <Feather
        name={iconName}
        size={14}
        className={colorClass}
        color={isValid ? '#16a34a' : isDefaultRed && hasInput ? '#ef4444' : '#6b7280'}
      />
      <Text className={`text-xs ml-2 ${colorClass} font-medium`}>{text}</Text>
    </View>
  );
}

export function PasswordRules({ password }: PasswordRulesProps) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;
  const hasInput = password.length > 0;

  return (
    <View className="mb-4 pl-2 mt-[-8px]">
      <RuleItem isValid={hasUpperCase} hasInput={hasInput} text="No mínimo uma letra maiúscula" />
      <RuleItem
        isValid={hasSpecialChar}
        hasInput={hasInput}
        text="No mínimo um caractere especial (Ex.: @ ! $ %)"
        isDefaultRed
      />
      <RuleItem isValid={hasMinLength} hasInput={hasInput} text="No mínimo oito caracteres" />
    </View>
  );
}
