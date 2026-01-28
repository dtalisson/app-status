import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import { productsAPI } from '../../utils/api';
import './Tutoriais.css';
import { FaBook, FaSpinner, FaCube } from 'react-icons/fa';

const Tutoriais = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Quando os produtos carregarem, selecionar o primeiro automaticamente
    if (allProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(allProducts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll();
      // Carregar todos os produtos ativos (mesmo sem tutorial)
      const activeProducts = (data || []).filter(product => product.active);
      setAllProducts(activeProducts);
      // Selecionar o primeiro produto automaticamente
      if (activeProducts.length > 0) {
        setSelectedProduct(activeProducts[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTutorialText = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    const formatted = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        formatted.push({ type: 'spacer', key: `spacer-${index}` });
        return;
      }
      
      // Detecta títulos (linhas em maiúsculas ou começando com #)
      if (trimmed.startsWith('# ')) {
        formatted.push({ type: 'h1', content: trimmed.substring(2), key: `h1-${index}` });
      } else if (trimmed.startsWith('## ')) {
        formatted.push({ type: 'h2', content: trimmed.substring(3), key: `h2-${index}` });
      } else if (trimmed.startsWith('### ')) {
        formatted.push({ type: 'h3', content: trimmed.substring(4), key: `h3-${index}` });
      } 
      // Detecta listas (começando com - ou *)
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        formatted.push({ type: 'list-item', content: trimmed.substring(2), key: `li-${index}` });
      }
      // Detecta números (1. 2. etc)
      else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.+)$/);
        formatted.push({ type: 'numbered-item', content: match ? match[2] : trimmed, number: match ? match[1] : null, key: `num-${index}` });
      }
      // Detecta texto em negrito (**texto**)
      else if (trimmed.includes('**')) {
        const parts = trimmed.split('**');
        formatted.push({ type: 'bold-text', parts, key: `bold-${index}` });
      }
      // Texto normal
      else {
        formatted.push({ type: 'paragraph', content: trimmed, key: `p-${index}` });
      }
    });
    
    return formatted;
  };

  const renderTutorialContent = (product) => {
    if (!product) return null;

    const formattedContent = product.tutorialText ? formatTutorialText(product.tutorialText) : [];

    return (
      <div className="tutorial-content">
        <div className="tutorial-content-header">
          <h2>{product.name}</h2>
        </div>

        {!product.tutorialText ? (
          <div className="tutorial-empty-state">
            <FaBook className="empty-icon" />
            <h3>Tutorial não disponível</h3>
            <p>O tutorial para este software ainda não foi cadastrado.</p>
          </div>
        ) : (
          <div className="tutorial-text-content">
            <div className="tutorial-text">
              {formattedContent.map((item) => {
                if (item.type === 'spacer') {
                  return <div key={item.key} className="tutorial-spacer"></div>;
                }
                if (item.type === 'h1') {
                  return <h1 key={item.key} className="tutorial-h1">{item.content}</h1>;
                }
                if (item.type === 'h2') {
                  return <h2 key={item.key} className="tutorial-h2">{item.content}</h2>;
                }
                if (item.type === 'h3') {
                  return <h3 key={item.key} className="tutorial-h3">{item.content}</h3>;
                }
                if (item.type === 'list-item') {
                  return (
                    <div key={item.key} className="tutorial-list-item">
                      <span className="list-bullet">•</span>
                      <span>{item.content}</span>
                    </div>
                  );
                }
                if (item.type === 'numbered-item') {
                  const number = item.number || (formattedContent.findIndex(i => i.key === item.key) + 1);
                  return (
                    <div key={item.key} className="tutorial-numbered-item">
                      <span className="list-number">{number}.</span>
                      <span>{item.content}</span>
                    </div>
                  );
                }
                if (item.type === 'bold-text') {
                  return (
                    <p key={item.key} className="tutorial-paragraph">
                      {item.parts.map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                  );
                }
                return <p key={item.key} className="tutorial-paragraph">{item.content}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tutoriais-page">
      <ParticlesCanvas />
      <Header />
      <div className="tutoriais-container">
        <div className="tutoriais-hero">
          <h1>Tutoriais dos Softwares</h1>
        </div>

        {loading ? (
          <div className="tutoriais-loading">
            <FaSpinner className="spinner-icon" />
            <p>Carregando produtos...</p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="tutoriais-empty">
            <FaBook className="empty-icon" />
            <h3>Nenhum produto disponível</h3>
            <p>Os produtos serão adicionados em breve!</p>
          </div>
        ) : (
          <div className="tutoriais-layout">
            {/* Sidebar com lista de produtos */}
            <div className="tutoriais-sidebar">
              <div className="sidebar-header">
                <FaCube />
                <h3>Softwares</h3>
              </div>
              <div className="sidebar-products-list">
                {allProducts.map((product) => {
                  const isSelected = selectedProduct?._id === product._id;
                  
                  return (
                    <button
                      key={product._id}
                      className={`sidebar-product-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <span className="product-item-name">{product.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo principal com tutorial */}
            <div className="tutoriais-main">
              {selectedProduct && renderTutorialContent(selectedProduct)}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Tutoriais;

