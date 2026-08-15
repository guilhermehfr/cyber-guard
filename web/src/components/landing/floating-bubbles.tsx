interface BubbleConfig {
  id: number;
  size: number;
  left: string;
  top: string;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  color: "accent" | "primary";
}

const BUBBLES: BubbleConfig[] = [
  {
    id: 1,
    size: 220,
    left: "6%",
    top: "12%",
    opacity: 0.16,
    duration: 28,
    delay: -6,
    driftX: 40,
    driftY: -90,
    color: "accent",
  },
  {
    id: 2,
    size: 140,
    left: "78%",
    top: "8%",
    opacity: 0.18,
    duration: 24,
    delay: -14,
    driftX: -50,
    driftY: -70,
    color: "primary",
  },
  {
    id: 3,
    size: 300,
    left: "82%",
    top: "58%",
    opacity: 0.12,
    duration: 36,
    delay: -20,
    driftX: -60,
    driftY: -120,
    color: "accent",
  },
  {
    id: 4,
    size: 120,
    left: "14%",
    top: "66%",
    opacity: 0.2,
    duration: 22,
    delay: -10,
    driftX: 30,
    driftY: -60,
    color: "primary",
  },
  {
    id: 5,
    size: 180,
    left: "46%",
    top: "82%",
    opacity: 0.14,
    duration: 32,
    delay: -27,
    driftX: -30,
    driftY: -100,
    color: "accent",
  },
  {
    id: 6,
    size: 90,
    left: "34%",
    top: "10%",
    opacity: 0.22,
    duration: 20,
    delay: -8,
    driftX: 20,
    driftY: -50,
    color: "primary",
  },
];

export function FloatingBubbles({ subtle = false }: { subtle?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${
        subtle ? "opacity-60" : ""
      }`}
      aria-hidden="true"
    >
      {BUBBLES.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble absolute rounded-full will-change-transform"
          style={
            {
              width: bubble.size,
              height: bubble.size,
              left: bubble.left,
              top: bubble.top,
              opacity: bubble.opacity,
              background:
                bubble.color === "accent"
                  ? "radial-gradient(closest-side, var(--color-accent), transparent)"
                  : "radial-gradient(closest-side, var(--color-primary), transparent)",
              animation: `bubble-float ${bubble.duration}s ease-in-out ${bubble.delay}s infinite alternate`,
              "--bubble-drift-x": `${bubble.driftX}px`,
              "--bubble-drift-y": `${bubble.driftY}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
