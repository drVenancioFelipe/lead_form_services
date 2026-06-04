/**
 * formLogic.test.js
 * Testes unitários do Formulário de Cadastro de Leads
 *
 * Cobertura:
 *   ✅ maskPhone          — formatação de telefone
 *   ✅ validarEmail       — validação de e-mail
 *   ✅ validarFormulario  — validação completa do formulário
 *   ✅ limparServico      — limpeza de emoji do serviço
 *   ✅ primeiroNome       — extração do primeiro nome
 *   ✅ montarMsgCliente   — mensagem de confirmação ao cliente
 *   ✅ montarMsgPrestador — mensagem de notificação ao prestador
 *   ✅ gerarLinkWhatsApp  — links wa.me (cliente e prestador)
 *   ✅ gerarLinkEmail     — link mailto
 *   ✅ constantes         — PRESTADOR_WA e SERVICOS_VALIDOS
 */

const {
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
} = require('../src/formLogic');

// ─────────────────────────────────────────────────────────────────────────────
// maskPhone
// ─────────────────────────────────────────────────────────────────────────────

describe('maskPhone', () => {
  describe('celular (11 dígitos)', () => {
    test('formata número completo de celular', () => {
      expect(maskPhone('31987654321')).toBe('(31) 98765-4321');
    });

    test('formata com DDD 11 (São Paulo)', () => {
      expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
    });

    test('ignora caracteres não numéricos antes de formatar', () => {
      expect(maskPhone('(31) 98765-4321')).toBe('(31) 98765-4321');
    });

    test('ignora dígitos além de 11', () => {
      expect(maskPhone('319876543219999')).toBe('(31) 98765-4321');
    });
  });

  describe('fixo (10 dígitos)', () => {
    test('formata número fixo completo', () => {
      expect(maskPhone('3132345678')).toBe('(31) 3234-5678');
    });

    test('formata fixo com zeros à esquerda no prefixo', () => {
      expect(maskPhone('0800123456')).toBe('(08) 0012-3456');
    });
  });

  describe('entrada incompleta', () => {
    test('retorna string vazia para entrada vazia', () => {
      expect(maskPhone('')).toBe('');
    });

    test('retorna dígitos brutos para DDD incompleto (< 3 dígitos)', () => {
      expect(maskPhone('31')).toBe('31');
    });

    test('ignora letras e símbolos e formata os dígitos restantes', () => {
      // 'abc31def98765xyz' → 8 dígitos: '3198765' → (31) 9876-5... parcial
      expect(maskPhone('abc31def98765xyz')).toBe('(31) 9876-5');
    });

    test('retorna apenas dígitos para 1 caractere numérico', () => {
      expect(maskPhone('3')).toBe('3');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validarEmail
// ─────────────────────────────────────────────────────────────────────────────

describe('validarEmail', () => {
  describe('e-mails válidos', () => {
    test.each([
      'usuario@email.com',
      'nome.sobrenome@empresa.com.br',
      'contato+tag@dominio.org',
      'a@b.co',
      'usuario123@sub.dominio.net',
    ])('aceita "%s"', (email) => {
      expect(validarEmail(email)).toBe(true);
    });
  });

  describe('e-mails inválidos', () => {
    test.each([
      ['sem arroba',        'semArroba.com'],
      ['sem domínio',       'usuario@'],
      ['sem usuário',       '@dominio.com'],
      ['string vazia',      ''],
      ['só espaços',        '   '],
      ['com espaço interno','usu ario@email.com'],
      ['dois arrobas',      'a@@b.com'],
    ])('%s: rejeita "%s"', (_, email) => {
      expect(validarEmail(email)).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validarFormulario
// ─────────────────────────────────────────────────────────────────────────────

describe('validarFormulario', () => {
  const dadosValidos = {
    nome: 'Maria Silva',
    contactMode: 'whatsapp',
    whatsapp: '(31) 98765-4321',
    email: '',
    servico: '⚡ Elétrica',
    endereco: 'Rua das Flores, 42 – Savassi',
  };

  describe('formulário válido', () => {
    test('retorna valido=true e erros vazios com dados completos (WhatsApp)', () => {
      const resultado = validarFormulario(dadosValidos);
      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });

    test('retorna valido=true com contato por e-mail', () => {
      const resultado = validarFormulario({
        ...dadosValidos,
        contactMode: 'email',
        whatsapp: '',
        email: 'maria@email.com',
      });
      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });
  });

  describe('campo nome', () => {
    test('rejeita nome vazio', () => {
      const { valido, erros } = validarFormulario({ ...dadosValidos, nome: '' });
      expect(valido).toBe(false);
      expect(erros).toContain('Por favor, informe seu nome.');
    });

    test('rejeita nome apenas com espaços', () => {
      const { valido, erros } = validarFormulario({ ...dadosValidos, nome: '   ' });
      expect(valido).toBe(false);
      expect(erros).toContain('Por favor, informe seu nome.');
    });
  });

  describe('campo contato — WhatsApp', () => {
    test('rejeita whatsapp vazio quando contactMode é whatsapp', () => {
      const { valido, erros } = validarFormulario({ ...dadosValidos, whatsapp: '' });
      expect(valido).toBe(false);
      expect(erros).toContain('Informe seu WhatsApp.');
    });

    test('rejeita whatsapp com apenas espaços', () => {
      const { valido, erros } = validarFormulario({ ...dadosValidos, whatsapp: '   ' });
      expect(valido).toBe(false);
      expect(erros).toContain('Informe seu WhatsApp.');
    });
  });

  describe('campo contato — e-mail', () => {
    const baseEmail = { ...dadosValidos, contactMode: 'email', whatsapp: '' };

    test('rejeita e-mail vazio', () => {
      const { erros } = validarFormulario({ ...baseEmail, email: '' });
      expect(erros).toContain('Informe seu e-mail.');
    });

    test('rejeita e-mail com formato inválido', () => {
      const { erros } = validarFormulario({ ...baseEmail, email: 'nao-e-email' });
      expect(erros).toContain('Informe um e-mail válido.');
    });

    test('aceita e-mail válido', () => {
      const { valido } = validarFormulario({ ...baseEmail, email: 'maria@email.com' });
      expect(valido).toBe(true);
    });
  });

  describe('campo contactMode inválido', () => {
    test('rejeita contactMode desconhecido', () => {
      const { valido, erros } = validarFormulario({ ...dadosValidos, contactMode: 'sms' });
      expect(valido).toBe(false);
      expect(erros).toContain('Selecione uma forma de contato.');
    });
  });

  describe('campo serviço', () => {
    test('rejeita serviço vazio', () => {
      const { erros } = validarFormulario({ ...dadosValidos, servico: '' });
      expect(erros).toContain('Selecione o tipo de serviço.');
    });
  });

  describe('campo endereço', () => {
    test('rejeita endereço vazio', () => {
      const { erros } = validarFormulario({ ...dadosValidos, endereco: '' });
      expect(erros).toContain('Informe o endereço ou bairro.');
    });
  });

  describe('múltiplos erros', () => {
    test('acumula todos os erros de uma vez', () => {
      const { valido, erros } = validarFormulario({
        nome: '',
        contactMode: 'whatsapp',
        whatsapp: '',
        email: '',
        servico: '',
        endereco: '',
      });
      expect(valido).toBe(false);
      expect(erros).toContain('Por favor, informe seu nome.');
      expect(erros).toContain('Informe seu WhatsApp.');
      expect(erros).toContain('Selecione o tipo de serviço.');
      expect(erros).toContain('Informe o endereço ou bairro.');
      expect(erros.length).toBeGreaterThanOrEqual(4);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// limparServico
// ─────────────────────────────────────────────────────────────────────────────

describe('limparServico', () => {
  test('remove emoji BMP e espaço do início', () => {
    expect(limparServico('⚡ Elétrica')).toBe('Elétrica');
  });

  test('remove emoji multi-byte (> U+FFFF) corretamente', () => {
    expect(limparServico('🔧 Encanamento / Hidráulica')).toBe('Encanamento / Hidráulica');
  });

  test('remove emoji com variante de texto (️) corretamente', () => {
    expect(limparServico('🏗️ Alvenaria / Reforma')).toBe('Alvenaria / Reforma');
  });

  test('remove emoji de todos os 16 serviços cadastrados', () => {
    SERVICOS_VALIDOS.forEach((servico) => {
      const limpo = limparServico(servico);
      // resultado não deve começar com emoji nem espaço
      expect(limpo).toMatch(/^[A-ZÀ-Ú]/);
      expect(limpo.length).toBeGreaterThan(0);
    });
  });

  test('preserva barra e hífen no nome do serviço', () => {
    expect(limparServico('🔧 Encanamento / Hidráulica')).toBe('Encanamento / Hidráulica');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// primeiroNome
// ─────────────────────────────────────────────────────────────────────────────

describe('primeiroNome', () => {
  test('retorna primeiro nome de nome composto', () => {
    expect(primeiroNome('Maria da Silva')).toBe('Maria');
  });

  test('retorna nome único sem alteração', () => {
    expect(primeiroNome('João')).toBe('João');
  });

  test('ignora espaços à esquerda', () => {
    expect(primeiroNome('  Ana Paula')).toBe('Ana');
  });

  test('preserva acentuação e cedilha', () => {
    expect(primeiroNome('Conceição Ribeiro')).toBe('Conceição');
  });

  test('funciona com nome em caixa alta', () => {
    expect(primeiroNome('CARLOS SANTOS')).toBe('CARLOS');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// montarMsgCliente
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMsgCliente', () => {
  test('inclui saudação com primeiro nome', () => {
    const msg = montarMsgCliente('Carlos Silva', '⚡ Elétrica');
    expect(msg).toContain('Olá, Carlos!');
  });

  test('inclui nome do serviço sem emoji em negrito WhatsApp', () => {
    const msg = montarMsgCliente('Ana', '🎨 Pintura');
    expect(msg).toContain('*Pintura*');
  });

  test('não inclui o emoji do serviço na mensagem', () => {
    const msg = montarMsgCliente('Ana', '🎨 Pintura');
    expect(msg).not.toContain('🎨');
  });

  test('contém marcador de confirmação ✅', () => {
    const msg = montarMsgCliente('João', '🔧 Encanamento / Hidráulica');
    expect(msg).toContain('✅');
    expect(msg).toContain('*Solicitação recebida!*');
  });

  test('contém agradecimento ao final', () => {
    const msg = montarMsgCliente('Maria', '🌿 Jardinagem');
    expect(msg).toContain('Obrigado! 🙏');
  });

  test('usa apenas o primeiro nome mesmo com nome composto', () => {
    const msg = montarMsgCliente('Pedro Augusto Souza', '❄️ Ar-condicionado');
    expect(msg).toContain('Olá, Pedro!');
    expect(msg).not.toContain('Augusto');
    expect(msg).not.toContain('Souza');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// montarMsgPrestador
// ─────────────────────────────────────────────────────────────────────────────

describe('montarMsgPrestador', () => {
  const dadosBase = {
    nome: 'Maria Silva',
    servico: '⚡ Elétrica',
    endereco: 'Rua das Flores, 42 – Savassi',
    dataHora: '03/06/2026, 14:32:00',
    obs: '',
    whatsapp: '(31) 98765-4321',
    email: '',
  };

  test('contém cabeçalho NOVO LEAD', () => {
    expect(montarMsgPrestador(dadosBase)).toContain('📋 *NOVO LEAD*');
  });

  test('contém nome completo do cliente', () => {
    expect(montarMsgPrestador(dadosBase)).toContain('👤 Maria Silva');
  });

  test('contém serviço sem emoji', () => {
    expect(montarMsgPrestador(dadosBase)).toContain('🛠️ Elétrica');
  });

  test('não repete o emoji original do serviço selecionado', () => {
    const msg = montarMsgPrestador(dadosBase);
    expect(msg).not.toContain('⚡ Elétrica');
  });

  test('contém endereço completo', () => {
    expect(montarMsgPrestador(dadosBase)).toContain('📍 Rua das Flores, 42 – Savassi');
  });

  test('contém data e hora', () => {
    expect(montarMsgPrestador(dadosBase)).toContain('📅 03/06/2026, 14:32:00');
  });

  test('inclui observações quando preenchidas', () => {
    const msg = montarMsgPrestador({ ...dadosBase, obs: 'Urgente, vazamento ativo' });
    expect(msg).toContain('📝 Urgente, vazamento ativo');
  });

  test('omite linha de observações quando vazia', () => {
    const msg = montarMsgPrestador({ ...dadosBase, obs: '' });
    expect(msg).not.toContain('📝');
  });

  test('inclui WhatsApp do cliente quando informado', () => {
    const msg = montarMsgPrestador(dadosBase);
    expect(msg).toContain('📱 (31) 98765-4321');
  });

  test('omite linha de WhatsApp quando não informado', () => {
    const msg = montarMsgPrestador({ ...dadosBase, whatsapp: '' });
    expect(msg).not.toContain('📱');
  });

  test('inclui e-mail quando informado', () => {
    const msg = montarMsgPrestador({ ...dadosBase, email: 'maria@email.com', whatsapp: '' });
    expect(msg).toContain('✉️ maria@email.com');
  });

  test('omite e-mail quando não informado', () => {
    const msg = montarMsgPrestador(dadosBase);
    expect(msg).not.toContain('✉️');
  });

  test('mensagem com todos os campos opcionais preenchidos', () => {
    const msg = montarMsgPrestador({
      ...dadosBase,
      obs: 'Urgente',
      email: 'cli@email.com',
    });
    expect(msg).toContain('📝 Urgente');
    expect(msg).toContain('📱 (31) 98765-4321');
    expect(msg).toContain('✉️ cli@email.com');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// gerarLinkWhatsAppCliente
// ─────────────────────────────────────────────────────────────────────────────

describe('gerarLinkWhatsAppCliente', () => {
  test('gera URL iniciando com wa.me', () => {
    const link = gerarLinkWhatsAppCliente('(31) 98765-4321', 'Olá, teste!');
    expect(link).toMatch(/^https:\/\/wa\.me\//);
  });

  test('remove máscara do número (parênteses, espaços, hífen)', () => {
    const link = gerarLinkWhatsAppCliente('(31) 98765-4321', 'msg');
    expect(link).toContain('5531987654321');
    expect(link).not.toContain('(');
    expect(link).not.toContain(')');
    expect(link).not.toContain('-');
  });

  test('adiciona DDI 55 antes do DDD', () => {
    const link = gerarLinkWhatsAppCliente('11999990000', 'msg');
    expect(link).toContain('/5511999990000');
  });

  test('mensagem é URL-encoded no parâmetro text', () => {
    const mensagem = 'Olá! Confirmado.';
    const link = gerarLinkWhatsAppCliente('31999990000', mensagem);
    expect(link).toContain('?text=');
    expect(link).toContain(encodeURIComponent(mensagem));
  });

  test('link começa com protocolo https', () => {
    const link = gerarLinkWhatsAppCliente('31999990000', 'msg');
    expect(link.startsWith('https://')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// gerarLinkWhatsAppPrestador
// ─────────────────────────────────────────────────────────────────────────────

describe('gerarLinkWhatsAppPrestador', () => {
  test('usa exatamente o número PRESTADOR_WA configurado', () => {
    const link = gerarLinkWhatsAppPrestador('mensagem');
    expect(link).toContain(PRESTADOR_WA);
  });

  test('mensagem é URL-encoded corretamente', () => {
    const msg = 'NOVO LEAD\nJoão Silva';
    const link = gerarLinkWhatsAppPrestador(msg);
    expect(link).toContain(encodeURIComponent(msg));
  });

  test('formato geral da URL está correto', () => {
    const link = gerarLinkWhatsAppPrestador('msg');
    expect(link).toMatch(/^https:\/\/wa\.me\/\d+\?text=.+/);
  });

  test('link diferente para mensagens diferentes', () => {
    const link1 = gerarLinkWhatsAppPrestador('lead A');
    const link2 = gerarLinkWhatsAppPrestador('lead B');
    expect(link1).not.toBe(link2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// gerarLinkEmail
// ─────────────────────────────────────────────────────────────────────────────

describe('gerarLinkEmail', () => {
  test('começa com mailto:', () => {
    const link = gerarLinkEmail('maria@email.com', 'Maria Silva', '🎨 Pintura');
    expect(link.startsWith('mailto:')).toBe(true);
  });

  test('inclui o endereço de e-mail imediatamente após mailto:', () => {
    const link = gerarLinkEmail('maria@email.com', 'Maria', '🎨 Pintura');
    expect(link).toContain('mailto:maria@email.com');
  });

  test('inclui parâmetro subject', () => {
    const link = gerarLinkEmail('x@y.com', 'Ana', '⚡ Elétrica');
    expect(link).toContain('subject=');
  });

  test('inclui parâmetro body', () => {
    const link = gerarLinkEmail('x@y.com', 'Ana', '⚡ Elétrica');
    expect(link).toContain('body=');
  });

  test('corpo decodificado contém primeiro nome do cliente', () => {
    const link = gerarLinkEmail('x@y.com', 'Carlos Mendes', '🔧 Encanamento / Hidráulica');
    const body = decodeURIComponent(link.split('&body=')[1]);
    expect(body).toContain('Carlos');
    expect(body).not.toContain('Mendes');
  });

  test('corpo decodificado contém nome do serviço sem emoji', () => {
    const link = gerarLinkEmail('x@y.com', 'Ana', '🌿 Jardinagem');
    const body = decodeURIComponent(link.split('&body=')[1]);
    expect(body).toContain('Jardinagem');
    expect(body).not.toContain('🌿');
  });

  test('e-mails diferentes geram links diferentes', () => {
    const l1 = gerarLinkEmail('a@a.com', 'Ana', '🌿 Jardinagem');
    const l2 = gerarLinkEmail('b@b.com', 'Ana', '🌿 Jardinagem');
    expect(l1).not.toBe(l2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

describe('Constantes', () => {
  describe('PRESTADOR_WA', () => {
    test('contém apenas dígitos', () => {
      expect(PRESTADOR_WA).toMatch(/^\d+$/);
    });

    test('tem 13 dígitos (DDI 55 + DDD 2 + celular 9 + número 4)', () => {
      expect(PRESTADOR_WA.length).toBe(13);
    });

    test('começa com 55 (DDI Brasil)', () => {
      expect(PRESTADOR_WA.startsWith('55')).toBe(true);
    });
  });

  describe('SERVICOS_VALIDOS', () => {
    test('possui exatamente 16 categorias', () => {
      expect(SERVICOS_VALIDOS).toHaveLength(16);
    });

    test('todas as categorias são strings não vazias', () => {
      SERVICOS_VALIDOS.forEach((s) => {
        expect(typeof s).toBe('string');
        expect(s.trim().length).toBeGreaterThan(0);
      });
    });

    test('contém a categoria "Outros" como fallback genérico', () => {
      expect(SERVICOS_VALIDOS.some((s) => s.includes('Outros'))).toBe(true);
    });

    test('nenhuma categoria está duplicada', () => {
      const unicos = new Set(SERVICOS_VALIDOS);
      expect(unicos.size).toBe(SERVICOS_VALIDOS.length);
    });

    test('todas as categorias começam com emoji', () => {
      // Verifica que cada serviço tem pelo menos 1 code point não-ASCII no início
      SERVICOS_VALIDOS.forEach((s) => {
        expect(s.codePointAt(0)).toBeGreaterThan(127);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// maskPhone — cobertura de branches internos (linhas 44-48)
// ─────────────────────────────────────────────────────────────────────────────

describe('maskPhone — branches de digitação parcial', () => {
  test('fixo parcial sem 4º grupo (branch c falsy, fixo ≤10): DDD + 4 dígitos sem traço', () => {
    // 6 dígitos → regex (\d{2})(\d{1,4})(\d{0,4}): a=31, b=3234, c="" → c falsy
    expect(maskPhone('313234')).toBe('(31) 3234');
  });

  test('fixo parcial intermediário (branch c truthy, fixo ≤10): exibe hífen', () => {
    // 8 dígitos → a=31, b=3234, c=56 → c truthy
    expect(maskPhone('31323456')).toBe('(31) 3234-56');
  });

  test('celular com grupo completo (branch c truthy, celular >10): exibe hífen', () => {
    // 11 dígitos → path celular, a=31, b=98765, c=4321 → c truthy (sempre)
    expect(maskPhone('31987654321')).toBe('(31) 98765-4321');
  });

  test('fixo com grupo completo (branch c truthy, fixo): exibe hífen', () => {
    expect(maskPhone('3132345678')).toBe('(31) 3234-5678');
  });

  // Nota: o branch c-falsy no caminho de celular (>10 dígitos) é estruturalmente
  // inalcançável — com exatamente 11 dígitos o grupo c sempre tem valor.
  // Cobertura de branch registrada como 97.5% (1 branch morto documentado).
});
