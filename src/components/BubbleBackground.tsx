import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

const BubbleBackground = ({ count = 12 }: { count?: number }) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const b: Bubble[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 8,
      delay: Math.random() * 8,
      duration: 5 + Math.random() * 6,
    }));
    setBubbles(b);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full bg-copper/10 dark:bg-copper/5"
          style={{
            left: `${b.left}%`,
            bottom: "-20px",
            width: `${b.size}px`,
            height: `${b.size}px`,
            animation: `bubble-rise ${b.duration}s ease-in ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

export default BubbleBackground;
