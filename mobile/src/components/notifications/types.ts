export type PanelAlertVariant =
  | 'avaria'
  | 'estoque_baixo'
  | 'reserva'
  | 'material';

export interface PanelAlertItem {
  id: string;
  variant: PanelAlertVariant;
  title: string;
  description: string;
  badgeLabel: string;
  timeAgo?: string;
  onPress?: () => void;
}

export type HistoryNotificationType =
  | 'AUSENCIA'
  | 'APROVADA'
  | 'REJEITADA'
  | 'PRAZO_DEVOLUCAO'
  | 'MATERIAL_PENDENTE'
  | 'RESERVA_PENDENTE';

export interface HistoryNotificationItem {
  id: string;
  type: HistoryNotificationType;
  title: string;
  timestamp: string;
  subtitle: string;
  onPress?: () => void;
}
