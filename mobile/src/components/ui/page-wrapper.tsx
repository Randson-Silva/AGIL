import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageWrapperProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = '',
  style,
  ...rest
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
        },
        style,
      ]}
      className={className}
      {...rest}
    >
      {children}
    </View>
  );
};