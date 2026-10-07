import { Text, View } from 'react-native';

interface NextReservationCardProps {
  title: string;
  dateStr: string;
  classNameLabel: string;
}

export function NextReservationCard({ title, dateStr, classNameLabel }: NextReservationCardProps) {
  return (
    <View className="bg-[#00623B] rounded-3xl p-6 mb-8 w-full shadow-sm">
      <Text className="text-emerald-100 text-sm mb-1">Próxima Reserva:</Text>
      <Text className="text-white font-bold text-2xl mb-2">{title}</Text>
      <Text className="text-emerald-100 text-sm">{dateStr}</Text>
      <Text className="text-emerald-100 text-sm mt-1">{classNameLabel}</Text>
    </View>
  );
}
