import React, { useEffect, useRef } from 'react';
import './ParticlesCanvas.css';

const ParticlesCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let resizeObserver = null;
    const particlesNear = [];
    const particlesFar = [];
    const comets = [];
    const particleCountNear = 260; // camada próxima (maiores e mais rápidas)
    const particleCountFar = 180;  // camada distante (menores e lentas)
    const maxConnectionsDistance = 110; // distância para linhas de conexão

    // efeito sutil de parallax com o mouse
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Configurar canvas
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Reposicionar partículas existentes se necessário
        const clampParticles = (arr) => {
          arr.forEach(particle => {
            if (particle.x > canvas.width) particle.x = canvas.width;
            if (particle.y > canvas.height) particle.y = canvas.height;
          });
        };
        clampParticles(particlesNear);
        clampParticles(particlesFar);
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    // Aguardar o DOM estar pronto e fazer resize inicial
    resizeCanvas();
    setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);
    
    // Observer para mudanças no container
    const container = canvas.parentElement;
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(container);
    }

    // Classe de Partícula
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.2 + 0.2;
        this.baseSpeed = Math.random() * 0.3 + 0.05;
        const angle = Math.random() * Math.PI * 2;
        this.speedX = Math.cos(angle) * this.baseSpeed;
        this.speedY = Math.sin(angle) * this.baseSpeed;
        this.opacity = Math.random() * 0.3 + 0.1; // Muito mais transparente
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinkle = Math.random() * Math.PI * 2;
        
        // Cores variadas: branco, azul claro e azul primário
        const colorRand = Math.random();
        if (colorRand < 0.6) {
          this.color = `rgba(255, 255, 255, ${this.opacity})`; // Branco
        } else if (colorRand < 0.85) {
          this.color = `rgba(45, 180, 255, ${this.opacity})`; // Azul claro
        } else {
          this.color = `rgba(8, 164, 247, ${this.opacity})`; // Azul primário
        }
      }

      update(multiplier = 1) {
        this.x += this.speedX * multiplier + mouse.x * 0.2 * multiplier; // parallax sutil
        this.y += this.speedY * multiplier + mouse.y * 0.2 * multiplier;
        
        // Efeito de twinkle mais sutil
        this.twinkle += this.twinkleSpeed;
        const twinkleOpacity = (Math.sin(this.twinkle) + 1) / 2;
        const currentOpacity = this.opacity * (0.7 + twinkleOpacity * 0.3); // Menos variação

        // Atualizar cor com opacidade variável
        if (this.color.includes('255, 255, 255')) {
          this.currentColor = `rgba(255, 255, 255, ${currentOpacity})`;
        } else if (this.color.includes('45, 180, 255')) {
          this.currentColor = `rgba(45, 180, 255, ${currentOpacity})`;
        } else {
          this.currentColor = `rgba(8, 164, 247, ${currentOpacity})`;
        }

        // Reaparecer nas bordas
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = this.currentColor || this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cometa (estrela cadente)
    class Comet {
      constructor() {
        const edge = Math.random() > 0.5 ? 'left' : 'top';
        this.x = edge === 'left' ? -20 : Math.random() * canvas.width;
        this.y = edge === 'top' ? -20 : Math.random() * canvas.height * 0.3;
        const angle = Math.random() * (-Math.PI / 3) - Math.PI / 6; // diagonal
        this.vx = Math.cos(angle) * (Math.random() * 3 + 2);
        this.vy = Math.sin(angle) * (Math.random() * 3 + 2);
        this.life = 0;
        this.maxLife = 120; // frames
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
      }
      draw() {
        const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.vx * 10, this.y - this.vy * 10);
        grad.addColorStop(0, 'rgba(45,180,255,0.9)');
        grad.addColorStop(1, 'rgba(45,180,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 12, this.y - this.vy * 12);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Criar partículas em duas camadas (parallax)
    for (let i = 0; i < particleCountNear; i++) particlesNear.push(new Particle());
    for (let i = 0; i < particleCountFar; i++) particlesFar.push(new Particle());

    // Função de animação
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // camada distante (mais lenta)
      particlesFar.forEach(p => { p.update(0.6); p.draw(); });

      // camada próxima (mais rápida)
      particlesNear.forEach(p => { p.update(1.2); p.draw(); });

      // conexões sutis entre partículas próximas (apenas algumas para performance)
      ctx.lineWidth = 1;
      for (let i = 0; i < particlesNear.length; i++) {
        for (let j = i + 1; j < i + 12 && j < particlesNear.length; j++) { // verificar apenas vizinhos próximos no array
          const a = particlesNear[i];
          const b = particlesNear[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxConnectionsDistance) {
            const alpha = 1 - dist / maxConnectionsDistance;
            ctx.strokeStyle = `rgba(45,180,255,${0.12 * alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // cometas ocasionais
      if (Math.random() < 0.01 && comets.length < 2) {
        comets.push(new Comet());
      }
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.update();
        c.draw();
        if (c.life > c.maxLife) comets.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particles-canvas"
      className="particles-canvas"
    />
  );
};

export default ParticlesCanvas;

