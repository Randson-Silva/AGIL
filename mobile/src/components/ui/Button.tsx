import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
}

export function Button({ title, isLoading, variant = 'primary', icon, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      disabled={isLoading}
      className={`flex-row items-center justify-center rounded-full py-3.5 mb-4 ${
        isPrimary ? 'bg-[#00623B]' : 'bg-gray-50 border border-gray-300'
      }`}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : '#00623B'} />
      ) : (
        <>
          {icon}
          <Text
            className={`font-bold text-base ${
              isPrimary ? 'text-white' : 'text-gray-700 ml-3 text-sm font-medium'
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
