import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ResultadoValidacaoServidor,
  ServidorTransparencia,
} from './interfaces/pt.interface.js';

@Injectable()
export class TransparenciaService {
  private readonly logger = new Logger(TransparenciaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validateQuixadaPublicServant(
    nameSearch: string,
  ): Promise<ResultadoValidacaoServidor> {
    const baseUrl = this.configService.getOrThrow<string>('PT_API_URL');
    const token = this.configService.getOrThrow<string>('PT_API_KEY');
    const siapeIfce = this.configService.get<string>('SIAPE_IFCE', '26405');

    try {
      // busca pelo nome digitado/recebido do Google
      let resultados = await this.fetchServidores(
        baseUrl,
        token,
        siapeIfce,
        nameSearch,
      );

      // se não encontrou e o nome tem mais de uma palavra, busca apenas pelo primeiro nome
      const nameParts = nameSearch.trim().split(/\s+/);
      if ((!resultados || resultados.length === 0) && nameParts.length > 1) {
        const firstName = nameParts[0];
        resultados = await this.fetchServidores(
          baseUrl,
          token,
          siapeIfce,
          firstName,
        );
      }

      if (!resultados || resultados.length === 0) {
        return { encontrado: false, pertenceAoCampusQuixada: false };
      }

      // itera sobre os resultados aplicando correspondência de tokens
      for (const item of resultados) {
        const nomeOficial = (item.servidor?.pessoa?.nome || '').toUpperCase();

        // garante que o registro retornado realmente corresponde à pessoa buscada
        if (!this.matchesNameTokens(nameSearch, nomeOficial)) {
          continue;
        }

        const ficha = item.fichasCargoEfetivo?.[0];
        if (!ficha) continue;

        const uorgLotacao = (ficha.uorgLotacao || '').toUpperCase();
        const uorgExercicio = (ficha.uorgExercicio || '').toUpperCase();
        const cargo = (ficha.cargo || '').toUpperCase();

        const pertenceAoCampusQuixada =
          uorgLotacao.includes('QUIXADA') ||
          uorgExercicio.includes('QUIXADA') ||
          uorgExercicio.endsWith('-QUI');

        if (pertenceAoCampusQuixada) {
          const isDocente =
            cargo.includes('PROFESSOR') || cargo.includes('DOCENTE');

          return {
            encontrado: true,
            pertenceAoCampusQuixada: true,
            nome: item.servidor?.pessoa?.nome || ficha.nome,
            isDocente,
            cargo,
            uorgLotacao: ficha.uorgLotacao,
          };
        }
      }

      return { encontrado: true, pertenceAoCampusQuixada: false };
    } catch (error: any) {
      this.logger.error(
        `Erro ao consultar Portal da Transparência: ${error.message}`,
      );
      return { encontrado: false, pertenceAoCampusQuixada: false };
    }
  }

  //  realiza a requisição HTTP para a API do Portal da Transparência
  private async fetchServidores(
    baseUrl: string,
    token: string,
    siapeIfce: string,
    nome: string,
  ): Promise<ServidorTransparencia[]> {
    const response = await firstValueFrom(
      this.httpService.get<ServidorTransparencia[]>(`${baseUrl}/servidores`, {
        headers: {
          accept: 'application/json',
          'chave-api-dados': token,
        },
        params: {
          orgaoServidorLotacao: siapeIfce,
          situacaoServidor: 1, // Ativos
          tipoServidor: 1, // Civis
          nome,
          pagina: 1,
        },
      }),
    );
    return response.data || [];
  }

  /**
   * verifica se todas as palavras relevantes do nome buscado (ex: "Randson", "Alves")
   * estão presentes no nome oficial (ex: "Randson da Silva Alves")
   */
  private matchesNameTokens(
    searchedName: string,
    officialName: string,
  ): boolean {
    const stopWords = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E']);

    const searchedTokens = searchedName
      .toUpperCase()
      .split(/\s+/)
      .filter((token) => token.length > 2 && !stopWords.has(token));

    // se todos os sobrenomes relevantes do usuário estiverem contidos no nome oficial
    return searchedTokens.every((token) => officialName.includes(token));
  }
}
