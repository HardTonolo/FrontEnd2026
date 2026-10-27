// Validação de CPF
export const validarCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto >= 10 ? 0 : resto;
  
  if (parseInt(cpf.charAt(9)) !== digitoVerificador1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto >= 10 ? 0 : resto;
  
  return parseInt(cpf.charAt(10)) === digitoVerificador2;
};

// Validação de email
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Função para avaliar força da senha
export const avaliarForcaSenha = (senha: string): {
  forca: 'fraca' | 'media' | 'forte';
  mensagem: string;
  pontos: number;
} => {
  let pontos = 0;
  
  // Critério 1: Comprimento mínimo de 6 caracteres
  if (senha.length >= 6) pontos++;
  if (senha.length >= 10) pontos++;
  
  // Critério 2: Contém letras maiúsculas
  if (/[A-Z]/.test(senha)) pontos++;
  
  // Critério 3: Contém letras minúsculas
  if (/[a-z]/.test(senha)) pontos++;
  
  // Critério 4: Contém números
  if (/[0-9]/.test(senha)) pontos++;
  
  // Critério 5: Contém caracteres especiais
  if (/[!@#$%^&*(),.?":{}|<>]/.test(senha)) pontos++;
  
  // Determinar força baseada nos pontos
  let forca: 'fraca' | 'media' | 'forte';
  let mensagem: string;
  
  if (pontos <= 2) {
    forca = 'fraca';
    mensagem = 'Senha muito fraca. Use pelo menos 6 caracteres, incluindo letras maiúsculas, números e caracteres especiais.';
  } else if (pontos <= 4) {
    forca = 'media';
    mensagem = 'Senha média. Para uma senha forte, adicione caracteres especiais e combine maiúsculas/minúsculas.';
  } else {
    forca = 'forte';
    mensagem = 'Senha forte!';
  }
  
  return { forca, mensagem, pontos };
};

// Formatar CPF (adicionar pontos e traço)
export const formatarCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

// Formatar telefone (com limite de 11 dígitos)
export const formatarTelefone = (telefone: string): string => {
  // Remove tudo que não é número
  let numeros = telefone.replace(/\D/g, '');
  
  // Limita a 11 dígitos (máximo para telefone brasileiro)
  numeros = numeros.slice(0, 11);
  
  if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6, 10)}`;
  } else if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  } else if (numeros.length > 0) {
    return numeros;
  }
  
  return '';
};

// Formatar valor para moeda brasileira
export const formatarMoeda = (valor: number | string): string => {
  // Se for string, converte para número
  let valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
  
  // Se não for um número válido, retorna vazio
  if (isNaN(valorNumerico)) return '';
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valorNumerico);
};

// Converter string de moeda para número (remove R$ e formatação)
export const moedaParaNumero = (valorFormatado: string): number => {
  // Remove tudo que não é dígito ou vírgula
  let valorLimpo = valorFormatado.replace(/[^\d,]/g, '');
  
  // Substitui vírgula por ponto
  valorLimpo = valorLimpo.replace(',', '.');
  
  // Converte para número
  const numero = parseFloat(valorLimpo);
  
  return isNaN(numero) ? 0 : numero;
};

// Função para formatar enquanto digita
export const formatarMoedaDigitacao = (valor: string): string => {
  // Remove tudo que não é número
  let numeros = valor.replace(/\D/g, '');
  
  if (numeros.length === 0) return '';
  
  // Converte para número (centavos)
  const numero = parseInt(numeros, 10) / 100;
  
  // Formata como moeda
  return formatarMoeda(numero);
};

// Formatar placa
export const formatarPlaca = (placa: string): string => {
  placa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (placa.length === 7) {
    return `${placa.slice(0, 3)}-${placa.slice(3, 7)}`;
  } else if (placa.length === 8) {
    return `${placa.slice(0, 3)}${placa.slice(3, 4)}${placa.slice(4, 5)}${placa.slice(5, 7)}`;
  }
  
  return placa;
};