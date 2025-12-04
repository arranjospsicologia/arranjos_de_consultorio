// Utilitários de validação

export const validarCPF = (cpf) => {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
};

export const formatarCPF = (cpf) => {
  if (!cpf) return '';
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarTelefone = (telefone) => {
  if (!telefone) return false;
  const numeros = telefone.replace(/[^\d]/g, '');
  return numeros.length >= 10 && numeros.length <= 11;
};

export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  const numeros = telefone.replace(/[^\d]/g, '');

  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
};

export const validarCampoObrigatorio = (valor) => {
  return valor && valor.toString().trim().length > 0;
};

export const validarValorMonetario = (valor) => {
  if (valor === null || valor === undefined || valor === '') return false;
  const numero = parseFloat(valor);
  return !isNaN(numero) && numero >= 0;
};

export const validarData = (data) => {
  if (!data) return false;
  const dateObj = new Date(data);
  return dateObj instanceof Date && !isNaN(dateObj);
};
