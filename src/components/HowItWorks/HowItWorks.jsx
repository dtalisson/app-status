import React from 'react';
import './HowItWorks.css';
import { FaShoppingCart, FaUnlock, FaRocket } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaShoppingCart />,
      title: 'Compra',
      description: 'Escolha entre métodos de pagamento seguros. Nosso sistema aceita PIX e criptomoedas para sua comodidade.'
    },
    {
      icon: <FaUnlock />,
      title: 'Acesso Liberado',
      description: 'Receba suas credenciais de acesso instantaneamente após a compra. Não há espera - entre e aproveite imediatamente!'
    },
    {
      icon: <FaRocket />,
      title: 'Desempenho',
      description: 'Domine o jogo com ferramentas avançadas. Aumente seu rank, melhore seu desempenho e conquiste vitórias consecutivas.'
    }
  ];

  return (
    <section className="how-it-works reveal" id="como-funciona">
      <div className="how-it-works-container">
        <div className="section-header">
          <h2 className="section-title">Como Funciona?</h2>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


