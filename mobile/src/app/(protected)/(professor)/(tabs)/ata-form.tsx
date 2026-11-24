import { HeaderDashboard } from '@/components/dashboard/header-dashboard';
import { PageWrapper } from '@/components/ui/page-wrapper';
import {
  BreakdownSection,
  DraftBreakdown,
  InventoryItemOption,
} from '@/components/usage-log/breakdown-section';
import { ConfirmAtaModal } from '@/components/usage-log/confirm-ata-modal';
import { useAuth } from '@/hooks/useAuth';
import { getEligibleBreakdownMaterials } from '@/services/breakdown.service';
import {
  createUsageLog,
  getReservations,
  ReservationItem,
  updateUsageLog,
  UsageLog,
  UsageLogOccurrence,
} from '@/services/reservation.service';
import { formatReservationDateTime } from '@/utils/usage-log.utils';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const OCORRENCIAS_OPTIONS: { value: UsageLogOccurrence; label: string }[] = [
  { value: 'SEM_INTERCORRENCIAS', label: 'Sem intercorrências' },
  { value: 'AVARIA_MATERIAL', label: 'Avaria de material' },
  { value: 'INCIDENTE_SEGURANCA', label: 'Incidente de segurança' },
  { value: 'FALTA_REAGENTE', label: 'Falta de reagente' },
];

function formatReservationCode(id?: string | number) {
  if (!id) return 'R-0000';
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-4).toUpperCase().padStart(4, '0');
  return `R-${suffix}`;
}

function safeJsonParse<T>(value?: string): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export default function AtaFormScreen() {
  const router = useRouter();
  const { firstName, initials } = useAuth();
  const params = useLocalSearchParams<{
    reservation?: string;
    usageLog?: string;
  }>();

  const initialReservation = useMemo(
    () => safeJsonParse<ReservationItem>(params.reservation),
    [params.reservation],
  );
  const existingLog = useMemo(() => safeJsonParse<UsageLog>(params.usageLog), [params.usageLog]);

  const isEditing = Boolean(existingLog);

  const [eligibleReservations, setEligibleReservations] = useState<ReservationItem[]>(
    initialReservation ? [initialReservation] : [],
  );
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(
    initialReservation,
  );
  const [loadingReservations, setLoadingReservations] = useState(!isEditing && !initialReservation);

  const [nomePratica, setNomePratica] = useState(
    existingLog?.nomePratica ?? initialReservation?.titulo ?? '',
  );
  const [numeroAlunos, setNumeroAlunos] = useState(
    existingLog
      ? String(existingLog.numeroAlunos)
      : initialReservation?.quantidade_alunos
        ? String(initialReservation.quantidade_alunos)
        : '',
  );
  const [ocorrencia, setOcorrencia] = useState<UsageLogOccurrence>(
    existingLog?.ocorrencia ?? 'SEM_INTERCORRENCIAS',
  );
  const [relatoAula, setRelatoAula] = useState(existingLog?.relatoAula ?? '');
  const [pendenciasTecnico, setPendenciasTecnico] = useState(existingLog?.pendenciasTecnico ?? '');

  const [inventoryItems, setInventoryItems] = useState<InventoryItemOption[]>([]);
  const [avarias, setAvarias] = useState<DraftBreakdown[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Carrega inventário pelo service (apenas na criação)
  useEffect(() => {
    if (isEditing) return;

    getEligibleBreakdownMaterials()
      .then((res) => setInventoryItems(res.data ?? []))
      .catch(() => setInventoryItems([]));
  }, [isEditing]);

  // Se abriu sem reserva pré-selecionada, busca reservas aprovadas sem ata
  useEffect(() => {
    if (isEditing || initialReservation) return;

    let active = true;
    setLoadingReservations(true);

    getReservations()
      .then((res) => {
        if (!active) return;
        const pendentesDeAta = (res.data ?? []).filter((r) => r.status === 'APROVADA' && !r.ataUso);
        setEligibleReservations(pendentesDeAta);
        if (pendentesDeAta.length > 0) {
          const first = pendentesDeAta[0];
          setSelectedReservation(first);
          setNomePratica((prev) => prev || first.titulo || '');
          setNumeroAlunos(
            (prev) => prev || (first.quantidade_alunos ? String(first.quantidade_alunos) : ''),
          );
        }
      })
      .catch(() => {
        if (active) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível carregar as aulas realizadas.',
          });
        }
      })
      .finally(() => {
        if (active) setLoadingReservations(false);
      });

    return () => {
      active = false;
    };
  }, [isEditing, initialReservation]);

  const handleSelectReservation = (item: ReservationItem) => {
    setSelectedReservation(item);
    setNomePratica(item.titulo ?? '');
    setNumeroAlunos(item.quantidade_alunos ? String(item.quantidade_alunos) : '');
  };

  const validateForm = () => {
    const reservaId = existingLog?.reservaId ?? selectedReservation?.id;
    if (!reservaId) {
      Toast.show({
        type: 'error',
        text1: 'Selecione uma aula',
        text2: 'Escolha a reserva correspondente à aula realizada.',
      });
      return null;
    }

    const praticaTrim = nomePratica.trim();
    const alunosNum = Number(numeroAlunos);

    if (!praticaTrim || numeroAlunos.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha o conteúdo trabalhado e o número de alunos presentes.',
      });
      return null;
    }

    if (!Number.isInteger(alunosNum) || alunosNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Número inválido',
        text2: 'Informe um número inteiro válido de alunos presentes.',
      });
      return null;
    }

    const profTrim = (
      existingLog?.professorResponsavel ??
      selectedReservation?.professor?.nome ??
      firstName ??
      ''
    ).trim();

    return {
      reservaId,
      praticaTrim,
      profTrim,
      alunosNum,
      relatoTrim: relatoAula.trim() || undefined,
      pendenciasTrim: pendenciasTecnico.trim() || undefined,
    };
  };

  const handleOpenConfirmModal = () => {
    if (!validateForm()) return;
    setConfirmModalVisible(true);
  };

  const handleSubmit = async () => {
    const validated = validateForm();
    if (!validated) return;

    try {
      setSubmitting(true);

      if (isEditing) {
        await updateUsageLog(validated.reservaId, {
          nomePratica: validated.praticaTrim,
          professorResponsavel: validated.profTrim || undefined,
          numeroAlunos: validated.alunosNum,
          ocorrencia,
          relatoAula: validated.relatoTrim,
          pendenciasTecnico: validated.pendenciasTrim,
        });
        Toast.show({
          type: 'success',
          text1: 'Ata atualizada',
          text2: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createUsageLog(validated.reservaId, {
          nomePratica: validated.praticaTrim,
          professorResponsavel: validated.profTrim || undefined,
          numeroAlunos: validated.alunosNum,
          ocorrencia,
          relatoAula: validated.relatoTrim,
          pendenciasTecnico: validated.pendenciasTrim,
          avarias: avarias.length > 0 ? avarias.map(({ insumo_nome, ...rest }) => rest) : undefined,
        });
        Toast.show({
          type: 'success',
          text1: 'Ata enviada',
          text2: 'A reserva foi concluída e registrada no histórico.',
        });
      }

      setConfirmModalVisible(false);
      router.back();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Não foi possível salvar a ata.';
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar ata',
        text2: Array.isArray(msg) ? msg[0] : msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Ata de Aula"
        icon={<Feather name="file-text" size={20} color="#FFF" />}
        hasBorder
      />

      {/* Botão Voltar */}
      <View className="px-5 pt-4 pb-1">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 self-start mb-2"
        >
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-100">
            <Feather name="arrow-left" size={18} color="#000000" />
          </View>
          <Text className="text-sm font-bold text-[#00623B]">Voltar</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110 }}
        >
          {/* Texto introdutório */}
          <Text className="text-gray-500 text-xs leading-5 mb-5">
            Registre o que aconteceu na aula prática. A ata fica anexada à reserva e visível para os
            técnicos do laboratório.
          </Text>

          {/* Seção: Aula realizada */}
          <Text className="text-gray-900 font-bold text-sm mb-2.5">Aula realizada</Text>

          {loadingReservations ? (
            <View className="bg-white rounded-3xl p-6 border border-gray-100 items-center mb-5">
              <ActivityIndicator color="#00623B" />
            </View>
          ) : isEditing && existingLog ? (
            <View className="bg-white rounded-3xl p-4 border-2 border-[#00623B] shadow-sm mb-5">
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="bg-[#E6F4EE] px-2.5 py-0.5 rounded-full">
                  <Text className="text-[#00623B] text-[11px] font-bold">
                    {formatReservationCode(existingLog.reservaId)}
                  </Text>
                </View>
                {Boolean(existingLog.reserva) && (
                  <Text className="text-gray-500 text-xs font-medium">
                    {formatReservationDateTime(
                      existingLog.reserva!.data_reserva,
                      existingLog.reserva!.horarios,
                    )}
                  </Text>
                )}
              </View>

              <Text className="text-gray-900 font-bold text-base mt-1">
                {existingLog.reserva?.local || 'Laboratório não informado'}
              </Text>
              <Text className="text-gray-600 text-xs mt-0.5">
                {existingLog.reserva?.titulo || existingLog.nomePratica}
              </Text>
            </View>
          ) : eligibleReservations.length === 0 ? (
            <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-5">
              <Text className="text-gray-500 text-xs text-center">
                Nenhuma reserva aprovada pendente de ata foi encontrada.
              </Text>
            </View>
          ) : (
            <View className="gap-3 mb-5">
              {eligibleReservations.map((item) => {
                const isSelected = selectedReservation?.id === item.id;
                const dateTime = formatReservationDateTime(item.data_reserva, item.horarios);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectReservation(item)}
                    className={`bg-white rounded-3xl p-4 shadow-sm ${
                      isSelected ? 'border-2 border-[#00623B]' : 'border border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View
                        className={`px-2.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-[#E6F4EE]' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-bold ${
                            isSelected ? 'text-[#00623B]' : 'text-gray-600'
                          }`}
                        >
                          {formatReservationCode(item.id)}
                        </Text>
                      </View>
                      {Boolean(dateTime) && (
                        <Text className="text-gray-500 text-xs font-medium">{dateTime}</Text>
                      )}
                    </View>

                    <Text className="text-gray-900 font-bold text-base mt-1">
                      {item.local || 'Laboratório não informado'}
                    </Text>

                    {Boolean(item.titulo) && (
                      <Text className="text-gray-600 text-xs mt-0.5">{item.titulo}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Seção: Dados da aula */}
          <Text className="text-gray-900 font-bold text-sm mb-2.5">Dados da aula</Text>
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-5">
            {/* Conteúdo trabalhado */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">Conteúdo trabalhado</Text>
            <TextInput
              value={nomePratica}
              onChangeText={setNomePratica}
              placeholder="Ex: Titulação ácido-base"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm mb-4"
            />

            {/* Alunos presentes */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">Alunos presentes</Text>
            <TextInput
              value={numeroAlunos}
              onChangeText={(t) => setNumeroAlunos(t.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="Ex: 24"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm mb-4"
            />

            {/* Ocorrências */}
            <Text className="text-gray-700 text-xs font-semibold mb-2">Ocorrências</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {OCORRENCIAS_OPTIONS.map((option) => {
                const selected = ocorrencia === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.75}
                    onPress={() => setOcorrencia(option.value)}
                    className={`px-3.5 py-2 rounded-full border ${
                      selected ? 'bg-[#00623B] border-[#00623B]' : 'bg-[#F8FAF9] border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Relato da aula */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">Relato da aula</Text>
            <TextInput
              value={relatoAula}
              onChangeText={setRelatoAula}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Descreva o andamento da prática, materiais utilizados, resultados e qualquer intercorrência."
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm min-h-[104px] mb-4"
            />

            {/* Pendências para o técnico */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">
              Pendências para o técnico
            </Text>
            <TextInput
              value={pendenciasTecnico}
              onChangeText={setPendenciasTecnico}
              placeholder="Ex.: repor 2 buretas."
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm"
            />
          </View>

          {/* Seção opcional de Avarias (apenas na criação) */}
          {!isEditing && (
            <View className="mb-5">
              <BreakdownSection
                items={inventoryItems}
                avarias={avarias}
                onAdd={(nova) => {
                  setAvarias((prev) => [...prev, nova]);
                  if (ocorrencia === 'SEM_INTERCORRENCIAS') {
                    setOcorrencia('AVARIA_MATERIAL');
                  }
                }}
                onRemove={(idx) => setAvarias((prev) => prev.filter((_, i) => i !== idx))}
              />
            </View>
          )}

          {/* Botões de ação */}
          <View className="flex-row gap-3 mt-1">
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={submitting}
              onPress={() => router.back()}
              className="flex-1 bg-white border border-gray-200 py-3.5 rounded-2xl items-center justify-center"
            >
              <Text className="text-gray-700 font-semibold text-sm">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={submitting}
              onPress={handleOpenConfirmModal}
              className="flex-1 bg-[#00623B] py-3.5 rounded-2xl items-center justify-center flex-row gap-2"
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFF" />
                  <Text className="text-white font-semibold text-sm">Confirmar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmAtaModal
        visible={confirmModalVisible}
        loading={submitting}
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleSubmit}
      />
    </PageWrapper>
  );
}
