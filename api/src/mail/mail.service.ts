import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface ReservationEmailPayload {
  to: string;
  professorNome: string;
  local: string;
  titulo: string;
  dataReserva: Date;
  horarios: Array<{ hora_inicio: string; hora_fim: string }>;
  status: 'APROVADA' | 'REJEITADA';
  motivoRejeicao?: string | null;
}

export interface BreakdownEmailPayload {
  to: string[];
  materialNome: string;
  tipoOcorrencia: string;
  quantidade: number;
  unidadeMedida: string;
  descricao?: string | null;
  professorNome: string;
  dataReporte: Date;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: `"AGIL" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject: 'Código de Redefinição de Senha',
        text: `Seu código de redefinição de senha é: ${code}. Ele expira em 15 minutos.`,
        html: `<p>Seu código de redefinição de senha é: <strong>${code}</strong></p><p>Ele expira em 15 minutos.</p>`,
      });
      this.logger.log(`E-mail de recuperação enviado para ${to}`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail de recuperação', error);
      throw new Error('Não foi possível enviar o e-mail de recuperação.');
    }
  }

  async sendLowStockAlertEmail(
    to: string[],
    insumoNome: string,
    saldo: number,
    minimo: number,
  ) {
    if (!to || to.length === 0) return;
    try {
      await this.transporter.sendMail({
        from: `"AGIL - Alerta de Estoque" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject: `⚠️ Alerta: Estoque Crítico - ${insumoNome}`,
        html: `
              <h2>Alerta de Estoque Baixo</h2>
              <p>O insumo <strong>${insumoNome}</strong> atingiu um nível crítico.</p>
              <ul>
                <li><strong>Saldo Atual:</strong> ${saldo}</li>
                <li><strong>Quantidade Mínima Ideal:</strong> ${minimo}</li>
              </ul>
              <p>Por favor, providencie a reposição o mais rápido possível.</p>
            `,
      });
      this.logger.log(`Alerta de estoque enviado para ${to}`);
    } catch (error) {
      this.logger.error('Erro ao enviar alerta de estoque', error);
    }
  }

  async sendReservationStatusEmail(payload: ReservationEmailPayload) {
    const {
      to,
      professorNome,
      local,
      titulo,
      dataReserva,
      horarios,
      status,
      motivoRejeicao,
    } = payload;

    if (!to) return;

    const isApproved = status === 'APROVADA';
    const statusLabel = isApproved ? 'Aprovada' : 'Rejeitada';
    const statusColor = isApproved ? '#00623B' : '#DC2626';

    const dateObj = new Date(dataReserva);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
    });

    const formattedSlots =
      horarios.length > 0
        ? horarios.map((h) => `${h.hora_inicio} às ${h.hora_fim}`).join(', ')
        : 'Horário não informado';

    const reasonText =
      !isApproved && motivoRejeicao
        ? `\nMotivo da rejeição: ${motivoRejeicao}`
        : '';

    const reasonHtml =
      !isApproved && motivoRejeicao
        ? `
          <div style="margin-top: 16px; padding: 12px; background-color: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 4px;">
            <p style="margin: 0; color: #991B1B;"><strong>Motivo da Rejeição:</strong> ${motivoRejeicao}</p>
          </div>
        `
        : '';

    try {
      await this.transporter.sendMail({
        from: `"AGIL - Reservas" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject: `Reserva de Laboratório ${statusLabel} - ${local}`,
        text: `Olá, ${professorNome}.\n\nSua solicitação de reserva para a prática "${titulo}" foi ${statusLabel.toUpperCase()}.\n\nDados da reserva:\n- Laboratório: ${local}\n- Data: ${formattedDate}\n- Horário(s): ${formattedSlots}${reasonText}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1F2937; line-height: 1.5;">
            <h2 style="color: ${statusColor};">Solicitação de Reserva ${statusLabel}</h2>
            <p>Olá, <strong>${professorNome}</strong>,</p>
            <p>Sua solicitação de reserva de laboratório foi analisada pela equipe técnica e teve o status atualizado para <strong style="color: ${statusColor};">${statusLabel.toUpperCase()}</strong>.</p>

            <div style="background-color: #F8FAF9; padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB;">
              <p style="margin: 4px 0;"><strong>Atividade:</strong> ${titulo}</p>
              <p style="margin: 4px 0;"><strong>Laboratório:</strong> ${local}</p>
              <p style="margin: 4px 0;"><strong>Data:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0;"><strong>Horário(s):</strong> ${formattedSlots}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusLabel}</span></p>
            </div>

            ${reasonHtml}

            <p style="margin-top: 20px; font-size: 12px; color: #6B7280;">
              Mensagem automática enviada pelo sistema AGIL.
            </p>
          </div>
        `,
      });
      this.logger.log(`E-mail de reserva (${status}) enviado para ${to}`);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail de status da reserva para ${to}`,
        error,
      );
    }
  }

  async sendBreakdownAlertEmail(payload: BreakdownEmailPayload) {
    const {
      to,
      materialNome,
      tipoOcorrencia,
      quantidade,
      unidadeMedida,
      descricao,
      professorNome,
      dataReporte,
    } = payload;

    if (!to || to.length === 0) {
      this.logger.warn(
        'Nenhum usuário com perfil TECNICO encontrado para envio de e-mail de avaria.',
      );
      return;
    }

    const formattedDate = new Date(dataReporte).toLocaleString('pt-BR', {
      timeZone: 'America/Fortaleza',
    });

    const descriptionText = descricao?.trim()
      ? descricao
      : 'Nenhuma descrição adicional informada.';

    try {
      await this.transporter.sendMail({
        from: `"AGIL - Alerta de Avaria" <${this.configService.get<string>('SMTP_USER')}>`,
        to,
        subject: `⚠️ Alerta de Avaria Reportada - ${materialNome}`,
        text: `Um novo reporte de avaria foi registrado no sistema.\n\n- Material: ${materialNome}\n- Ocorrência: ${tipoOcorrencia}\n- Quantidade afetada: ${quantidade} ${unidadeMedida}\n- Professor responsável: ${professorNome}\n- Data/Hora: ${formattedDate}\n- Descrição do problema: ${descriptionText}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #1F2937; line-height: 1.5;">
            <h2 style="color: #D97706;">⚠️ Novo Reporte de Avaria</h2>
            <p>Um professor registrou um problema ou avaria de material no laboratório e o estoque foi atualizado automaticamente.</p>

            <div style="background-color: #FFFBEB; padding: 16px; border-radius: 8px; border: 1px solid #FDE68A;">
              <p style="margin: 4px 0;"><strong>Material afetado:</strong> ${materialNome}</p>
              <p style="margin: 4px 0;"><strong>Tipo de ocorrência:</strong> ${tipoOcorrencia}</p>
              <p style="margin: 4px 0;"><strong>Quantidade deduzida:</strong> ${quantidade} ${unidadeMedida}</p>
              <p style="margin: 4px 0;"><strong>Professor responsável:</strong> ${professorNome}</p>
              <p style="margin: 4px 0;"><strong>Data/Hora do reporte:</strong> ${formattedDate}</p>
            </div>

            <div style="margin-top: 16px; padding: 12px; background-color: #F8FAF9; border-left: 4px solid #00623B; border-radius: 4px;">
              <p style="margin: 0; color: #111827;"><strong>Descrição do Problema:</strong> ${descriptionText}</p>
            </div>

            <p style="margin-top: 16px;">Acesse o Painel Administrativo do sistema AGIL para verificar os alertas pendentes e tomar as providências de reposição ou manutenção.</p>
          </div>
        `,
      });
      this.logger.log(
        `Alerta de avaria (${materialNome}) enviado para: ${to.join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail de alerta de avaria', error);
    }
  }
}
