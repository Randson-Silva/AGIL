export type AlertStatus = 'Avaria' | 'Estoque baixo' | 'Reserva';

export interface StatItem {
  id: string;
  count: string;
  label: string;
  iconName: string; // Assuming Feather icons
}

export interface AlertItem {
  id: string;
  status: AlertStatus;
  timeAgo: string;
  title: string;
  description: string;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  iconName: string;
  onPress: () => void;
}
