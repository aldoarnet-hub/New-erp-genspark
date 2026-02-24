// ============================================================
// Validadores brasileiros (CPF, CNPJ, Telefone, Email, CEP)
// ============================================================

export function validarCPF(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(limpo)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(limpo[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (parseInt(limpo[9]) !== d1) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(limpo[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return parseInt(limpo[10]) === d2;
}

export function validarCNPJ(cnpj: string): boolean {
  const limpo = cnpj.replace(/\D/g, '');
  if (limpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(limpo)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(limpo[i]) * pesos1[i];
  let d1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(limpo[12]) !== d1) return false;
  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(limpo[i]) * pesos2[i];
  let d2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return parseInt(limpo[13]) === d2;
}

export function validarCpfCnpj(valor: string): boolean {
  const limpo = valor.replace(/\D/g, '');
  return limpo.length <= 11 ? validarCPF(limpo) : validarCNPJ(limpo);
}

export function limparDocumento(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarCPF(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '');
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatarCNPJ(cnpj: string): string {
  const limpo = cnpj.replace(/\D/g, '');
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function validarEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validarTelefone(tel: string): boolean {
  const limpo = tel.replace(/\D/g, '');
  return limpo.length >= 10 && limpo.length <= 11;
}

export function formatarTelefone(tel: string): string {
  const limpo = tel.replace(/\D/g, '');
  if (limpo.length === 11) return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (limpo.length === 10) return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return tel;
}

export function validarCEP(cep: string): boolean {
  const limpo = cep.replace(/\D/g, '');
  return /^\d{8}$/.test(limpo);
}

export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Consulta endereco pelo CEP via ViaCEP API
 */
export async function consultarCEP(cep: string): Promise<EnderecoViaCEP | null> {
  const limpo = cep.replace(/\D/g, '');
  if (!validarCEP(limpo)) return null;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    if (!response.ok) return null;
    const data = await response.json() as EnderecoViaCEP;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Valida inscricao estadual (validacao basica por UF)
 */
export function validarIE(ie: string, uf: string): boolean {
  const limpo = ie.replace(/\D/g, '');
  if (limpo === '' || ie.toUpperCase() === 'ISENTO') return true;
  // Validacao basica: verifica comprimento por UF
  const comprimentos: Record<string, number[]> = {
    AC: [13], AL: [9], AP: [9], AM: [9], BA: [8, 9], CE: [9], DF: [13],
    ES: [9], GO: [9], MA: [9], MT: [11], MS: [9], MG: [13], PA: [9],
    PB: [9], PR: [10], PE: [14], PI: [9], RJ: [8], RN: [9, 10], RS: [10],
    RO: [14], RR: [9], SC: [9], SP: [12], SE: [9], TO: [11],
  };
  const tamanhos = comprimentos[uf.toUpperCase()];
  if (!tamanhos) return false;
  return tamanhos.includes(limpo.length);
}

/**
 * Calcula cubagem de um produto (m3)
 */
export function calcularCubagem(alturaCm: number, larguraCm: number, profundidadeCm: number): number {
  return (alturaCm * larguraCm * profundidadeCm) / 1000000;
}
