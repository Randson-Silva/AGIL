import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { UsageHistoryItem } from '../services/inventory.service';
import { ReservationHistoryItem } from '../services/reservation.service';

const UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'UND',
};

function formatDateTimeBr(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateOnlyUtc(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function generateUsageHistoryPdf(params: {
  items: UsageHistoryItem[];
  periodLabel: string;
  filterLabel: string;
  searchQuery?: string;
  generatedBy: string;
}) {
  const { items, periodLabel, filterLabel, searchQuery, generatedBy } = params;

  const rowsHtml = items
    .map((item) => {
      const unit = UNIT_LABELS[item.unidadeMedida] || item.unidadeMedida;
      const qtyColor = item.tipo === 'ENTRADA' ? '#00623B' : '#DC2626';
      const badgeLabel =
        item.tipo === 'ENTRADA' ? 'Entrada' : item.tipo === 'BAIXA' ? 'Baixa' : 'Avaria';

      return `
        <tr>
          <td><strong>${escapeHtml(item.materialNome)}</strong>${
            item.detalhes ? `<div class="sub">${escapeHtml(item.detalhes)}</div>` : ''
          }</td>
          <td>${escapeHtml(item.usuarioNome)}</td>
          <td>${formatDateTimeBr(item.dataEvento)}</td>
          <td style="color:${qtyColor}; font-weight:bold;">${item.sinal}${item.quantidade} ${unit}</td>
          <td><span class="badge badge-${item.tipo.toLowerCase()}">${badgeLabel}</span></td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #1F2937; padding: 24px; }
          h1 { color: #00623B; font-size: 20px; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #4B5563; margin-bottom: 18px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background-color: #E3F3EC; color: #00623B; text-align: left; padding: 8px; border-bottom: 2px solid #00623B; }
          td { padding: 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
          .sub { font-size: 10px; color: #6B7280; margin-top: 2px; }
          .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block; }
          .badge-entrada { background: #E3F3EC; color: #00623B; }
          .badge-baixa { background: #F3F4F6; color: #374151; }
          .badge-avaria { background: #FEE2E2; color: #DC2626; }
          .footer { margin-top: 24px; font-size: 10px; color: #9CA3AF; text-align: center; }
        </style>
      </head>
      <body>
        <h1>AGIL — Relatório de Histórico de Uso de Materiais</h1>
        <div class="meta">
          <div><strong>Período:</strong> ${escapeHtml(periodLabel)}</div>
          <div><strong>Tipo:</strong> ${escapeHtml(filterLabel)}${
            searchQuery ? ` · <strong>Busca:</strong> ${escapeHtml(searchQuery)}` : ''
          }</div>
          <div><strong>Gerado por:</strong> ${escapeHtml(generatedBy)} em ${formatDateTimeBr(new Date().toISOString())}</div>
          <div><strong>Total de registros:</strong> ${items.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Usuário</th>
              <th>Data / Hora</th>
              <th>Quantidade</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="footer">Documento gerado automaticamente pelo sistema AGIL.</div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Exportar Histórico de Uso (PDF)',
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}

export async function generateReservationHistoryPdf(params: {
  items: ReservationHistoryItem[];
  periodLabel: string;
  filterLabel: string;
  searchQuery?: string;
  generatedBy: string;
}) {
  const { items, periodLabel, filterLabel, searchQuery, generatedBy } = params;

  const rowsHtml = items
    .map((res) => {
      const isAccepted = res.status === 'APROVADA';
      const slots =
        res.horarios.length > 0
          ? res.horarios.map((h) => `${h.hora_inicio}–${h.hora_fim}`).join(', ')
          : '-';

      return `
        <tr>
          <td><strong>${escapeHtml(res.local)}</strong><div class="sub">${escapeHtml(res.titulo)}</div></td>
          <td>${escapeHtml(res.professor?.nome || 'Professor')}</td>
          <td>${formatDateOnlyUtc(res.data_reserva)}<div class="sub">${slots}</div></td>
          <td>
            <span class="badge ${isAccepted ? 'badge-aceita' : 'badge-recusada'}">
              ${isAccepted ? 'Aceita' : 'Recusada'}
            </span>
            ${
              !isAccepted && res.motivo_rejeicao
                ? `<div class="sub">${escapeHtml(res.motivo_rejeicao)}</div>`
                : ''
            }
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #1F2937; padding: 24px; }
          h1 { color: #00623B; font-size: 20px; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #4B5563; margin-bottom: 18px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background-color: #E3F3EC; color: #00623B; text-align: left; padding: 8px; border-bottom: 2px solid #00623B; }
          td { padding: 8px; border-bottom: 1px solid #E5E7EB; vertical-align: top; }
          .sub { font-size: 10px; color: #6B7280; margin-top: 2px; }
          .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block; }
          .badge-aceita { background: #E3F3EC; color: #00623B; }
          .badge-recusada { background: #FEE2E2; color: #DC2626; }
          .footer { margin-top: 24px; font-size: 10px; color: #9CA3AF; text-align: center; }
        </style>
      </head>
      <body>
        <h1>AGIL — Relatório de Histórico de Reservas</h1>
        <div class="meta">
          <div><strong>Período:</strong> ${escapeHtml(periodLabel)}</div>
          <div><strong>Status:</strong> ${escapeHtml(filterLabel)}${
            searchQuery ? ` · <strong>Busca:</strong> ${escapeHtml(searchQuery)}` : ''
          }</div>
          <div><strong>Gerado por:</strong> ${escapeHtml(generatedBy)} em ${formatDateTimeBr(new Date().toISOString())}</div>
          <div><strong>Total de registros:</strong> ${items.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Laboratório / Atividade</th>
              <th>Professor</th>
              <th>Data / Horário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="footer">Documento gerado automaticamente pelo sistema AGIL.</div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Exportar Histórico de Reservas (PDF)',
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}
