import React, { useState } from 'react';
import './FeaturedProducts.css';
import { FaCheckCircle, FaPlay } from 'react-icons/fa';

const FeaturedProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Função para extrair ID do YouTube
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função para detectar tipo de vídeo
  const getVideoType = (url) => {
    if (!url) return 'direct';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct'; // MP4, WEBM, etc
  };

  const products = [
    {
      id: 1,
      title: 'VALORANT COLOR',
      subtitle: 'Showcase',
      description: 'Visual avançado com detecção por cores. Estável, leve e seguro.',
      videoUrl: 'https://i.imgur.com/Xdj3CoC.mp4',
      badge: '100% UNDETECTABLE'
    },
    {
      id: 2,
      title: 'VALORANT ESP + AIMBOT',
      subtitle: 'Showcase',
      description: 'ESP preciso e assistente de mira configurável para máxima performance.',
      videoUrl: 'https://cdn.coverr.co/videos/coverr-playing-card-tricks-5606/1080p.mp4',
      badge: '100% UNDETECTABLE'
    },
    {
      id: 3,
      title: 'VALORANT SKINCHANGER',
      subtitle: 'Showcase',
      description: 'Catálogo de skins completo sem impacto no desempenho.',
      videoUrl: 'https://cdn.coverr.co/videos/coverr-supercar-at-night-6355/1080p.mp4',
      badge: '100% UNDETECTABLE'
    }
  ];

  const current = products[currentIndex];
  const videoType = getVideoType(current.videoUrl);
  const youtubeId = videoType === 'youtube' ? getYouTubeId(current.videoUrl) : null;

  return (
    <section className="featured-products reveal" id="produtos">
      <div className="featured-products-container">
        <div className="section-intro">
          <h2 className="headline">Domine o <span className="accent">Valorant</span></h2>
          <p className="subhead">Aprimore mira, visão de jogo e consistência com ferramentas seguras e atualizadas. Assuma o controle das partidas e evolua de forma inteligente.</p>
        </div>

        <div className="tri-showcase">
            <div className="info-card left">
              <div className="info-icon">{/* Left card icon */}</div>
            <div className="info-title">Produtos de excelência</div>
              <div className="info-desc">Soluções avançadas, estáveis e seguras, projetadas para performance consistente e evolução contínua.</div>
            </div>

          <div className="tablet-player">
            <div className="tablet-frame">
              {videoType === 'youtube' && youtubeId ? (
                <iframe
                  key={youtubeId}
                  className="tablet-video"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&fs=0&showinfo=0&vq=hd1080`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowFullScreen
                />
              ) : videoType === 'vimeo' ? (
                <iframe
                  key={current.videoUrl}
                  className="tablet-video"
                  src={`https://player.vimeo.com/video/${current.videoUrl.split('/').pop()}?autoplay=1&muted=1&loop=1&background=1`}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={current.videoUrl}
                  className="tablet-video"
                  src={current.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              )}
            </div>
            {/* Controles ocultos temporariamente */}
          </div>

            <div className="info-card right">
              <div className="info-icon">{/* Right card icon */}</div>
              <div className="info-title">Garantia e Suporte</div>
              <div className="info-desc">Ativação imediata, suporte dedicado 24/7 e garantia vitalícia em todas as licenças.</div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;


