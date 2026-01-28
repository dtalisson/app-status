import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';
import { FaArrowRight, FaClock } from 'react-icons/fa';
import ParticlesCanvas from '../ParticlesCanvas/ParticlesCanvas';

const Hero = () => {
  return (
    <section className="hero-section">
      <ParticlesCanvas />
      <div className="hero-container reveal">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-title-line">Pronto para</span>
              <span className="hero-title-line">elevar</span>
              <span className="hero-title-line accent">seu nível no game?</span>
            </h1>

            <p className="hero-description">
              Na Radiant Store, transformamos o ordinário em excepcional. Junte-se aos visionários que aproveitam produtos inovadores, garantia vitalícia e um suporte que redefine os padrões de excelência.
            </p>

            <div className="hero-cta-buttons">
              <button className="hero-cta-btn primary">
                Explorar Produtos
                <FaArrowRight className="arrow-icon" />
              </button>
              <button className="hero-cta-btn secondary">
                Saber Mais
              </button>
            </div>
          </div>

          <div className="hero-video">
            <div className="hero-video-frame">
              {(() => {
                const videoPlaylist = [
                  'https://i.imgur.com/Bt2a96H.mp4',
                  'https://i.imgur.com/2fK7jTh.mp4',
                ];
                const VideoPlayer = () => {
                  const [videoIndex, setVideoIndex] = useState(0);
                  const videoRef = useRef(null);

                  useEffect(() => {
                    const v = videoRef.current;
                    if (!v) return;
                    // Garantir autoplay após a troca de src
                    const play = async () => {
                      try {
                        await v.play();
                      } catch (_) {
                        // ignorar falhas de autoplay
                      }
                    };
                    v.load();
                    play();
                  }, [videoIndex]);

                  const handleEnded = () => {
                    setVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
                  };

                  return (
                    <video
                      ref={videoRef}
                      key={videoIndex}
                      className="hero-video-player"
                      src={videoPlaylist[videoIndex]}
                      autoPlay
                      muted
                      playsInline
                      onEnded={handleEnded}
                    />
                  );
                };

                return <VideoPlayer />;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Flutuante */}
      <div className="floating-cta">
        <FaClock className="clock-icon" />
        <span>Compre Agora e Tenha Acesso Imediato!</span>
      </div>

      {/* Barra de Cupom */}
      <div className="domain-bar">
        <span className="domain-icon">🌐</span>
        <span>Use o cupom: <strong>RADIANT</strong> e garanta <strong>10%</strong> nos produtos!</span>
      </div>
    </section>
  );
};

export default Hero;


