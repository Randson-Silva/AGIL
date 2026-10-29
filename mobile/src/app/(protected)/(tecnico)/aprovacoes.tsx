import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { BackButton } from '../../../components/ui/Back-button';
import { ApprovalTabs } from '../../../components/approvals/approval-tabs';
import { PendingReservationCard } from '../../../components/approvals/pending-reservation-card';
import { TodayConfirmedReservationCard } from '../../../components/approvals/today-confirmed-reservation-card';
import { ApprovedReservationCard } from '../../../components/approvals/approved-reservation-card';
import { MaterialRequestApprovalCard } from '../../../components/approvals/material-request-approval-card';
import { RejectModal } from '../../../components/approvals/reject-modal';
import { useAprovacoes } from '../../../hooks/useAprovacoes';
import { useAuth } from '../../../hooks/useAuth';

export default function AprovacoesScreen() {
  const { firstName, initials } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isLoading,
    processingIds,
    pendingReservations,
    todayConfirmedReservations,
    approvedReservations,
    pendingMaterialRequests,
    withdrawnMaterialRequests,
    handleApproveReservation,
    handleRegisterAbsence,
    handleReallocatePress,
    handleApproveMaterial,
    handleConfirmReturn,
    rejectTarget,
    rejectReason,
    setRejectReason,
    openRejectModal,
    closeRejectModal,
    confirmReject,
    isRejecting,
  } = useAprovacoes();

  const approvedWithoutToday = approvedReservations.filter(
    (item) => !todayConfirmedReservations.some((today) => today.id === item.id),
  );

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Aprovações"
        icon={<Feather name="check-circle" size={20} color="#FFF" />}
        hasBorder
      />

      <View className="flex-row items-center px-6 pt-4">
        <BackButton />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingTop: 16, paddingBottom: 40 }}
      >
        <ApprovalTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hasPendingReservations={pendingReservations.length > 0}
          hasPendingMaterials={pendingMaterialRequests.length > 0}
        />

        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#00623B" />
          </View>
        ) : activeTab === 'RESERVAS' ? (
          <>
            <SectionTitle title="RESERVAS PENDENTES" />
            {pendingReservations.length === 0 ? (
              <EmptyState text="Nenhuma reserva pendente." />
            ) : (
              pendingReservations.map((item) => (
                <PendingReservationCard
                  key={item.id}
                  item={item}
                  isProcessing={processingIds.has(item.id)}
                  onApprove={handleApproveReservation}
                  onReject={(reservation) =>
                    openRejectModal({ type: 'RESERVA', item: reservation })
                  }
                />
              ))
            )}

            {todayConfirmedReservations.length > 0 && (
              <>
                <SectionTitle title="RESERVAS CONFIRMADAS DE HOJE" />
                {todayConfirmedReservations.map((item) => (
                  <TodayConfirmedReservationCard
                    key={item.id}
                    item={item}
                    isProcessing={processingIds.has(item.id)}
                    onRegisterAbsence={handleRegisterAbsence}
                  />
                ))}
              </>
            )}

            {approvedWithoutToday.length > 0 && (
              <>
                <SectionTitle title="RESERVAS APROVADAS" />
                {approvedWithoutToday.map((item) => (
                  <ApprovedReservationCard
                    key={item.id}
                    item={item}
                    onReallocatePress={handleReallocatePress}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <SectionTitle title="SOLICITAÇÕES PENDENTES" />
            {pendingMaterialRequests.length === 0 ? (
              <EmptyState text="Nenhuma solicitação pendente." />
            ) : (
              pendingMaterialRequests.map((item) => (
                <MaterialRequestApprovalCard
                  key={item.id}
                  item={item}
                  mode="PENDING"
                  isProcessing={processingIds.has(item.id)}
                  onApprove={handleApproveMaterial}
                  onReject={(request) =>
                    openRejectModal({ type: 'MATERIAL', item: request })
                  }
                />
              ))
            )}

            {withdrawnMaterialRequests.length > 0 && (
              <>
                <SectionTitle title="MATERIAIS RETIRADOS" />
                {withdrawnMaterialRequests.map((item) => (
                  <MaterialRequestApprovalCard
                    key={item.id}
                    item={item}
                    mode="WITHDRAWN"
                    isProcessing={processingIds.has(item.id)}
                    onConfirmReturn={handleConfirmReturn}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <RejectModal
        visible={rejectTarget !== null}
        protocol={
          rejectTarget
            ? `${rejectTarget.type === 'RESERVA' ? 'R' : 'S'}-${rejectTarget.item.id
                .substring(0, 4)
                .toUpperCase()}`
            : 'XXXX'
        }
        reason={rejectReason}
        onChangeReason={setRejectReason}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
        isLoading={isRejecting}
      />
    </PageWrapper>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-xs font-bold tracking-wider text-gray-500 mb-3 mt-2">
      {title}
    </Text>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
      <Text className="text-sm text-gray-500 text-center">{text}</Text>
    </View>
  );
}
