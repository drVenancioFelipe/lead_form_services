/**
 * formLogic.js
 * Lógica de negócio do Formulário de Cadastro de Leads
 * Extraída do index.html para permitir testes unitários isolados.
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const PRESTADOR_WA = '5531999999999';

const SERVICOS_VALIDOS = [
  '🔧 Encanamento / Hidráulica',
  '⚡ Elétrica',
  '🎨 Pintura',
  '🪟 Marcenaria / Móveis',
  '🏗️ Alvenaria / Reforma',
  '🌿 Jardinagem',
  '🧹 Limpeza / Conservação',
  '📦 Mudança / Carreto',
  '❄️ Ar-condicionado',
  '🔒 Chaveiro',
  '💻 Informática / TI',
  '✂️ Beleza / Estética',
  '🐾 Cuidados com pets',
  '📚 Aulas / Reforço escolar',
  '🍽️ Culinária / Confeitaria',
  '🔨 Outros',
];

// ─── Formatação ─────────────────────────────────────────────────────────────────

/**
 * Aplica máscara de telefone brasileiro.
 * Retorna dígitos brutos se ainda insuficientes para formatar (< 3 dígitos).
 * Suporta 10 dígitos (fixo) e 11 dígitos (celular).
 * @param {string} valor
 * @returns {string} Ex: "(31) 99999-9999"
 */
function maskPhone(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 3) return digits;
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{1,4})(\d{0,4})/, (_, a, b, c) =>
      c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`
    );
  }
  return digits.replace(/(\d{2})(\d{1,5})(\d{0,4})/, (_, a, b, c) =>
    c ? `(${a}) ${b}-${c}` : `(${a}) ${b}`
  );
}

// ─── Validação ───────────────────────────────────────────────────────────────────

/**
 * Valida os campos do formulário antes do envio.
 * @param {Object} dados
 * @param {string} dados.nome
 * @param {string} dados.contactMode - 'whatsapp' | 'email'
 * @param {string} dados.whatsapp
 * @param {string} dados.email
 * @param {string} dados.servico
 * @param {string} dados.endereco
 * @returns {{ valido: boolean, erros: string[] }}
 */
function validarFormulario(dados) {
  const erros = [];

  if (!dados.nome || !dados.nome.trim()) {
    erros.push('Por favor, informe seu nome.');
  }

  if (dados.contactMode === 'whatsapp') {
    if (!dados.whatsapp || !dados.whatsapp.trim()) {
      erros.push('Informe seu WhatsApp.');
    }
  } else if (dados.contactMode === 'email') {
    if (!dados.email || !dados.email.trim()) {
      erros.push('Informe seu e-mail.');
    } else if (!validarEmail(dados.email)) {
      erros.push('Informe um e-mail válido.');
    }
  } else {
    erros.push('Selecione uma forma de contato.');
  }

  if (!dados.servico || !dados.servico.trim()) {
    erros.push('Selecione o tipo de serviço.');
  }

  if (!dados.endereco || !dados.endereco.trim()) {
    erros.push('Informe o endereço ou bairro.');
  }

  return { valido: erros.length === 0, erros };
}

/**
 * Valida formato básico de e-mail.
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Geração de mensagens ────────────────────────────────────────────────────────

/**
 * Remove o emoji/prefixo do nome do serviço selecionado.
 * Trata três casos: emoji BMP (⚡), multi-byte (🔧) e com variante U+FE0F (🏗️).
 * \p{Extended_Pictographic} cobre todos os code points pictográficos;
 * \uFE0F? absorve o seletor de variante de texto quando presente.
 * @param {string} servico
 * @returns {string}
 */
function limparServico(servico) {
  return servico.replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, '');
}

/**
 * Extrai o primeiro nome do nome completo.
 * @param {string} nomeCompleto
 * @returns {string}
 */
function primeiroNome(nomeCompleto) {
  return nomeCompleto.trim().split(' ')[0];
}

/**
 * Monta a mensagem de confirmação para o cliente (WhatsApp).
 * @param {string} nome
 * @param {string} servico
 * @returns {string} Mensagem formatada (não-encoded)
 */
function montarMsgCliente(nome, servico) {
  const firstName = primeiroNome(nome);
  const servicoLimpo = limparServico(servico);
  return `✅ *Solicitação recebida!*\nOlá, ${firstName}! Recebi seu pedido de *${servicoLimpo}* e vou entrar em contato em breve. Obrigado! 🙏`;
}

/**
 * Monta a mensagem de notificação para o prestador (WhatsApp).
 * @param {Object} dados
 * @param {string} dados.nome
 * @param {string} dados.servico
 * @param {string} dados.endereco
 * @param {string} dados.dataHora
 * @param {string} [dados.obs]
 * @param {string} [dados.whatsapp]
 * @param {string} [dados.email]
 * @returns {string} Mensagem formatada (não-encoded)
 */
function montarMsgPrestador(dados) {
  const servicoLimpo = limparServico(dados.servico);
  let msg = `📋 *NOVO LEAD*\n👤 ${dados.nome}\n🛠️ ${servicoLimpo}\n📍 ${dados.endereco}\n📅 ${dados.dataHora}`;
  if (dados.obs)      msg += `\n📝 ${dados.obs}`;
  if (dados.whatsapp) msg += `\n📱 ${dados.whatsapp}`;
  if (dados.email)    msg += `\n✉️ ${dados.email}`;
  return msg;
}

/**
 * Gera o link wa.me para o cliente.
 * @param {string} whatsappRaw - Número com ou sem máscara
 * @param {string} mensagem - Mensagem já montada (não-encoded)
 * @returns {string} URL completa
 */
function gerarLinkWhatsAppCliente(whatsappRaw, mensagem) {
  const numero = whatsappRaw.replace(/\D/g, '');
  return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Gera o link wa.me para o prestador.
 * @param {string} mensagem
 * @returns {string}
 */
function gerarLinkWhatsAppPrestador(mensagem) {
  return `https://wa.me/${PRESTADOR_WA}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Gera o link mailto para confirmação por e-mail ao cliente.
 * Usa encodeURIComponent com suporte a UTF-16 surrogate pairs (emojis).
 * @param {string} email
 * @param {string} nome
 * @param {string} servico
 * @returns {string}
 */
function gerarLinkEmail(email, nome, servico) {
  const firstName = primeiroNome(nome);
  const servicoLimpo = limparServico(servico);
  // encodeURIComponent no Node/jsdom não lida com surrogate pairs soltos;
  // convertemos a string para garantir que emojis sejam well-formed UTF-16.
  const safeEncode = (str) =>
    encodeURIComponent(unescape(encodeURIComponent(str)));

  const subject = safeEncode('Solicitação de orçamento recebida!');
  const body = safeEncode(
    `Olá, ${firstName}!\n\nRecebemos sua solicitação de "${servicoLimpo}" e entraremos em contato em breve.\n\nObrigado!`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

// ─── Exports ─────────────────────────────────────────────────────────────────────

module.exports = {
  maskPhone,
  validarFormulario,
  validarEmail,
  limparServico,
  primeiroNome,
  montarMsgCliente,
  montarMsgPrestador,
  gerarLinkWhatsAppCliente,
  gerarLinkWhatsAppPrestador,
  gerarLinkEmail,
  PRESTADOR_WA,
  SERVICOS_VALIDOS,
};
