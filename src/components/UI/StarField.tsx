import { useEffect, useRef } from 'react';

interface StarConfig {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  color: string;
  speed: number;
  phase: number;
  kind: 'tiny' | 'small' | 'medium' | 'large';
}

const STAR_COLORS = [
  { color: '#ffffff', weight: 0.7 },
  { color: '#c8e0ff', weight: 0.12 },
  { color: '#ffe8c0', weight: 0.1 },
  { color: '#ffc8c8', weight: 0.05 },
  { color: '#d0c8ff', weight: 0.03 },
] as const;

const pickWeightedColor = (roll: number) => {
  let acc = 0;
  for (const item of STAR_COLORS) {
    acc += item.weight;
    if (roll <= acc) {
      return item.color;
    }
  }
  return '#ffffff';
};

const createStars = (width: number, height: number, mobileCount: number, desktopCount: number): StarConfig[] => {
  const stars: StarConfig[] = [];
  const total = width < 900 ? mobileCount : desktopCount;

  for (let i = 0; i < total; i += 1) {
    const distributionRoll = Math.random();
    let kind: StarConfig['kind'];
    let radius: number;
    let opacity: number;

    if (distributionRoll < 0.6) {
      kind = 'tiny';
      radius = 0.2 + Math.random() * 0.3;
      opacity = 0.3 + Math.random() * 0.3;
    } else if (distributionRoll < 0.9) {
      kind = 'small';
      radius = 0.5 + Math.random() * 0.7;
      opacity = 0.5 + Math.random() * 0.35;
    } else if (distributionRoll < 0.98) {
      kind = 'medium';
      radius = 1.2 + Math.random() * 0.8;
      opacity = 0.7 + Math.random() * 0.3;
    } else {
      kind = 'large';
      radius = 2 + Math.random();
      opacity = 0.9 + Math.random() * 0.1;
    }

    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius,
      baseOpacity: opacity,
      color: pickWeightedColor(Math.random()),
      speed: 0.008 + Math.random() * 0.017,
      phase: Math.random() * Math.PI * 2,
      kind,
    });
  }

  return stars;
};

interface StarFieldProps {
  desktopCount?: number;
  mobileCount?: number;
}

const StarField = ({ desktopCount = 1400, mobileCount = 760 }: StarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<StarConfig[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const drawFrame = (time: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        const pulse = (Math.sin(time * star.speed + star.phase) + 1) / 2;
        const opacity = star.baseOpacity * (0.65 + pulse * 0.45);
        let radius = star.radius;

        if (star.kind === 'large') {
          radius *= 0.85 + pulse * 0.3;
        }

        context.globalAlpha = opacity;
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x, star.y, radius, 0, Math.PI * 2);
        context.fill();

        if (star.kind === 'medium' || star.kind === 'large') {
          const halo = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, radius * 5);
          halo.addColorStop(0, `${star.color}66`);
          halo.addColorStop(1, 'transparent');
          context.globalAlpha = opacity * (star.kind === 'large' ? 0.65 : 0.35);
          context.fillStyle = halo;
          context.beginPath();
          context.arc(star.x, star.y, radius * 5, 0, Math.PI * 2);
          context.fill();
        }

        if (star.kind === 'large') {
          const spikeLen = star.radius * 4 + 4;

          context.beginPath();
          context.moveTo(star.x - spikeLen, star.y);
          context.lineTo(star.x + spikeLen, star.y);
          context.strokeStyle = star.color;
          context.globalAlpha = opacity * 0.25;
          context.lineWidth = 0.6;
          context.stroke();

          context.beginPath();
          context.moveTo(star.x, star.y - spikeLen);
          context.lineTo(star.x, star.y + spikeLen);
          context.stroke();
        }
      }
    };

    const loop = (time: number) => {
      drawFrame(time);
      frameRef.current = requestAnimationFrame(loop);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = createStars(canvas.width, canvas.height, mobileCount, desktopCount);
      drawFrame(performance.now());
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frameRef.current);
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [desktopCount, mobileCount]);

  return <canvas ref={canvasRef} className="space-stars-canvas" />;
};

export default StarField;