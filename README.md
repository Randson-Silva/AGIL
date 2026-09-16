# 📱 AGIL - Aplicativo de Gerência de Insumos e Laboratórios

**AGIL** é uma aplicação desenvolvida para facilitar o agendamento e gestão dos insumos e laboratório de química do Instituto Federal do Ceará (IFCE), beneficiando alunos, técnicos e professores da comunidade acadêmica.

---

## 📋 Índice

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Rodando a Aplicação](#rodando-a-aplicação)
  - [API (Backend)](#api-backend)
  - [Mobile (Frontend)](#mobile-frontend)
  - [Docker](#docker)
  - [Prisma](#prisma)
- [Configuração de Lint e Padronização](#configuração-de-lint-e-padronização)
- [Como Contribuir](#como-contribuir)
- [Troubleshooting](#troubleshooting)

---

## 📁 Estrutura do Projeto

Este é um **monorepo** com a seguinte estrutura:

```
AGIL/
├── api/                       # Backend - NestJS API
│   ├── src/                  # Código-fonte da API
│   ├── prisma/               # Configurações e migrations do banco
│   ├── test/                 # Testes unitários
│   ├── package.json
│   ├── .prettierrc
│   └── vitest.config.ts
├── mobile/                    # Frontend Mobile - React Native/Expo
│   ├── app/                  # Telas e componentes principais
│   ├── package.json
│   ├── .eslintrc.js
│   └── tailwind.config.js
├── compose.yml               # Docker Compose para banco de dados
├── .prettierrc                # Prettier config (raiz)
├── .editorconfig              # EditorConfig para padronização de indentação
├── .env.docker.example        # Exemplo de variáveis de ambiente para Docker
└── package.json               # Scripts root para Docker e outros utilitários
```

---

## 🔧 Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** (v18+ recomendado)
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (para rodar o PostgreSQL)
- **Git** (para versionamento)

### Verificar instalações:
```bash
node --version
npm --version
docker --version
```

---

## 💻 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/Randson-Silva/AGIL.git
cd AGIL
```

### 2. Instalar Dependências da Raiz

```bash
npm install
```

### 3. Instalar Dependências da API

```bash
cd api
npm install
cd ..
```

### 4. Instalar Dependências do Mobile

```bash
cd mobile
npm install
cd ..
```

### 5. Configurar Variáveis de Ambiente

#### Para Docker (Banco de Dados):

```bash
cp .env.docker.example .env.docker
```

Edite o arquivo `.env.docker` com suas credenciais:

```env
POSTGRES_PORT=5432
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=db_name
PGADMIN_PORT=5050
PGADMIN_DEFAULT_EMAIL=default@email.com
PGADMIN_DEFAULT_PASSWORD=anotherPassword
```

#### Para API:

```bash
cd api
cp .env.example .env
```

Edite o arquivo `api/.env` com a URL do banco de dados:

```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
```

---

## 🚀 Rodando a Aplicação

### API (Backend)

#### 1. Subir o Banco de Dados (PostgreSQL) com Docker

Na raiz do projeto:

```bash
npm run docker:up
```

Isso inicia o PostgreSQL e PgAdmin em containers Docker.

**Verificar status:**
```bash
npm run docker:ps
```

**Ver logs:**
```bash
npm run docker:logs
```

#### 2. Rodar Migrations do Prisma

```bash
cd api
npm run db:migrate
```

#### 3. Iniciar a API em Desenvolvimento

```bash
cd api
npm run start:dev
```

A API estará disponível em: `http://localhost:3000`

#### Outras opções:

```bash
# Modo produção
npm run start:prod

# Modo debug
npm run start:debug
```

#### Acessar Prisma Studio (GUI para o banco):

```bash
cd api
npm run db:studio
```

### Mobile (Frontend)

#### Instalar Dependências (se não fez antes):

```bash
cd mobile
npm install
```

#### Iniciar a Aplicação

```bash
npm start
```

#### Opções de Execução:

```bash
# Android Emulator
npm run android

# iOS Simulator (apenas em macOS)
npm run ios

# Web Browser
npm run web

# Modo Tunnel (para testar em dispositivo real)
npm run tunnel
```

#### Após rodar `npm start`, você verá um QR Code

- **Expo Go**: Escaneie o QR Code com o app Expo Go (disponível em App Store e Google Play)
- **Emulador**: Pressione `a` para Android ou `i` para iOS
- **Web**: Pressione `w` para abrir no navegador

### Docker

#### Comandos Disponíveis:

```bash
# Subir os containers (PostgreSQL + PgAdmin)
npm run docker:up

# Parar os containers
npm run docker:down

# Ver logs em tempo real
npm run docker:logs

# Ver status dos containers
npm run docker:ps
```

#### Acessar PgAdmin:

- URL: `http://localhost:5050`
- Email: (conforme configurado em `.env.docker`)
- Senha: (conforme configurado em `.env.docker`)

### Prisma

#### Criar uma Nova Migration

```bash
cd api
npm run db:migrate
# Nome da migration será solicitado no prompt
```

#### Executar Migrations Pendentes

```bash
cd api
npm run db:migrate
```

#### Abrir Prisma Studio (GUI)

```bash
cd api
npm run db:studio
```

#### Gerar Cliente Prisma (após mudanças no schema)

```bash
cd api
npx prisma generate
```

##### 🔄 Diferença entre `prisma migrate` e `prisma generate`

* **`prisma migrate` (modifica o banco de dados)**
  * Cria e aplica alterações estruturais no banco (tabelas, colunas, chaves, índices).
  * Gera arquivos de histórico em SQL (`.sql`).
  * **Quando usar:** Sempre que você alterar a estrutura do banco no `schema.prisma`.
  * **Comando de desenvolvimento:** `npx prisma migrate dev --name nome_da_alteracao`

* **`prisma generate` (gera o código TypeScript/Client)**
  * Gera ou atualiza o **Prisma Client** (tipos e métodos de consulta da aplicação).
  * **Não altera** nada no banco de dados.
  * **Quando usar:** Após clonar o projeto, rodar instalações ou após migrações para atualizar os tipos no código.
  * **Comando:** `npx prisma generate`

> **Resumo rápido:**  
> `migrate` atualiza o **banco de dados**; `generate` atualiza o **código/tipos** do projeto.
``` [[CLI generate](https://www.prisma.io/docs/cli/v7/generate); [Hassle-Free Migrations](https://www.prisma.io/blog/prisma-migrate-ga-b5eno5g08d0b#how-does-prisma-migrate-work)] ```

---

## ⚙️ Configuração de Lint e Padronização

### Configuração de Indentação e Formatação

O projeto usa as seguintes ferramentas para padronização:

#### **EditorConfig** (`.editorconfig`)

Garante indentação e formatação consistentes entre diferentes editores:

- **Indent Style**: Espaços (2 espaços)
- **End of Line**: LF (Unix)
- **Charset**: UTF-8
- **Trim Trailing Whitespace**: Habilitado
- **Insert Final Newline**: Habilitado

A maioria dos editores (VSCode, WebStorm, etc.) respeita automaticamente. Se não, instale a extensão EditorConfig.

#### **Prettier** (Formatação de Código)

Configuração global (`.prettierrc`):

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Prettier na API** (`api/.prettierrc`):

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

**Prettier no Mobile**: Usa a config global

##### Rodar Prettier:

```bash
# API - Formatar arquivos
cd api
npm run format

# Mobile - Formatar com Prettier
cd mobile
npx prettier --write "app/**/*.{ts,tsx,js,jsx}"
```

#### **ESLint** (Linting)

**Mobile** (`mobile/.eslintrc.js`):

```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
```

**API**: Usa `oxlint` (mais rápido e moderno)

##### Rodar Linting:

```bash
# Mobile
cd mobile
npm run lint

# API com Oxlint
cd api
npm run lint
```

### Configurar no Visual Studio Code

Para melhor experiência de desenvolvimento, instale essas extensões:

1. **EditorConfig for VS Code** (editorconfig.editorconfig)
2. **Prettier - Code formatter** (esbenp.prettier-vscode)
3. **ESLint** (dbaeumer.vscode-eslint)
4. **TypeScript Vue Plugin (Volar)** (vue.volar) - se trabalhar com Vue

#### `settings.json` Recomendado:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "javascriptreact", "typescriptreact"]
}
```

---

## 📝 Como Contribuir

### Passo 1: Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone sua fork
git clone https://github.com/SEU_USUARIO/AGIL.git
cd AGIL
```

### Passo 2: Criar uma Branch de Feature

Use nomes descritivos para suas branches:

```bash
# Para features
git checkout -b feature/nome-da-feature

# Para correções
git checkout -b fix/nome-da-correcao

# Para documentação
git checkout -b docs/nome-da-documentacao
```

Exemplo:
```bash
git checkout -b feature/adicionar-autenticacao
git checkout -b fix/corrigir-validacao-email
```

### Passo 3: Fazer Alterações e Commitar

#### Antes de Commitar:

1. **Executar Linting**:

   ```bash
   # Se modificou API
   cd api
   npm run lint

   # Se modificou Mobile
   cd mobile
   npm run lint
   ```

2. **Formatar Código**:

   ```bash
   # Se modificou API
   cd api
   npm run format

   # Se modificou Mobile
   cd mobile
   npx prettier --write "app/**/*.{ts,tsx,js,jsx}"
   ```

3. **Executar Testes**:

   ```bash
   # API
   cd api
   npm run test

   # Para coverage
   npm run test:cov
   ```

#### Fazer Commit:

Siga as convenções de commit:

```bash
# Feature
git commit -m "feat: descrição da nova feature"

# Fix
git commit -m "fix: descrição do bug corrigido"

# Refactor
git commit -m "refactor: descrição da refatoração"

# Docs
git commit -m "docs: descrição da documentação"

# Tests
git commit -m "test: descrição do teste"
```

Exemplo:
```bash
git commit -m "feat: adicionar endpoint de login"
git commit -m "fix: corrigir validação de email no formulário"
git commit -m "docs: atualizar seção de instalação no README"
```

### Passo 4: Push e Pull Request

```bash
# Push para sua fork
git push origin feature/nome-da-feature

# Abra um Pull Request no GitHub
```

#### No PR, inclua:

- **Descrição**: O que foi mudado e por quê
- **Type**: `feat`, `fix`, `refactor`, `docs`, `test`
- **Checklist**:
  - [ ] Código segue as regras de lint
  - [ ] Prettier foi executado
  - [ ] Testes foram criados/atualizados
  - [ ] Documentação foi atualizada

### Passo 5: Code Review

- Aguarde feedback dos mantenedores
- Faça as alterações solicitadas
- Push as novas alterações (o PR se atualiza automaticamente)

### Passo 6: Merge

Após aprovação, o PR será merged para a branch principal.

---

## 📋 Checklist para Contribuidores

Antes de abrir um PR, certifique-se de:

- [ ] Clonou o repositório corretamente
- [ ] Criou uma branch com nome descritivo
- [ ] Instalou todas as dependências (`npm install`)
- [ ] Configurou variáveis de ambiente (`.env` e `.env.docker`)
- [ ] Rodou linting sem erros (`npm run lint`)
- [ ] Rodou Prettier para formatar código (`npm run format`)
- [ ] Testes passam (`npm run test`)
- [ ] Código segue as convenções do projeto
- [ ] Mensagens de commit são claras e descritivas
- [ ] PR tem descrição detalhada

---

## 🐛 Troubleshooting

### Problema: `npm install` falha

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Tentar novamente
npm install
```

### Problema: Porta PostgreSQL já está em uso

**Solução:**
```bash
# Matar processo na porta 5432
# Linux/Mac
lsof -ti:5432 | xargs kill -9

# Windows
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Ou verifique nos arquivos de env
```

### Problema: `DATABASE_URL` inválida

**Verificar:**
```bash
# Certifique-se de que .env.docker está configurado
cat .env.docker

# Certifique-se de que Docker está rodando
docker ps

# Verifique a URL em api/.env
# Format: postgresql://user:password@host:port/database?schema=public
```

### Problema: Prisma migration falha

**Solução:**
```bash
cd api

# Resetar banco (CUIDADO: apaga dados!)
npx prisma migrate reset

# Ou, criar nova migration
npm run db:migrate
```

### Problema: Prettier não formata automaticamente

**Verificar:**
```bash
# Se a extensão está instalada no VSCode
# Abra a paleta de comando (Ctrl+Shift+P)
# Digite: "Format Document"

# Ou, formatar manualmente
npm run format  # API
npx prettier --write "app/**/*.{ts,tsx,js,jsx}"  # Mobile
```

### Problema: ESLint mostra erros que Prettier não corrige

**Solução:**
```bash
# Prettier primeiro, depois ESLint
npm run format      # Formata código
npm run lint        # Verifica erros de lint

# Se ainda houver conflitos, configure o ESLint com Prettier
npm install -D eslint-config-prettier
```

### Problema: Porta 3000 já está em uso (API)

**Solução:**
```bash
# Matar processo na porta 3000
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou, mudar porta em api/.env
# PORT=3001
```

---

## 📚 Documentação Adicional

- [NestJS Docs](https://docs.nestjs.com/)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Docker Docs](https://docs.docker.com/)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o [Troubleshooting](#troubleshooting)
2. Procure em issues abertas: [GitHub Issues](https://github.com/Randson-Silva/AGIL/issues)
3. Abra uma nova issue com detalhes do problema

