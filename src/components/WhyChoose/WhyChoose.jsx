import React from 'react';
import './WhyChoose.css';
import { FaArrowRight } from 'react-icons/fa';
import ParticlesCanvas from '../ParticlesCanvas/ParticlesCanvas';

const WhyChoose = () => {
  return (
    <section className="why-choose reveal" id="porque-escolher">
      <ParticlesCanvas />
      <div className="why-choose-container">
        <div className="why-choose-content">
          <span className="section-subtitle">Por que escolher a Radiant Store?</span>
          <h2 className="section-main-title">Qualidade e Segurança</h2>
          
          <div className="text-blocks">
            <p className="text-block">
              Na Radiant Store, nossa prioridade é entregar produtos de altíssima qualidade que superam 
              as expectativas dos nossos usuários. Trabalhamos incansavelmente para garantir que cada 
              software seja seguro, eficiente e confiável.
            </p>
            <p className="text-block">
              Nossos produtos são desenvolvidos com tecnologia de ponta, oferecendo facilidade de uso, 
              desempenho excepcional e diversão garantida. Compre agora e descubra a diferença que a 
              qualidade faz.
            </p>
          </div>

          <button className="why-choose-cta">
            Ver nossos produtos
            <FaArrowRight className="arrow-icon" />
          </button>
        </div>

        {/* Background removido a pedido do usuário */}
      </div>
    </section>
  );
};

export default WhyChoose;


