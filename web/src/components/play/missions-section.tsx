import { Shield, Skull, Swords } from "lucide-react";

import { MissionDifficultyCard } from "./mission-difficulty-card";

export function MissionsSection() {
  return (
    <section aria-labelledby="missions-heading" className="flex flex-col gap-4">
      <h2
        id="missions-heading"
        className="font-display text-lg font-bold tracking-wide text-foreground"
      >
        Escolha uma dificuldade
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <MissionDifficultyCard
          title="FÁCIL"
          description="Perfeito para quem está começando. Missões simples para ganhar confiança."
          icon={Shield}
          variant="easy"
        />
        <MissionDifficultyCard
          title="MÉDIO"
          description="Para quem já domina o básico e quer um desafio de verdade."
          icon={Swords}
          variant="medium"
        />
        <MissionDifficultyCard
          title="DIFÍCIL"
          description="Somente para os melhores. Cenários avançados de segurança."
          icon={Skull}
          variant="hard"
        />
      </div>
    </section>
  );
}
