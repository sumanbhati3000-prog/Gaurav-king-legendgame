import { Particle } from '../types/game';

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  public addDashTrail(x: number, y: number, color = '#38bdf8') {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        size: 3 + Math.random() * 4,
        alpha: 0.7,
        decay: 1.8,
        color,
        glow: true,
      });
    }
  }

  public addFootstepDust(x: number, y: number) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      size: 2 + Math.random() * 2,
      alpha: 0.35,
      decay: 1.2,
      color: '#94a3b8',
    });
  }

  public addKingAura(x: number, y: number, isBursting: boolean) {
    const count = isBursting ? 4 : 1;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isBursting ? 80 + Math.random() * 70 : 25 + Math.random() * 30;
      this.particles.push({
        x: x + Math.cos(angle) * (18 + Math.random() * 10),
        y: y + Math.sin(angle) * (18 + Math.random() * 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isBursting ? 3 + Math.random() * 4 : 2 + Math.random() * 2,
        alpha: isBursting ? 0.9 : 0.6,
        decay: isBursting ? 1.5 : 1.2,
        color: isBursting ? '#fecaca' : '#ef4444',
        glow: true,
      });
    }
  }

  public addPortalSwirl(x: number, y: number, radius: number) {
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.4 + Math.random() * 0.7);
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      // Inward vortex
      const tangent = angle + Math.PI / 2;
      const inwardSpeed = 25;
      const swirlSpeed = 60;
      this.particles.push({
        x: px,
        y: py,
        vx: -Math.cos(angle) * inwardSpeed + Math.cos(tangent) * swirlSpeed,
        vy: -Math.sin(angle) * inwardSpeed + Math.sin(tangent) * swirlSpeed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.8,
        decay: 1.0,
        color: Math.random() > 0.4 ? '#38bdf8' : '#818cf8',
        glow: true,
      });
    }
  }

  public addCaptureBurst(x: number, y: number) {
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 0.9 + Math.random() * 0.8,
        color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
        glow: true,
      });
    }
  }

  public addVictoryFireworks(x: number, y: number) {
    const colors = ['#38bdf8', '#fbbf24', '#34d399', '#c084fc', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        alpha: 1.0,
        decay: 0.6 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: true,
      });
    }
  }

  public addKnifeSlashParticles(x: number, y: number, angle: number) {
    for (let i = -0.5; i <= 0.5; i += 0.25) {
      const slashAngle = angle + i;
      const speed = 120 + Math.random() * 80;
      this.particles.push({
        x: x + Math.cos(slashAngle) * 26,
        y: y + Math.sin(slashAngle) * 26,
        vx: Math.cos(slashAngle) * speed,
        vy: Math.sin(slashAngle) * speed,
        size: 2.5 + Math.random() * 3,
        alpha: 0.9,
        decay: 3.5,
        color: '#e0f2fe',
        glow: true,
      });
    }
  }

  public addHitSparks(x: number, y: number, color = '#fbbf24') {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        decay: 2.4,
        color,
        glow: true,
      });
    }
  }

  public addEnemyDeathPuff(x: number, y: number, color = '#f97316') {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        alpha: 0.9,
        decay: 1.6,
        color: Math.random() > 0.4 ? color : '#fee2e2',
        glow: true,
      });
    }
  }

  public addKingDefeatedBurst(x: number, y: number) {
    // Royal explosion of gold and crimson
    const colors = ['#dc2626', '#eab308', '#fef08a', '#ffffff', '#b91c1c'];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 300;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        alpha: 1.0,
        decay: 0.8 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: true,
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}

