import { HeaderDashboard } from '@/components/dashboard/header-dashboard';
import { ConfirmAtaModal } from '@/components/usage-log/confirm-ata-modal';
import { useReservas } from '@/hooks/useReservas';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { PageWrapper } from '../../../../components/ui/page-wrapper';
import {
  BreakdownSection,
  DraftBreakdown,
  InventoryItemOption,
} from '../../../../components/usage-log/breakdown-section';
import { api } from '../../../../services/api';
import {
  createUsageLog,
  ReservationItem,
  updateUsageLog,
  UsageLog,
} from '../../../../services/reservation.service';
import { formatReservationDateTime } from '../../../../utils/usage-log.utils';

const OCORRENCIAS_OPTIONS = [
  'Sem intercorrências',
  'Incidente de segurança',
  'Falta de reagente',
] as const;

type OcorrenciaOption = (typeof OCORRENCIAS_OPTIONS)[number];

function formatReservationCode(id?: string | number) {
  if (!id) return 'R-0000';
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const suffix = clean.slice(-4).toUpperCase().padStart(4, '0');
  return `R-${suffix}`;
}

export default function AtaFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    reservation?: string;
    usageLog?: string;
  }>();

  const reservation: ReservationItem | null = params.reservation
    ? JSON.parse(params.reservation)
    : null;
  const existingLog: UsageLog | null = params.usageLog ? JSON.parse(params.usageLog) : null;

  const isEditing = Boolean(existingLog);

  const [nomePratica, setNomePratica] = useState(
    existingLog?.nomePratica ?? reservation?.titulo ?? '',
  );
  const [professorResponsavel, setProfessorResponsavel] = useState(
    existingLog?.professorResponsavel ?? reservation?.professor?.nome ?? '',
  );
  const [numeroAlunos, setNumeroAlunos] = useState(
    existingLog
      ? String(existingLog.numeroAlunos)
      : reservation?.quantidade_alunos
        ? String(reservation.quantidade_alunos)
        : '',
  );
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaOption>('Sem intercorrências');
  const [relatoAula, setRelatoAula] = useState('');
  const [pendenciasTecnico, setPendenciasTecnico] = useState('');

  const [inventoryItems, setInventoryItems] = useState<InventoryItemOption[]>([]);
  const [avarias, setAvarias] = useState<DraftBreakdown[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { firstName, initials } = useReservas();

  useEffect(() => {
    if (!isEditing) {
      api
        .get<InventoryItemOption[]>('/inventory')
        .then((res) => setInventoryItems(res.data ?? []))
        .catch(() => setInventoryItems([]));
    }
  }, [isEditing]);

  const handleSubmit = async () => {
    const reservaId = existingLog?.reservaId ?? reservation?.id;
    if (!reservaId) return;

    const praticaTrim = nomePratica.trim();
    const profTrim = (professorResponsavel || firstName || '').trim();
    const alunosNum = Number(numeroAlunos);

    if (!praticaTrim || !profTrim || numeroAlunos.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha o conteúdo trabalhado e o número de alunos presentes.',
      });
      return;
    }

    if (!Number.isInteger(alunosNum) || alunosNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Número inválido',
        text2: 'Informe um número inteiro válido de alunos presentes.',
      });
      return;
    }

    try {
      setSubmitting(true);

      if (isEditing) {
        await updateUsageLog(reservaId, {
          nomePratica: praticaTrim,
          professorResponsavel: profTrim,
          numeroAlunos: alunosNum,
        });
        Toast.show({
          type: 'success',
          text1: 'Ata atualizada',
          text2: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createUsageLog(reservaId, {
          nomePratica: praticaTrim,
          professorResponsavel: profTrim,
          numeroAlunos: alunosNum,
          avarias: avarias.map(({ insumo_nome, ...rest }) => rest),
        });
        Toast.show({
          type: 'success',
          text1: 'Ata enviada',
          text2: 'A reserva foi concluída e registrada no histórico.',
        });
      }

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

  const handleOpenConfirmModal = () => {
    const praticaTrim = nomePratica.trim();
    const profTrim = (professorResponsavel || firstName || '').trim();
    const alunosNum = Number(numeroAlunos);

    if (!praticaTrim || !profTrim || numeroAlunos.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Campos obrigatórios',
        text2: 'Preencha o conteúdo trabalhado e o número de alunos presentes.',
      });
      return;
    }

    if (!Number.isInteger(alunosNum) || alunosNum < 0) {
      Toast.show({
        type: 'error',
        text1: 'Número inválido',
        text2: 'Informe um número inteiro válido de alunos presentes.',
      });
      return;
    }

    setConfirmModalVisible(true);
  };

  const reservaId = existingLog?.reservaId ?? reservation?.id;
  const reservationCode = formatReservationCode(reservaId);
  const localLabel =
    existingLog?.reserva?.local ?? reservation?.local ?? 'Laboratório não informado';
  const disciplinaLabel = existingLog?.nomePratica ?? reservation?.titulo ?? '';
  const dataLabel = existingLog?.reserva
    ? formatReservationDateTime(existingLog.reserva.data_reserva, existingLog.reserva.horarios)
    : reservation
      ? formatReservationDateTime(reservation.data_reserva, reservation.horarios)
      : '';

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
          className="flex-row items-center gap-1.5 self-start"
        >
          <Feather name="arrow-left" size={18} color="#00623B" />
          <Text className="text-sm font-semibold text-[#00623B]">Voltar</Text>
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
          <View className="bg-white rounded-3xl p-4 border-2 border-[#00623B] shadow-sm mb-5">
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="bg-[#E6F4EE] px-2.5 py-0.5 rounded-full">
                <Text className="text-[#00623B] text-[11px] font-bold">{reservationCode}</Text>
              </View>
              {Boolean(dataLabel) && (
                <Text className="text-gray-500 text-xs font-medium">{dataLabel}</Text>
              )}
            </View>

            <Text className="text-gray-900 font-bold text-base mt-1">{localLabel}</Text>

            {Boolean(disciplinaLabel) && (
              <Text className="text-gray-600 text-xs mt-0.5">{disciplinaLabel}</Text>
            )}
          </View>

          {/* Seção: Dados da aula */}
          <Text className="text-gray-900 font-bold text-sm mb-2.5">Dados da aula</Text>
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-5">
            {/* Conteúdo trabalhado */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">
              Conteúdo trabalhado *
            </Text>
            <TextInput
              value={nomePratica}
              onChangeText={setNomePratica}
              placeholder="Ex: Titulação ácido-base"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm mb-4"
            />

            {/* Professor responsável */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">
              Professor responsável *
            </Text>
            <TextInput
              value={professorResponsavel}
              onChangeText={setProfessorResponsavel}
              placeholder="Nome do docente"
              placeholderTextColor="#9CA3AF"
              className="bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm mb-4"
            />

            {/* Alunos presentes */}
            <Text className="text-gray-700 text-xs font-semibold mb-1.5">Alunos presentes *</Text>
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
                const selected = ocorrencia === option;
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.75}
                    onPress={() => setOcorrencia(option)}
                    className={`px-3.5 py-2 rounded-full border ${
                      selected ? 'bg-[#00623B] border-[#00623B]' : 'bg-[#F8FAF9] border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        selected ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {option}
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
                onAdd={(nova) => setAvarias((prev) => [...prev, nova])}
                onRemove={(idx) => setAvarias((prev) => prev.filter((_, i) => i !== idx))}
              />
            </View>
          )}

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
        onConfirm={async () => {
          await handleSubmit();
          setConfirmModalVisible(false);
        }}
      />
    </PageWrapper>
  );
}
