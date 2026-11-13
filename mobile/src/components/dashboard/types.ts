export type AlertStatus = 'Avaria' | 'Estoque baixo' | 'Reserva' | 'Material';

export interface StatItem {
  id: string;
  count: string;
  label: string;
  iconName: string; // Assuming Feather icons
  onPress?: () => void;
}

export interface AlertItem {
  id: string;
  status: AlertStatus;
  timeAgo: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  iconName: string;
  onPress: () => void;
}
