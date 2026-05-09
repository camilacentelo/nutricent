# NutriCent 🥗

O **NutriCent** é um sistema moderno de gestão para nutricionistas, projetado para oferecer uma experiência premium tanto no gerenciamento de pacientes quanto no acompanhamento de resultados. Com uma interface limpa e intuitiva, o sistema foca na praticidade do dia a dia clínico.

![NutriCent Preview](https://raw.githubusercontent.com/camilacentelo/nutricent/main/public/favicon.svg) <!-- Você pode substituir por um screenshot real depois -->

## 🚀 Funcionalidades

- **Dashboard Inteligente**: Visão geral de pacientes ativos, consultas da semana e alertas de pacientes sem retorno.
- **Gestão de Pacientes**: Cadastro completo e listagem com busca em tempo real.
- **Perfil 360° do Paciente**:
  - **Dados Editáveis**: Organização em abas (Pessoal, Clínico, Hábitos) com salvamento instantâneo.
  - **Evolução de Peso**: Gráficos dinâmicos que mostram o progresso do paciente ao longo das consultas.
  - **Histórico de Consultas**: Registro detalhado de medidas (peso, cintura, quadril, % de gordura) e observações.
- **Planos Alimentares**: Estrutura preparada para geração e histórico de dietas.
- **Segurança e Autenticação**: Sistema de login seguro integrado ao Supabase.
- **Experiência do Usuário**: Suporte a Modo Escuro (Dark Mode) e design responsivo.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as melhores tecnologias do ecossistema Web atual:

- **Frontend**: [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/) para maior robustez.
- **Build Tool**: [Vite](https://vitejs.dev/) para um desenvolvimento ultra-rápido.
- **Estilização**: CSS Vanilla (Design System Customizado) focado em performance e estética premium.
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (PostgreSQL, Auth e RLS).
- **Gráficos**: [Recharts](https://recharts.org/) para visualização de dados biométricos.
- **Ícones**: [Lucide React](https://lucide.dev/).

## 💻 Como o projeto foi desenvolvido

O desenvolvimento seguiu uma abordagem focada em escalabilidade e segurança:

1.  **Arquitetura de Banco de Dados**: Modelagem no Supabase com tabelas relacionais (`pacientes`, `consultas`, `planos_alimentares`) e políticas de RLS (Row Level Security) para garantir que cada nutricionista acesse apenas seus próprios dados.
2.  **Design System**: Criação de um sistema de tokens CSS para cores (Verde Piscina), tipografia e espaçamentos, garantindo consistência visual em todo o app.
3.  **Roteamento SPA**: Implementação de `react-router-dom` com proteção de rotas (apenas usuários logados acessam o sistema).
4.  **Otimização para Produção**: Configuração de builds otimizados e tratamento de erros de roteamento (404) para deploys em plataformas como Vercel e Netlify.

## ⚙️ Instalação Local

1.  Clone o repositório:
    ```bash
    git clone https://github.com/camilacentelo/nutricent.git
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente:
    - Crie um arquivo `.env` na raiz.
    - Adicione suas chaves do Supabase:
      ```env
      VITE_SUPABASE_URL=seu_url_aqui
      VITE_SUPABASE_ANON_KEY=sua_chave_aqui
      ```
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

---
Desenvolvido por **Camila Centelo** 👩‍💻
