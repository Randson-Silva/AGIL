import { Feather } from '@expo/vector-icons';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CubeIcon } from 'react-native-heroicons/outline';
import { HeaderDashboard } from '../../../../components/dashboard/header-dashboard';
import { CalendarModal } from '../../../../components/reservation/calendar-modal';
import { CatalogItemCard } from '../../../../components/reservation/catalog-item-card';
import { RequestHistoryCard } from '../../../../components/reservation/request-history-card';
import { ProfessorSelect } from '../../../../components/student/ProfessorSelect';
import { BackButton } from '../../../../components/ui/Back-button';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { PageWrapper } from '../../../../components/ui/page-wrapper';
import { useMateriais } from '../../../../hooks/useMateriais';

export default function AlunoMateriaisScreen() {
  const {
    firstName,
    initials,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    cart,
    handleIncrement,
    handleDecrement,
    isPesquisaOuTcc,
    handleTogglePesquisaOuTcc,
    professorQuery,
    selectedProfessor,
    filteredProfessors,
    isProfessorListVisible,
    setIsProfessorListVisible,
    handleProfessorQueryChange,
    handleSelectProfessor,
    handleClearProfessor,
    paginatedCatalog,
    catalogPage,
    setCatalogPage,
    totalCatalogPages,
    withdrawalDate,
    setWithdrawalDate,
    returnDate,
    setReturnDate,
    selectedCalendarIsoDate,
    calendarType,
    setCalendarType,
    handleDateSelect,
    paginatedHistory,
    historyPage,
    setHistoryPage,
    totalHistoryPages,
    handleSubmit,
  } = useMateriais();

  const handleCloseProfessorSelect = () => {
    setIsProfessorListVisible(false);
    Keyboard.dismiss();
  };

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Solicitar Materiais"
        icon={<CubeIcon size={20} color="#FFF" />}
        hasBorder
      />

      <ScrollView
        className="flex-1"
        scrollEnabled={!isProfessorListVisible}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Backdrop invisível para fechar e tirar o foco ao tocar fora */}
        {isProfessorListVisible && (
          <Pressable
            onPress={handleCloseProfessorSelect}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          />
        )}

        <View className="px-6 pt-3 mb-2">
          <BackButton />
        </View>

        <View className="px-6 mt-2 mb-4">
          <Input
            label="Buscar material"
            iconName="search"
            placeholder="Nome do material..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="mb-4">
          {paginatedCatalog.length > 0 ? (
            paginatedCatalog.map((item) => (
              <CatalogItemCard
                key={item.id}
                item={item}
                quantity={cart[item.id] || 0}
                onIncrement={() => handleIncrement(item.id)}
                onDecrement={() => handleDecrement(item.id)}
              />
            ))
          ) : (
            <Text className="text-gray-500 text-center mx-6">Nenhum material encontrado.</Text>
          )}

          {totalCatalogPages > 1 && (
            <View className="flex-row items-center justify-between px-6 mt-2">
              <TouchableOpacity
                onPress={() => setCatalogPage(Math.max(1, catalogPage - 1))}
                disabled={catalogPage === 1}
                className={`p-2 rounded-full ${catalogPage === 1 ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-left" size={24} color="#00623B" />
              </TouchableOpacity>
              <Text className="text-sm text-gray-600">
                Página {catalogPage} de {totalCatalogPages}
              </Text>
              <TouchableOpacity
                onPress={() => setCatalogPage(Math.min(totalCatalogPages, catalogPage + 1))}
                disabled={catalogPage === totalCatalogPages}
                className={`p-2 rounded-full ${catalogPage === totalCatalogPages ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-right" size={24} color="#00623B" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Chave Pesquisa / TCC + Professor Responsável condicional */}
        <View
          className="px-6 mb-6 mt-2"
          style={{
            zIndex: isProfessorListVisible ? 20 : 1,
            elevation: isProfessorListVisible ? 20 : 0,
          }}
        >
          <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-semibold text-gray-900">
                Solicitação para Pesquisa / TCC?
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Clique e informe o professor responsável
              </Text>
            </View>
            <Switch
              value={isPesquisaOuTcc}
              onValueChange={handleTogglePesquisaOuTcc}
              trackColor={{ false: '#D1D5DB', true: '#00623B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {isPesquisaOuTcc && (
            <ProfessorSelect
              query={professorQuery}
              selectedProfessor={selectedProfessor}
              professors={filteredProfessors}
              isListVisible={isProfessorListVisible}
              onQueryChange={handleProfessorQueryChange}
              onSelect={(prof) => {
                handleSelectProfessor(prof);
                Keyboard.dismiss();
              }}
              onClear={handleClearProfessor}
              onToggleList={() => setIsProfessorListVisible((prev) => !prev)}
              onFocus={() => setIsProfessorListVisible(true)}
            />
          )}
        </View>

        <View className="px-6 mb-8 mt-2">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Prazo de Retirada e Devolução
          </Text>
          <View className="mb-2">
            <Input
              label="Data de Retirada"
              iconName="edit-2"
              rightIconName="calendar"
              onRightIconPress={() => setCalendarType('withdrawal')}
              placeholder="DD-MM-AAAA"
              keyboardType="number-pad"
              maxLength={10}
              value={withdrawalDate}
              onChangeText={setWithdrawalDate}
            />
          </View>
          <View>
            <Input
              label="Data de Devolução"
              iconName="edit-2"
              rightIconName="calendar"
              onRightIconPress={() => setCalendarType('return')}
              placeholder="DD-MM-AAAA"
              keyboardType="number-pad"
              maxLength={10}
              value={returnDate}
              onChangeText={setReturnDate}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mx-6 mb-4">Minhas Solicitações</Text>
          {paginatedHistory.length > 0 ? (
            paginatedHistory.map((item) => <RequestHistoryCard key={item.id} item={item} />)
          ) : (
            <Text className="text-gray-500 text-center mx-6">Você não tem solicitações.</Text>
          )}

          {totalHistoryPages > 1 && (
            <View className="flex-row items-center justify-between px-6 mt-2">
              <TouchableOpacity
                onPress={() => setHistoryPage(Math.max(1, historyPage - 1))}
                disabled={historyPage === 1}
                className={`p-2 rounded-full ${historyPage === 1 ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-left" size={24} color="#00623B" />
              </TouchableOpacity>
              <Text className="text-sm text-gray-600">
                Página {historyPage} de {totalHistoryPages}
              </Text>
              <TouchableOpacity
                onPress={() => setHistoryPage(Math.min(totalHistoryPages, historyPage + 1))}
                disabled={historyPage === totalHistoryPages}
                className={`p-2 rounded-full ${historyPage === totalHistoryPages ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-right" size={24} color="#00623B" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {Object.keys(cart).length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-lg">
          <Button
            title="Confirmar Solicitação"
            isLoading={isSubmitting}
            onPress={handleSubmit}
            variant="primary"
          />
        </View>
      )}

      <CalendarModal
        visible={calendarType !== null}
        onClose={() => setCalendarType(null)}
        selectedDate={selectedCalendarIsoDate}
        onSelectDate={handleDateSelect}
      />
    </PageWrapper>
  );
}
