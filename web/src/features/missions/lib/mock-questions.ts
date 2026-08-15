import type { Difficulty } from "@/features/missions/types";

export interface MockAnswer {
  id: string;
  text: string;
}

export interface MockQuestion {
  id: string;
  text: string;
  context?: string;
  answers: MockAnswer[];
  correctAnswerId: string;
}

export const MOCK_QUESTIONS: Record<Difficulty, MockQuestion[]> = {
  EASY: [
    {
      id: "easy-1",
      text: "O que é phishing?",
      answers: [
        {
          id: "a",
          text: "Uma técnica de engenharia social que tenta enganar a vítima para roubar dados",
        },
        { id: "b", text: "Um tipo de firewall que bloqueia ataques" },
        { id: "c", text: "Um software gratuito de proteção do navegador" },
        { id: "d", text: "Um protocolo usado para criptografar e-mails" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "easy-2",
      text: "Qual é a melhor prática para criar senhas?",
      answers: [
        { id: "a", text: "Usar a mesma senha em todos os serviços para facilitar" },
        { id: "b", text: "Usar senhas longas e únicas para cada serviço" },
        { id: "c", text: "Guardar as senhas anotadas próximas ao computador" },
        { id: "d", text: "Usar apenas o nome de usuário como senha" },
      ],
      correctAnswerId: "b",
    },
  ],
  MEDIUM: [
    {
      id: "medium-1",
      text: "O que a autenticação de dois fatores (2FA) adiciona ao processo de login?",
      answers: [
        { id: "a", text: "Uma camada extra de verificação além da senha" },
        { id: "b", text: "Um antivírus embutido na conta" },
        { id: "c", text: "Conexão prioritária com o servidor" },
        { id: "d", text: "Backup automático das senhas salvas" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "medium-2",
      text: "Qual cenário caracteriza um ataque Man-in-the-Middle?",
      context: "Um invasor se posiciona entre duas partes que acreditam conversar diretamente.",
      answers: [
        { id: "a", text: "O invasor intercepta e possivelmente altera a comunicação" },
        { id: "b", text: "O invasor envia e-mails falsos em massa" },
        { id: "c", text: "O invasor força o servidor a reiniciar" },
        { id: "d", text: "O invasor adivinha senhas por tentativa e erro" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "medium-3",
      text: "O que o HTTPS garante em uma conexão com um site?",
      answers: [
        { id: "a", text: "Que o site não possui vulnerabilidades" },
        { id: "b", text: "Criptografia dos dados trafegados entre navegador e servidor" },
        { id: "c", text: "Que o servidor nunca fica fora do ar" },
        { id: "d", text: "Que o site é oficialmente gratuito" },
      ],
      correctAnswerId: "b",
    },
  ],
  HARD: [
    {
      id: "hard-1",
      text: "Como um ataque de SQL Injection normalmente explora uma aplicação?",
      answers: [
        { id: "a", text: "Injetando comandos SQL maliciosos em campos de entrada não validados" },
        { id: "b", text: "Enviando requisições em volume para derrubar o serviço" },
        { id: "c", text: "Alterando o DNS do domínio do serviço" },
        { id: "d", text: "Interceptando certificados TLS da conexão" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "hard-2",
      text: "Qual é a defesa mais eficaz contra ataques de força bruta em autenticação?",
      answers: [
        { id: "a", text: "Limitar tentativas e exigir senhas de alta entropia" },
        { id: "b", text: "Remover o botão de login da interface" },
        { id: "c", text: "Usar um firewall de rede genérico" },
        { id: "d", text: "Aumentar o tempo de timeout das sessões" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "hard-3",
      text: "Qual é a principal diferença entre criptografia simétrica e assimétrica?",
      answers: [
        {
          id: "a",
          text: "A simétrica usa a mesma chave para cifrar e decifrar; a assimétrica usa um par de chaves",
        },
        { id: "b", text: "A simétrica é sempre mais segura que a assimétrica" },
        { id: "c", text: "A assimétrica não pode ser usada em redes públicas" },
        { id: "d", text: "A simétrica exige hardware dedicado para funcionar" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "hard-4",
      text: "O que é um honeypot em segurança ofensiva e defensiva?",
      answers: [
        { id: "a", text: "Um sistema isca criado para atrair e estudar ataques" },
        { id: "b", text: "Uma senha fraca proposital usada como armadilha" },
        { id: "c", text: "Um backup criptografado do banco de dados" },
        { id: "d", text: "Um certificado digital autoassinado" },
      ],
      correctAnswerId: "a",
    },
  ],
};

export function getMockQuestions(difficulty: Difficulty): MockQuestion[] {
  return MOCK_QUESTIONS[difficulty];
}
