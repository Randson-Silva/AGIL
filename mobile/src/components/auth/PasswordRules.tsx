import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface PasswordRulesProps {
  password: string;
}

export function PasswordRules({ password }: PasswordRulesProps) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMinLength = password.length >= 8;

  const RuleItem = ({
    isValid,
    text,
    isDefaultRed = false,
  }: {
    isValid: boolean;
    text: string;
    isDefaultRed?: boolean;
  }) => {
    let iconName: keyof typeof Feather.glyphMap = 'info';
    let colorClass = 'text-gray-500';

    if (isValid) {
      iconName = 'check-circle';
      colorClass = 'text-green-600';
    } else if (isDefaultRed && password.length > 0) {
      iconName = 'x-circle';
      colorClass = 'text-red-500';
    }

    return (
      <View className="flex-row items-center mb-1">
        <Feather
          name={iconName}
          size={14}
          className={colorClass}
          color={isValid ? '#16a34a' : isDefaultRed && password.length > 0 ? '#ef4444' : '#6b7280'}
        />
        <Text className={`text-xs ml-2 ${colorClass} font-medium`}>{text}</Text>
      </View>
    );
  };

  return (
    <View className="mb-4 pl-2 mt-[-8px]">
      <RuleItem isValid={hasUpperCase} text="No mínimo uma letra maiúscula" />
      <RuleItem
        isValid={hasSpecialChar}
        text="No mínimo um caractere especial (Ex.: @ ! $ %)"
        isDefaultRed
      />
      <RuleItem isValid={hasMinLength} text="No mínimo oito caracteres" />
    </View>
  );
}
