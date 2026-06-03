# 🛠️ Formulário de Cadastro de Leads — Prestador Autônomo

Formulário web responsivo (mobile-first) para captação de leads de prestadores de serviços autônomos. O cliente acessa escaneando um QR Code e, ao enviar, o prestador recebe uma notificação via WhatsApp com todos os dados do lead.

---

## Funcionalidades

- **Formulário mobile-first** — layout otimizado para celular, funciona em qualquer navegador
- **QR Code** — o prestador imprime ou compartilha o QR; o cliente escaneia e cai direto no formulário
- **Toggle de contato** — cliente escolhe entre WhatsApp ou e-mail
- **Máscara de telefone** — formatação automática `(XX) XXXXX-XXXX`
- **16 categorias de serviço** — seleção por dropdown com ícones
- **Validação de campos** — alertas amigáveis antes do envio
- **Tela de sucesso** — após envio, exibe ações rápidas:
  - 💬 Link direto para confirmar pelo WhatsApp do cliente
  - ✉️ Link `mailto:` com mensagem pré-preenchida (quando e-mail)
  - 📨 Notificação ao prestador via WhatsApp com resumo formatado do lead
- **Zero dependências externas** — apenas Google Fonts; sem frameworks, sem backend

---

## Estrutura do projeto

```
leadform-autonomo/
├── index.html        # Formulário completo (arquivo único, self-contained)
├── DEPLOY_GUIDE.html # Guia visual de deploy com QR Codes embutidos
└── README.md         # Este arquivo
```

---

## Personalização obrigatória

Antes de publicar, abra o `index.html` em qualquer editor de texto e ajuste:

```javascript
// linha ~211
const PRESTADOR_WA = '5531999999999'; // ← WhatsApp do prestador (só números, com DDI+DDD)
```

Opcionalmente, edite também:

```html
<!-- linha 7 — aba do navegador -->
<title>Solicite seu Orçamento</title>

<!-- linha 58 — título principal -->
<h1>Solicite seu Orçamento</h1>

<!-- linha 59 — subtítulo -->
<p>Preencha e entro em contato rapidinho!</p>
```

Para adicionar ou remover categorias de serviço, edite as `<option>` dentro do `<select id="servico">` (linhas 105–122).

---

## Deploy (hospedagem gratuita)

### Opção 1 — Netlify Drop (recomendado, sem cadastro)

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste o arquivo `index.html` para a área de upload
3. Copie a URL gerada (ex: `https://amazing-crane-123.netlify.app`)
4. Personalize o subdomínio em **Site settings → Change site name**

### Opção 2 — GitHub Pages

1. Crie um repositório público em [github.com/new](https://github.com/new)
2. Faça upload do `index.html` (ou push via git)
3. Vá em **Settings → Pages → Source: main / root**
4. A URL ficará disponível em `https://seu-usuario.github.io/nome-do-repo`

### Opção 3 — Vercel

```bash
npm i -g vercel
cd leadform-autonomo
vercel --prod
```

---

## Gerar o QR Code real

Após obter a URL pública, gere o QR Code para impressão:

- [qr-code-generator.com](https://www.qr-code-generator.com) — gratuito, alta resolução
- [goqr.me](https://goqr.me) — permite personalizar cor e formato
- [qrcode-monkey.com](https://www.qrcode-monkey.com) — adiciona logo no centro

> Dica: baixe o QR em formato SVG ou PNG 1000px+ para impressão em cartão, panfleto ou banner sem perda de qualidade.

---

## Fluxo de uso

```
Cliente escaneia QR Code
        ↓
Abre o formulário no celular
        ↓
Preenche: nome, contato, serviço, endereço, obs
        ↓
Clica em "Solicitar orçamento"
        ↓
Tela de sucesso com dois botões:
  ├── 💬 Confirmar com cliente (WhatsApp ou e-mail)
  └── 📨 Notificar prestador (WhatsApp)
```

A mensagem enviada ao prestador segue este formato:

```
📋 *NOVO LEAD*
👤 Maria Silva
🛠️ Elétrica
📍 Rua das Flores, 42 – Savassi
📅 03/06/2026, 14:32:00
📝 Preciso trocar tomadas e instalar ventilador de teto
📱 (31) 98888-7777
```

---

## Tecnologias

| Recurso | Detalhe |
|---|---|
| HTML5 semântico | estrutura acessível |
| CSS3 puro | gradientes, transições, mobile-first |
| JavaScript vanilla | sem frameworks |
| Google Fonts | DM Serif Display + DM Sans |
| WhatsApp API | `wa.me` para links diretos |
| mailto: | confirmação por e-mail sem backend |

---

## Roadmap de melhorias sugeridas

- [ ] Integração com Google Sheets via Apps Script (salvar leads automaticamente)
- [ ] Notificação por e-mail ao prestador via EmailJS ou Formspree
- [ ] Campo de disponibilidade horária (manhã / tarde / noite)
- [ ] Upload de foto do problema pelo cliente
- [ ] Painel administrativo simples para visualizar leads recebidos
- [ ] Suporte a múltiplos prestadores no mesmo formulário

---

## Licença

Uso livre para fins pessoais e comerciais. Sem restrições.
