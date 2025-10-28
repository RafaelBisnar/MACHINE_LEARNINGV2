import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: "red" | "white";
}

export default function ParticlesBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 5,
          color: Math.random() > 0.5 ? "red" : "white",
        });
      }

      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="particles-background">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`particle ${particle.color}`}
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation:
              Math.random() > 0.5
                ? `float-up-left ${particle.duration}s linear ${particle.delay}s infinite`
                : `float-up-right ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
