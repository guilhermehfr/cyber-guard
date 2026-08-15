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
    title: "Phishing Basics",
    description: "Learn to recognize phishing attempts and protect your credentials.",
    difficulty: "EASY",
    points: 50,
  },
  {
    id: "clmissionseed0000002",
    title: "Password Hygiene",
    description: "Build stronger password habits and reduce credential risk.",
    difficulty: "MEDIUM",
    points: 100,
  },
  {
    id: "clmissionseed0000003",
    title: "Advanced Threats",
    description: "Understand advanced attack techniques and how to counter them.",
    difficulty: "HARD",
    points: 150,
  },
];

export const QUESTIONS_BY_DIFFICULTY: Record<Difficulty, SeedQuestion[]> = {
  EASY: [
    {
      id: "clquestionseed0000001",
      prompt:
        "You receive an unexpected email from your bank asking you to click a link and confirm your password. What is the safest action?",
      answers: [
        {
          id: "clanswerseed0000001",
          text: "Do not click the link; report the email to your security team.",
          isCorrect: true,
        },
        {
          id: "clanswerseed0000002",
          text: "Click the link quickly so your account is not blocked.",
          isCorrect: false,
        },
      ],
    },
    {
      id: "clquestionseed0000002",
      prompt:
        "While checking an email link, the login page looks identical to your company portal. Which detail best suggests the page is a fake?",
      answers: [
        {
          id: "clanswerseed0000003",
          text: "The page address uses a look-alike domain instead of the official one.",
          isCorrect: true,
        },
        {
          id: "clanswerseed0000004",
          text: "The page has a modern design and a clear company logo.",
          isCorrect: false,
        },
      ],
    },
  ],
  MEDIUM: [
    {
      id: "clquestionseed0000003",
      prompt: "Which password is the most resistant to offline cracking?",
      answers: [
        {
          id: "clanswerseed0000005",
          text: "A long random passphrase that is not reused elsewhere.",
          isCorrect: true,
        },
        {
          id: "clanswerseed0000006",
          text: "Your pet's name followed by your birth year.",
          isCorrect: false,
        },
        {
          id: "clanswerseed0000007",
          text: "A common word with one digit added at the end.",
          isCorrect: false,
        },
      ],
    },
    {
      id: "clquestionseed0000004",
      prompt: "What is the main reason password managers reduce security risk?",
      answers: [
        {
          id: "clanswerseed0000008",
          text: "They generate and store a unique strong password for every site.",
          isCorrect: true,
        },
        {
          id: "clanswerseed0000009",
          text: "They keep all of your passwords in a single online file.",
          isCorrect: false,
        },
        {
          id: "clanswerseed0000010",
          text: "They allow you to reuse one strong password everywhere safely.",
          isCorrect: false,
        },
      ],
    },
  ],
  HARD: [
    {
      id: "clquestionseed0000005",
      prompt:
        "During a code review you find a SQL query built by concatenating raw user input. Which attack is most directly enabled?",
      answers: [
        {
          id: "clanswerseed0000011",
          text: "SQL injection.",
          isCorrect: true,
        },
        {
          id: "clanswerseed0000012",
          text: "Cross-site scripting.",
          isCorrect: false,
        },
        {
          id: "clanswerseed0000013",
          text: "Denial of service.",
          isCorrect: false,
        },
        {
          id: "clanswerseed0000014",
          text: "Session fixation.",
          isCorrect: false,
        },
      ],
    },
    {
      id: "clquestionseed0000006",
      prompt:
        "A phishing email contains a link to https://bank.example.com.evil.net/login. What does this indicate?",
      answers: [
        {
          id: "clanswerseed0000015",
          text: "The real domain is evil.net, so the message is likely malicious.",
          isCorrect: true,
        },
        {
          id: "clanswerseed0000016",
          text: "The link is encrypted with HTTPS, so it is safe to open.",
          isCorrect: false,
        },
        {
          id: "clanswerseed0000017",
          text: "It is the official bank login subdomain.",
          isCorrect: false,
        },
        {
          id: "clanswerseed0000018",
          text: "HTTPS proves the site was verified as the official bank.",
          isCorrect: false,
        },
      ],
    },
  ],
};