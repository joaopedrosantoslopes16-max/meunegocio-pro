# MeuNegócio Pro

Mini site com botão de WhatsApp + 30 posts personalizados para Instagram — para pequenos negócios locais.

---

## Configuração rápida

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas chaves:

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_CHECKOUT_URL` | URL do produto no Kirvano/Kiwify/Hotmart |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Seu e-mail de suporte |
| `NEXT_PUBLIC_APP_URL` | URL da sua aplicação (sem barra no final) |
| `WEBHOOK_SECRET` | Token secreto para validar webhooks |

### 3. Configurar Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) e crie um projeto
2. Vá em **SQL Editor → New Query**
3. Cole e execute o conteúdo de `supabase/schema.sql`
4. Execute em seguida `supabase/rls-policies.sql`

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Onde editar as configurações principais

| O que mudar | Onde |
|---|---|
| Preço do produto | `app/page.tsx` → constante `PRICE` |
| Link do checkout | `.env.local` → `NEXT_PUBLIC_CHECKOUT_URL` |
| E-mail de suporte | `.env.local` → `NEXT_PUBLIC_SUPPORT_EMAIL` |
| URL da aplicação | `.env.local` → `NEXT_PUBLIC_APP_URL` |

---

## Fluxo completo do sistema

```
Usuário visita /
    → Preenche formulário de prévia grátis
    → Vê simulação do mini site e post
    → Clica em "Liberar meu kit completo"
    → Vai para CHECKOUT_URL (Kirvano/Kiwify/Hotmart)

Após pagamento aprovado:
    → Checkout redireciona para /obrigado
    → Usuário vai para /cadastro-pos-compra
    → Sistema valida e-mail na tabela purchases
    → Usuário cria conta
    → Acessa /dashboard

No dashboard:
    → Clica em "Gerar meu kit"
    → Preenche dados do negócio em /gerar-kit
    → Sistema cria business + kit no banco
    → Redireciona para /kit/[id]

Liberação progressiva:
    → Dia 0: mini site + 3 posts + 3 legendas + 3 mensagens + bio
    → Dia 3: +10 posts + +10 legendas + +5 mensagens
    → Dia 7: tudo liberado (30+30+10)

Webhook (automático):
    → POST /api/webhooks/kirvano
    → Plataforma envia evento de pagamento
    → Sistema atualiza status da compra
    → Se reembolso/cancelamento: bloqueia kit
```

---

## Configurar webhook na plataforma de pagamento

### URL do webhook
```
https://SEU-DOMINIO.com/api/webhooks/kirvano
```

### Kirvano
1. Painel → Configurações → Webhooks
2. Adicionar URL do webhook
3. Selecionar eventos: `order.approved`, `order.refunded`, `order.chargeback`, `order.cancelled`
4. Copiar o token secreto para `WEBHOOK_SECRET`
5. No arquivo `app/api/webhooks/kirvano/route.ts`, descomente o bloco de validação do token

### Kiwify
1. Painel → Configurações → Notificações → Webhook
2. Mesma URL, selecionar todos os eventos de compra

### Hotmart
1. Painel → Ferramentas → Webhooks
2. Mesma URL, selecionar eventos de compra, reembolso e chargeback

---

## Testando sem webhook real

Use a rota de simulação (apenas em desenvolvimento):

```bash
curl -X POST http://localhost:3000/api/admin/mark-paid \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@teste.com", "admin_key": "dev-only"}'
```

Isso marca o e-mail como pago no banco e permite criar conta e gerar kit.

---

## Publicar na Vercel

```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente no painel da Vercel:
- Projeto → Settings → Environment Variables
- Adicione todas as variáveis do `.env.local`

A Vercel detecta Next.js automaticamente e faz o deploy completo.

---

## Publicar na Netlify

```bash
npm run build
```

Configure:
- Build command: `npm run build`
- Publish directory: `.next`
- Instale o plugin `@netlify/plugin-nextjs`

---

## Estrutura de arquivos

```
meunegocio-pro/
├── app/
│   ├── page.tsx                    Landing page com prévia grátis
│   ├── (auth)/
│   │   ├── login/                  Página de login
│   │   ├── cadastro/               Cadastro com validação de compra
│   │   └── cadastro-pos-compra/    Cadastro após compra
│   ├── (protected)/
│   │   ├── dashboard/              Área do cliente
│   │   ├── gerar-kit/              Formulário de geração de kit
│   │   └── kit/[id]/               Detalhes do kit com tabs
│   ├── site/[slug]/                Mini site público do cliente
│   ├── obrigado/                   Página pós-compra
│   ├── suporte/                    Página de suporte
│   ├── acesso-pendente/            Compra em análise
│   ├── acesso-bloqueado/           Reembolso/cancelamento
│   └── api/
│       ├── webhooks/kirvano/       Recebe eventos da plataforma de pagamento
│       ├── check-purchase/         Verifica se e-mail tem compra aprovada
│       └── admin/mark-paid/        Simulação para testes (dev only)
├── lib/
│   ├── niche-config.ts             Config dos 12 nichos (CTA, serviços, tom)
│   ├── kit-generator.ts            Gera 30 posts, 30 legendas, 10 mensagens, bio
│   ├── whatsapp-utils.ts           Limpa telefone e gera link wa.me
│   ├── release-schedule.ts         Calcula etapa de liberação por data
│   └── supabase/
│       ├── client.ts               Cliente browser (anon key)
│       └── server.ts               Cliente server (anon + service role)
├── middleware.ts                   Protege rotas /dashboard, /gerar-kit, /kit
├── supabase/
│   ├── schema.sql                  Todas as tabelas e triggers
│   └── rls-policies.sql            Row Level Security
└── types/index.ts                  Interfaces TypeScript
```

---

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` **nunca é exposta no frontend**
- Toda validação de compra é feita via API route com service role
- RLS garante que usuários só veem seus próprios dados
- Mini sites são públicos mas o slug é único e aleatório
- Webhook deve ter token validado antes de ir para produção
- Rota `/api/admin/mark-paid` retorna 403 em produção automaticamente
