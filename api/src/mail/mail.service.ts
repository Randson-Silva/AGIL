import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
}
