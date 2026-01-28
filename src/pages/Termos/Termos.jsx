import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Termos.css';

const Termos = () => {
  return (
    <div className="termos-page">
      <Header />
      <div className="termos-container">
        <div className="termos-content">
          <h1>Termos de Serviço</h1>
          <div className="termos-section">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o site da Radiant Store, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
            </p>
          </div>

          <div className="termos-section">
            <h2>2. Uso do Serviço</h2>
            <p>
              Os produtos disponibilizados na Radiant Store são destinados exclusivamente para fins educacionais e de aprendizado.
              Você é responsável por usar nossos serviços de forma legal e ética.
            </p>
          </div>

          <div className="termos-section">
            <h2>3. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do site, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens e software,
              é de propriedade da Radiant Store e está protegido por leis de direitos autorais.
            </p>
          </div>

          <div className="termos-section">
            <h2>4. Limitação de Responsabilidade</h2>
            <p>
              A Radiant Store não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais
              decorrentes do uso ou incapacidade de usar nossos produtos ou serviços.
            </p>
          </div>

          <div className="termos-section">
            <h2>5. Modificações</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor
              imediatamente após a publicação no site.
            </p>
          </div>

          <div className="termos-section">
            <h2>6. Contato</h2>
            <p>
              Para questões sobre estes termos, entre em contato conosco através dos canais de suporte disponíveis.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Termos;


