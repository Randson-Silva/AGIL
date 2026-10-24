import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

import { PageWrapper } from '../../components/ui/page-wrapper';
import { BackButton } from '../../components/ui/Back-button';
import { HeaderDashboard } from '../../components/dashboard/header-dashboard';
import { UserInfoCard } from '../../components/profile/user-info-card';
import { PermissionsListCard } from '../../components/profile/permissions-list-card';
import { useProfile } from '../../hooks/useProfile';

export default function PerfilScreen() {
  const {
    displayName,
    email,
    firstName,
    initials,
    roleLabel,
    permissions,
    handleLogout,
  } = useProfile();

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Perfil"
        icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
        hasBorder
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
      >
        <View className="flex-row items-center mb-4">
          <BackButton />
        </View>

        <UserInfoCard
          name={displayName}
          email={email}
          initials={initials}
          roleLabel={roleLabel}
        />

        <PermissionsListCard permissions={permissions} />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          className="bg-white border border-gray-200 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm"
        >
          <Feather name="log-out" size={18} color="#111827" />
          <Text className="text-gray-900 font-bold text-sm">Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </PageWrapper>
  );
}
