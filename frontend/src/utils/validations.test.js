import {
  validarCPF,
  formatarCPF,
  validarEmail,
  validarTelefone,
  formatarTelefone,
  validarCampoObrigatorio,
  validarValorMonetario,
  validarData
} from './validations';

describe('Validação de CPF', () => {
  test('deve validar CPF válido', () => {
    expect(validarCPF('123.456.789-09')).toBe(true);
  });

  test('deve rejeitar CPF com todos os dígitos iguais', () => {
    expect(validarCPF('111.111.111-11')).toBe(false);
    expect(validarCPF('000.000.000-00')).toBe(false);
  });

  test('deve rejeitar CPF com menos de 11 dígitos', () => {
    expect(validarCPF('123.456.789')).toBe(false);
  });

  test('deve rejeitar CPF vazio ou nulo', () => {
    expect(validarCPF('')).toBe(false);
    expect(validarCPF(null)).toBe(false);
  });
});

describe('Formatação de CPF', () => {
  test('deve formatar CPF corretamente', () => {
    expect(formatarCPF('12345678909')).toBe('123.456.789-09');
  });

  test('deve retornar string vazia para CPF vazio', () => {
    expect(formatarCPF('')).toBe('');
    expect(formatarCPF(null)).toBe('');
  });
});

describe('Validação de Email', () => {
  test('deve validar email válido', () => {
    expect(validarEmail('teste@exemplo.com')).toBe(true);
    expect(validarEmail('usuario.nome@dominio.com.br')).toBe(true);
  });

  test('deve rejeitar email inválido', () => {
    expect(validarEmail('emailinvalido')).toBe(false);
    expect(validarEmail('email@')).toBe(false);
    expect(validarEmail('@dominio.com')).toBe(false);
  });
});

describe('Validação de Telefone', () => {
  test('deve validar telefone com 10 dígitos', () => {
    expect(validarTelefone('(11) 1234-5678')).toBe(true);
  });

  test('deve validar telefone com 11 dígitos', () => {
    expect(validarTelefone('(11) 91234-5678')).toBe(true);
  });

  test('deve rejeitar telefone com menos de 10 dígitos', () => {
    expect(validarTelefone('123456789')).toBe(false);
  });

  test('deve rejeitar telefone vazio', () => {
    expect(validarTelefone('')).toBe(false);
    expect(validarTelefone(null)).toBe(false);
  });
});

describe('Formatação de Telefone', () => {
  test('deve formatar telefone de 11 dígitos', () => {
    expect(formatarTelefone('11912345678')).toBe('(11) 91234-5678');
  });

  test('deve formatar telefone de 10 dígitos', () => {
    expect(formatarTelefone('1112345678')).toBe('(11) 1234-5678');
  });

  test('deve retornar string vazia para telefone vazio', () => {
    expect(formatarTelefone('')).toBe('');
    expect(formatarTelefone(null)).toBe('');
  });
});

describe('Validação de Campo Obrigatório', () => {
  test('deve validar campo preenchido', () => {
    expect(validarCampoObrigatorio('texto')).toBe(true);
    expect(validarCampoObrigatorio(123)).toBe(true);
  });

  test('deve rejeitar campo vazio', () => {
    expect(validarCampoObrigatorio('')).toBeFalsy();
    expect(validarCampoObrigatorio('   ')).toBeFalsy();
    expect(validarCampoObrigatorio(null)).toBeFalsy();
    expect(validarCampoObrigatorio(undefined)).toBeFalsy();
  });
});

describe('Validação de Valor Monetário', () => {
  test('deve validar valor monetário válido', () => {
    expect(validarValorMonetario(100)).toBe(true);
    expect(validarValorMonetario('100.50')).toBe(true);
    expect(validarValorMonetario(0)).toBe(true);
  });

  test('deve rejeitar valor negativo', () => {
    expect(validarValorMonetario(-10)).toBe(false);
  });

  test('deve rejeitar valor não numérico', () => {
    expect(validarValorMonetario('abc')).toBe(false);
    expect(validarValorMonetario('')).toBe(false);
    expect(validarValorMonetario(null)).toBe(false);
  });
});

describe('Validação de Data', () => {
  test('deve validar data válida', () => {
    expect(validarData('2023-01-01')).toBe(true);
    expect(validarData(new Date())).toBe(true);
  });

  test('deve rejeitar data inválida', () => {
    expect(validarData('data-invalida')).toBe(false);
    expect(validarData('')).toBe(false);
    expect(validarData(null)).toBe(false);
  });
});
