import { Button, View } from 'react-native';
import { RoleGate } from '../../components/security/RoleGate';

export default function DashboardScreen() {
  return (
    <View>
      {/* Todo mundo vê (Técnico, Professor, Aluno) */}
      <Button title="Solicitar Insumo / Vidraria" onPress={() => {}} />

      {/* Professor e Técnico vêem o botão de agendar laboratório */}
      <RoleGate allowedProfiles={['TECNICO', 'PROFESSOR']}>
        <Button title="Reservar Laboratório" onPress={() => {}} />
      </RoleGate>

      {/* Técnico vê o botão do painel administrativo */}
      <RoleGate allowedProfiles={['TECNICO']}>
        <Button title="Painel de Aprovações & Estoque" onPress={() => {}} />
      </RoleGate>
    </View>
  );
}
