import type { Difficulty } from "@cyber/contracts";

export interface SeedAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SeedQuestion {
  id: string;
  prompt: string;
  answers: SeedAnswer[];
}

export interface SeedMission {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
}

export const MISSIONS: SeedMission[] = [
  {
    id: "clmissionseed0000001",
    title: "Fundamentos de Phishing",
    description: "Aprenda a reconhecer tentativas de phishing e a proteger suas credenciais.",
    difficulty: "EASY",
    points: 50,
  },
  {
    id: "clmissionseed0000002",
    title: "Higiene de Senhas",
    description:
      "Crie hábitos de senha mais fortes e reduza o risco de comprometimento das credenciais.",
    difficulty: "MEDIUM",
    points: 100,
  },
  {
    id: "clmissionseed0000003",
    title: "Ameaças Avançadas",
    description: "Entenda técnicas avançadas de ataque e como combatê-las.",
    difficulty: "HARD",
    points: 150,
  },
  {
    id: "clmissionseed0000004",
    title: "Navegação Segura",
    description: "Identifique sites, links e downloads arriscados antes que se tornem um problema.",
    difficulty: "EASY",
    points: 50,
  },
  {
    id: "clmissionseed0000005",
    title: "Proteção de Conta",
    description: "Fortaleça a autenticação e o manuseio de informações sensíveis.",
    difficulty: "MEDIUM",
    points: 100,
  },
  {
    id: "clmissionseed0000006",
    title: "Segurança de Aplicações",
    description:
      "Aplique princípios de codificação segura e controle de acesso para defender aplicações.",
    difficulty: "HARD",
    points: 150,
  },
];

// Each difficulty holds one question set per mission of that difficulty, in the
// same order the missions are created. Every set contains exactly four questions.
export const QUESTIONS_BY_DIFFICULTY: Record<Difficulty, SeedQuestion[][]> = {
  EASY: [
    [
      {
        id: "clquestionseed0000001",
        prompt:
          "Você recebe um e-mail inesperado do seu banco pedindo para clicar em um link e confirmar sua senha. Qual é a ação mais segura?",
        answers: [
          {
            id: "clanswerseed0000001",
            text: "Não clicar no link e reportar o e-mail à equipe de segurança.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000002",
            text: "Clicar no link rapidamente para que sua conta não seja bloqueada.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000002",
        prompt:
          "Ao conferir um link de e-mail, a página de login parece idêntica ao portal da sua empresa. Qual detalhe sugere melhor que a página é falsa?",
        answers: [
          {
            id: "clanswerseed0000003",
            text: "O endereço da página usa um domínio parecido em vez do oficial.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000004",
            text: "A página tem um design moderno e um logotipo claro da empresa.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000007",
        prompt:
          'Um colega liga pedindo sua senha para "corrigir um problema no sistema". O que você deve fazer?',
        answers: [
          {
            id: "clanswerseed0000019",
            text: "Recusar; funcionários legítimos nunca pedem sua senha.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000020",
            text: "Compartilhar para que o sistema seja corrigido rapidamente.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000008",
        prompt:
          "Qual tipo de anexo é o mais arriscado de abrir vindo de um remetente desconhecido?",
        answers: [
          {
            id: "clanswerseed0000021",
            text: "Um arquivo .zip ou .exe inesperado.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000022",
            text: "Um documento .txt de texto simples.",
            isCorrect: false,
          },
        ],
      },
    ],
    [
      {
        id: "clquestionseed0000013",
        prompt:
          "Seu navegador avisa que o certificado de um site é inválido. O que isso significa?",
        answers: [
          {
            id: "clanswerseed0000023",
            text: "A identidade do site não pode ser verificada, então você não deve inserir dados sensíveis.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000024",
            text: "O certificado é apenas cosmético e seguro de ignorar.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000014",
        prompt:
          "A conta de rede social de um amigo envia um link estranho com uma mensagem urgente. Qual é a ação mais segura?",
        answers: [
          {
            id: "clanswerseed0000025",
            text: "Tratar como suspeito; a conta pode estar comprometida.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000026",
            text: "Clicar imediatamente porque veio de um amigo.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000015",
        prompt:
          "Qual é o sinal mais forte de que uma rede Wi-Fi é segura para usar em operações bancárias?",
        answers: [
          {
            id: "clanswerseed0000027",
            text: "Você confia no dono da rede e ela exige uma senha forte.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000028",
            text: 'O nome dela contém "grátis" ou "público".',
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000016",
        prompt:
          "Pedem que você insira suas credenciais em uma página acessada por um link de e-mail. Qual é o mais seguro?",
        answers: [
          {
            id: "clanswerseed0000029",
            text: "Abrir o navegador e acessar o site diretamente em vez disso.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000030",
            text: "Usar o link, desde que a página mostre o logotipo da empresa.",
            isCorrect: false,
          },
        ],
      },
    ],
  ],
  MEDIUM: [
    [
      {
        id: "clquestionseed0000003",
        prompt: "Qual senha é a mais resistente a quebra offline?",
        answers: [
          {
            id: "clanswerseed0000005",
            text: "Uma frase aleatória longa que não é reutilizada em outros lugares.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000006",
            text: "O nome do seu animal de estimação seguido do seu ano de nascimento.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000007",
            text: "Uma palavra comum com um dígito adicionado no final.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000004",
        prompt:
          "Qual é o principal motivo pelo qual os gerenciadores de senha reduzem o risco de segurança?",
        answers: [
          {
            id: "clanswerseed0000008",
            text: "Eles geram e armazenam uma senha forte e única para cada site.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000009",
            text: "Eles mantêm todas as suas senhas em um único arquivo online.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000010",
            text: "Eles permitem reutilizar uma senha forte em todos os lugares com segurança.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000009",
        prompt: "Por que a autenticação de dois fatores (2FA) é valiosa mesmo com uma senha forte?",
        answers: [
          {
            id: "clanswerseed0000031",
            text: "Ela exige uma segunda prova, então apenas uma senha vazada não é suficiente.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000032",
            text: "Ela substitui totalmente a necessidade de uma senha.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000033",
            text: "Ela torna as senhas opcionais em todos os sistemas.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000010",
        prompt: "Qual é a maneira mais segura de compartilhar um documento sensível com um colega?",
        answers: [
          {
            id: "clanswerseed0000034",
            text: "Usar a ferramenta segura de compartilhamento de arquivos aprovada pela organização.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000035",
            text: "Enviar por e-mail como anexo para a sua conta pessoal primeiro.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000036",
            text: "Enviar por um serviço público de mensagens.",
            isCorrect: false,
          },
        ],
      },
    ],
    [
      {
        id: "clquestionseed0000017",
        prompt: "Qual prática de senha protege melhor contra ataques de credential stuffing?",
        answers: [
          {
            id: "clanswerseed0000037",
            text: "Usar uma senha diferente e única para cada conta.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000038",
            text: "Usar uma senha forte em todos os lugares.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000039",
            text: "Adicionar o mesmo sufixo a uma senha base em cada site.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000018",
        prompt: "O que você deve verificar antes de instalar uma nova extensão de navegador?",
        answers: [
          {
            id: "clanswerseed0000040",
            text: "O publicador, as permissões e as avaliações.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000041",
            text: "Apenas o número de downloads.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000042",
            text: "Se foi o primeiro resultado da busca.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000019",
        prompt:
          'Um e-mail da TI pede que você verifique sua caixa de correio porque ela está "acima da cota". Qual pista indica um phishing?',
        answers: [
          {
            id: "clanswerseed0000043",
            text: "O link aponta para um domínio desconhecido em vez do da empresa.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000044",
            text: "A mensagem usa o seu nome real.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000045",
            text: "A mensagem contém o logotipo da empresa.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000020",
        prompt: "Quando você deve bloquear a tela?",
        answers: [
          {
            id: "clanswerseed0000046",
            text: "Sempre que se afastar, mesmo que brevemente, especialmente em espaços compartilhados.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000047",
            text: "Somente quando sair do prédio.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000048",
            text: "Somente ao usar um computador compartilhado.",
            isCorrect: false,
          },
        ],
      },
    ],
  ],
  HARD: [
    [
      {
        id: "clquestionseed0000005",
        prompt:
          "Durante uma revisão de código você encontra uma consulta SQL construída pela concatenação direta de entrada do usuário. Qual ataque é habilitado mais diretamente?",
        answers: [
          {
            id: "clanswerseed0000011",
            text: "Injeção de SQL.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000012",
            text: "Scripting entre sites (XSS).",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000013",
            text: "Negação de serviço.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000014",
            text: "Fixação de sessão.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000006",
        prompt:
          "Um e-mail de phishing contém um link para https://bank.example.com.evil.net/login. O que isso indica?",
        answers: [
          {
            id: "clanswerseed0000015",
            text: "O domínio real é evil.net, então a mensagem é provavelmente maliciosa.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000016",
            text: "O link é criptografado com HTTPS, então é seguro abrir.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000017",
            text: "É o subdomínio oficial de login do banco.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000018",
            text: "O HTTPS prova que o site foi verificado como o banco oficial.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000011",
        prompt: "Qual é a principal defesa contra scripting entre sites (XSS) armazenado?",
        answers: [
          {
            id: "clanswerseed0000049",
            text: "Codificação de saída sensível ao contexto e validação de entrada.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000050",
            text: "Desabilitar o JavaScript no navegador.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000051",
            text: "Usar HTTPS no servidor.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000052",
            text: "Renomear cookies sensíveis.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000012",
        prompt:
          "Qual ataque é habilitado mais diretamente ao refletir um valor de cabeçalho fornecido pelo usuário na resposta sem validação?",
        answers: [
          {
            id: "clanswerseed0000053",
            text: "Injeção de cabeçalho de resposta HTTP.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000054",
            text: "Injeção de SQL.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000055",
            text: "Traversal de diretório.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000056",
            text: "Negação de serviço.",
            isCorrect: false,
          },
        ],
      },
    ],
    [
      {
        id: "clquestionseed0000021",
        prompt: "Qual prática protege melhor contra um ataque de fixação de sessão?",
        answers: [
          {
            id: "clanswerseed0000057",
            text: "Gerar um novo identificador de sessão após a autenticação.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000058",
            text: "Aceitar qualquer id de sessão fornecido pelo cliente.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000059",
            text: "Armazenar o id de sessão em um parâmetro de URL.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000060",
            text: "Manter um longo tempo de vida de sessão.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000022",
        prompt: "Qual é a principal diferença entre autenticação e autorização?",
        answers: [
          {
            id: "clanswerseed0000061",
            text: "A autenticação verifica quem você é; a autorização decide o que você pode fazer.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000062",
            text: "São termos intercambiáveis para controle de acesso.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000063",
            text: "A autorização verifica a identidade e a autenticação concede permissões.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000064",
            text: "Ambas se aplicam apenas a endpoints públicos.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000023",
        prompt: "Por que um ataque de temporização é perigoso ao comparar valores secretos?",
        answers: [
          {
            id: "clanswerseed0000065",
            text: "O tempo de comparação pode revelar quantos caracteres iniciais corresponderam.",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000066",
            text: "Ele faz o servidor travar.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000067",
            text: "Ele vaza todo o segredo no corpo da resposta.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000068",
            text: "Ele afeta apenas algoritmos de hash.",
            isCorrect: false,
          },
        ],
      },
      {
        id: "clquestionseed0000024",
        prompt: "Qual defesa mais reduz o impacto de um servidor comprometido?",
        answers: [
          {
            id: "clanswerseed0000069",
            text: "Menor privilégio e defesa em profundidade (acesso mínimo e criptografia em repouso).",
            isCorrect: true,
          },
          {
            id: "clanswerseed0000070",
            text: "Confiando em uma única regra de firewall.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000071",
            text: "Ocultando o endereço IP do servidor.",
            isCorrect: false,
          },
          {
            id: "clanswerseed0000072",
            text: "Usando uma conta de administrador padrão com senha complexa.",
            isCorrect: false,
          },
        ],
      },
    ],
  ],
};
