import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { SecureFooter } from '@/components/auth/AuthFooter';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { authService } from '@/services/authService';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { RequestCodeForm } from '../../components/auth/RequestCodeForm';
import { VerifyCodeForm } from '../../components/auth/VerifyCodeForm';
import { PageWrapper } from '../../components/ui/page-wrapper';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [savedEmail, setSavedEmail] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');

  function handleEmailSubmitted(email: string) {
    setSavedEmail(email);
    setStep('verify');
  }

  function handleCodeVerified(code: string) {
    setVerifiedCode(code);
    setStep('reset');
  }

  function handleBack() {
    if (step === 'verify') {
      setStep('request');
    } else if (step === 'reset') {
      setStep('verify');
    } else {
      router.back();
    }
  }

  return (
    <PageWrapper className="bg-emerald-50/30">
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <View className="relative items-center mb-8 pt-2">
          <TouchableOpacity
            onPress={handleBack}
            className="absolute left-0 top-2 w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm z-10"
          >
            <Feather name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>

          <AuthHeader />
        </View>

        <View className="flex-1 justify-center my-2">
          <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
            {step === 'request' && <RequestCodeForm onSuccess={handleEmailSubmitted} />}

            {step === 'verify' && (
              <VerifyCodeForm
                email={savedEmail}
                onSuccess={handleCodeVerified}
                onResendCode={() => authService.forgotPassword(savedEmail)}
              />
            )}

            {step === 'reset' && (
              <ResetPasswordForm
                email={savedEmail}
                code={verifiedCode}
                onSuccess={() => router.replace('/(public)/login')}
              />
            )}

            <View className="flex-row justify-center mt-6">
              <Text className="text-sm text-gray-500">Lembrou sua senha? </Text>
              <TouchableOpacity onPress={() => router.replace('/(public)/login')}>
                <Text className="text-sm font-bold text-[#00623B]">Entre aqui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-4">
          <SecureFooter />
        </View>
      </KeyboardAwareScrollView>
    </PageWrapper>
  );
}
