import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export type ApprovalTabOption = 'RESERVAS' | 'MATERIAIS';

interface ApprovalTabsProps {
  activeTab: ApprovalTabOption;
  onChangeTab: (tab: ApprovalTabOption) => void;
  hasPendingReservations?: boolean;
  hasPendingMaterials?: boolean;
}

export function ApprovalTabs({
  activeTab,
  onChangeTab,
  hasPendingReservations = true,
  hasPendingMaterials = true,
}: ApprovalTabsProps) {
  const isReservationsActive = activeTab === 'RESERVAS';
  const isMaterialsActive = activeTab === 'MATERIAIS';

  return (
    <View className="flex-row rounded-full border border-gray-200 bg-white overflow-hidden h-11 mb-5">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChangeTab('RESERVAS')}
        className={`flex-1 flex-row items-center justify-center ${
          isReservationsActive ? 'bg-[#00623B]' : 'bg-white'
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            isReservationsActive ? 'text-white' : 'text-gray-600'
          }`}
        >
          Reservas
        </Text>
        {hasPendingReservations && (
          <View
            className={`w-1.5 h-1.5 rounded-full ml-2 ${
              isReservationsActive ? 'bg-white' : 'bg-[#00623B]'
            }`}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChangeTab('MATERIAIS')}
        className={`flex-1 flex-row items-center justify-center border-l border-gray-200 ${
          isMaterialsActive ? 'bg-[#00623B]' : 'bg-white'
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            isMaterialsActive ? 'text-white' : 'text-gray-600'
          }`}
        >
          Materiais
        </Text>
        {hasPendingMaterials && (
          <View
            className={`w-1.5 h-1.5 rounded-full ml-2 ${
              isMaterialsActive ? 'bg-white' : 'bg-[#00623B]'
            }`}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
