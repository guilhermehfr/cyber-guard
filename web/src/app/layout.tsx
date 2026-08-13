import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CyberGuard - Cybersecurity Awareness",
  description:
    "A gamified cybersecurity awareness experience where players learn, complete missions, earn points, and compete on a leaderboard.",
  keywords: ["cybersecurity", "security awareness", "gamification", "phishing", "cyberguard"],
  authors: [{ name: "Guilherme Henrique Fernandes Rodrigues" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "CyberGuard - Cybersecurity Awareness",
    description:
      "Learn cybersecurity through interactive challenges and compete on the leaderboard.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
