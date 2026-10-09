import { authService } from '@/services/authService';
import { useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const MAX_ATTEMPTS = 5;

interface VerifyCodeFormProps {
  email: string;
  onSuccess: (code: string) => void;
  onResendCode: () => Promise<void>;
  timer: number;
  attempts: number;
  setAttempts: (attempts: number) => void;
}

export function VerifyCodeForm({
  email,
  onSuccess,
  onResendCode,
  timer,
  attempts,
  setAttempts,
}: VerifyCodeFormProps) {
  const [code, setCode] = useState(['', '', '', '', '']);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef<Array<TextInput | null>>([]);
  const isBlocked = attempts >= MAX_ATTEMPTS;

  function handleChangeText(text: string, index: number) {
    setHasError(false);
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (isBlocked) {
      Toast.show({
        type: 'error',
        text1: 'Limite de tentativas excedido',
        text2: 'Aguarde o tempo de reenvio ou solicite um novo código.',
      });
      return;
    }

    const fullCode = code.join('');
    if (fullCode.length < 5) {
      setHasError(true);
      return;
    }

    try {
      setLoading(true);
      const verification = await authService.verifyCode(email, fullCode);

      if (!verification || !verification.isValid) {
        throw new Error('Código inválido');
      }

      onSuccess(fullCode);
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 429) {
        setAttempts(MAX_ATTEMPTS);
        setHasError(true);
        Toast.show({
          type: 'error',
          text1: 'Muitas tentativas',
          text2: 'Por segurança, bloqueamos temporariamente.',
        });
        return;
      }

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setHasError(true);

      if (newAttempts >= MAX_ATTEMPTS) {
        Toast.show({
          type: 'error',
          text1: 'Bloqueado por tentativas incorretas',
          text2: 'Solicite um novo código para continuar.',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (timer > 0 || isResending || loading) return;

    try {
      setIsResending(true);

      await onResendCode();

      setCode(['', '', '', '', '']);
      setHasError(false);
      inputsRef.current[0]?.focus();

      Toast.show({
        type: 'info',
        text1: 'Novo código enviado',
        text2: 'Suas tentativas foram reiniciadas.',
      });
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 429) {
        Toast.show({
          type: 'error',
          text1: 'Calma lá!',
          text2: 'Muitos e-mails solicitados. Aguarde alguns instantes.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao reenviar',
          text2: error.response?.data?.message || 'Tente novamente.',
        });
      }
    } finally {
      setIsResending(false);
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="w-full">
      <View className="items-center mb-6">
        <Text className="text-xl font-bold text-gray-900">Insira o código</Text>
        <Text className="text-gray-500 text-sm mt-1 text-center px-2 leading-relaxed">
          Insira o código de recuperação enviado para o e-mail{' '}
          <Text className="font-bold text-gray-700">{email}</Text>
        </Text>
      </View>

      <View className="flex-row justify-between mb-2 px-1">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!loading && !isResending && !isBlocked}
            className={`w-12 h-14 bg-white rounded-2xl border text-center text-2xl font-bold ${
              hasError || isBlocked
                ? 'border-red-500 text-gray-900'
                : digit
                  ? 'border-[#00623B] text-gray-900'
                  : 'border-gray-300 text-gray-900'
            }`}
          />
        ))}
      </View>

      {hasError && (
        <Text className="text-red-500 text-xs text-center font-medium mt-1 mb-2">
          {isBlocked
            ? `Limite de ${MAX_ATTEMPTS} tentativas atingido. Envie um novo código.`
            : `Código incorreto (${attempts}/${MAX_ATTEMPTS} tentativas). Tente novamente`}
        </Text>
      )}

      {/* Reenvio */}
      <View className="items-center my-3 min-h-[32px] justify-center">
        {isResending ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#00623B" />
            <Text className="text-sm font-semibold text-[#00623B]">Enviando novo e-mail...</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0 || loading}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-semibold text-gray-700">
              {timer > 0 ? (
                <>
                  Enviar código novamente em{' '}
                  <Text className="text-gray-400 font-normal">{formatTimer(timer)}</Text>
                </>
              ) : (
                <Text className="text-[#00623B] font-bold underline">Enviar código novamente</Text>
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading || isResending || isBlocked}
        activeOpacity={0.8}
        className="w-full bg-[#00623B] py-4 rounded-2xl items-center justify-center mt-2 shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-bold text-base">Verificar Código</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
