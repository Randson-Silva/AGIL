import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { ApprovalTabs } from '../../../components/approvals/approval-tabs';
import { PendingReservationCard } from '../../../components/approvals/pending-reservation-card';
import { TodayConfirmedReservationCard } from '../../../components/approvals/today-confirmed-reservation-card';
import { ApprovedReservationCard } from '../../../components/approvals/approved-reservation-card';
import { MaterialRequestApprovalCard } from '../../../components/approvals/material-request-approval-card';
import { RejectModal } from '../../../components/approvals/reject-modal';
import { useAprovacoes } from '../../../hooks/useAprovacoes';

export default function AprovacoesScreen() {
  const router = useRouter();
  const {
    firstName,
    initials,
    activeTab,
    setActiveTab,
    isLoading,
    processingId,
    pendingReservations,
    todayConfirmedReservations,
    approvedReservations,
    handleApproveReservation,
    handleRegisterAbsence,
    handleReallocatePress,
    pendingMaterialRequests,
    withdrawnMaterialRequests,
    handleApproveMaterial,
    handleConfirmReturn,
    rejectTarget,
    rejectReason,
    setRejectReason,
    isRejecting,
    openRejectModal,
    closeRejectModal,
    handleConfirmReject,
    refresh,
  } = useAprovacoes();

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Aprovações"
        icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
        hasBorder
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={['#00623B']}
            tintColor="#00623B"
          />
        }
      >
        {/* Linha de retorno */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="flex-row items-center mb-4 self-start"
        >
          <View className="w-8 h-8 rounded-full border border-gray-200 bg-white items-center justify-center mr-2 shadow-xs">
            <Feather name="arrow-left" size={16} color="#00623B" />
          </View>
          <Text className="text-[#00623B] font-bold text-sm">Voltar</Text>
        </TouchableOpacity>

        {/* Abas de Aprovação */}
        <ApprovalTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasPendingReservations={pendingReservations.length > 0}
          hasPendingMaterials={pendingMaterialRequests.length > 0}
        />

        {/* Conteúdo da Aba: RESERVAS */}
        {activeTab === 'RESERVAS' && (
          <View>
            {/* Lista de Reservas Pendentes */}
            {pendingReservations.length > 0 ? (
              pendingReservations.map((item) => (
                <PendingReservationCard
                  key={item.id}
                  item={item}
                  isProcessing={processingId === item.id}
                  onApprove={handleApproveReservation}
                  onReject={(res) =>
                    openRejectModal(
                      res.id,
                      'RESERVA',
                      `R-${res.id.substring(0, 4).toUpperCase()}`,
                    )
                  }
                />
              ))
            ) : !isLoading ? (
              <View className="bg-white rounded-[24px] p-6 mb-6 items-center justify-center border border-gray-100">
                <Text className="text-gray-500 text-sm font-medium">
                  Nenhuma reserva pendente de aprovação.
                </Text>
              </View>
            ) : null}

            {/* Seção: RESERVAS CONFIRMADAS DE HOJE */}
            <View className="mt-2 mb-2">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                RESERVAS CONFIRMADAS DE HOJE
              </Text>
              <Text className="text-xs text-gray-500 mb-4 leading-4">
                Horário já iniciado. Registre a ausência caso o solicitante não tenha comparecido.
              </Text>

              {todayConfirmedReservations.length > 0 ? (
                todayConfirmedReservations.map((item) => (
                  <TodayConfirmedReservationCard
                    key={item.id}
                    item={item}
                    isProcessing={processingId === item.id}
                    onRegisterAbsence={handleRegisterAbsence}
                  />
                ))
              ) : (
                <View className="bg-white/60 rounded-2xl p-4 mb-4 border border-dashed border-gray-200 items-center">
                  <Text className="text-gray-400 text-xs">
                    Nenhuma aula iniciada aguardando confirmação hoje.
                  </Text>
                </View>
              )}
            </View>

            {/* Seção: RESERVAS APROVADAS */}
            <View className="mt-4 mb-2">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                RESERVAS APROVADAS
              </Text>
              <Text className="text-xs text-gray-500 mb-4 leading-4">
                Se necessária mudanças na reserva, faça a realocação. O solicitante decide se aceita ou não.
              </Text>

              {approvedReservations.length > 0 ? (
                approvedReservations.map((item) => (
                  <ApprovedReservationCard
                    key={item.id}
                    item={item}
                    onReallocatePress={handleReallocatePress}
                  />
                ))
              ) : (
                <View className="bg-white/60 rounded-2xl p-4 mb-4 border border-dashed border-gray-200 items-center">
                  <Text className="text-gray-400 text-xs">
                    Nenhuma reserva aprovada no momento.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Conteúdo da Aba: MATERIAIS */}
        {activeTab === 'MATERIAIS' && (
          <View>
            {/* Lista de Solicitações Pendentes */}
            {pendingMaterialRequests.length > 0 ? (
              pendingMaterialRequests.map((item) => (
                <MaterialRequestApprovalCard
                  key={item.id}
                  item={item}
                  mode="PENDING"
                  isProcessing={processingId === item.id}
                  onApprove={handleApproveMaterial}
                  onReject={(req) =>
                    openRejectModal(
                      req.id,
                      'MATERIAL',
                      `S-${req.id.substring(0, 4).toUpperCase()}`,
                    )
                  }
                />
              ))
            ) : !isLoading ? (
              <View className="bg-white rounded-[24px] p-6 mb-6 items-center justify-center border border-gray-100">
                <Text className="text-gray-500 text-sm font-medium">
                  Nenhuma solicitação de material pendente.
                </Text>
              </View>
            ) : null}

            {/* Seção: HISTÓRICO DE MATERIAIS E INSUMOS RETIRADOS */}
            <View className="mt-2 mb-2">
              <Text className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                HISTÓRICO DE MATERIAIS E INSUMOS RETIRADOS
              </Text>
              <Text className="text-xs text-gray-500 mb-4 leading-4">
                Materiais e insumos que foram disponibilizados para alunos e professores.
              </Text>

              {withdrawnMaterialRequests.length > 0 ? (
                withdrawnMaterialRequests.map((item) => (
                  <MaterialRequestApprovalCard
                    key={item.id}
                    item={item}
                    mode="WITHDRAWN"
                    isProcessing={processingId === item.id}
                    onConfirmReturn={handleConfirmReturn}
                  />
                ))
              ) : (
                <View className="bg-white/60 rounded-2xl p-4 mb-4 border border-dashed border-gray-200 items-center">
                  <Text className="text-gray-400 text-xs">
                    Nenhum material pendente de devolução.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {isLoading && (
          <View className="py-6 items-center justify-center">
            <ActivityIndicator size="small" color="#00623B" />
          </View>
        )}
      </ScrollView>

      {/* Modal de Rejeição (Reservas e Materiais) */}
      <RejectModal
        visible={Boolean(rejectTarget)}
        protocol={rejectTarget?.protocol || ''}
        reason={rejectReason}
        onChangeReason={setRejectReason}
        onClose={closeRejectModal}
        onConfirm={handleConfirmReject}
        isLoading={isRejecting}
      />
    </PageWrapper>
  );
}
