import React, { useState, useEffect } from 'react';
import { productsAPI, uploadAPI } from '../../../utils/api';
import { normalizeImageUrl } from '../../../utils/imageNormalizer';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaCheck, FaUpload } from 'react-icons/fa';
import './ProductsModal.css';

const ProductsModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subDescription: '',
    imageUrl: '',
    tutorial: '',
    tutorialText: '',
    download: '',
    active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await productsAPI.getAdmin();
      
      console.log('📥 Produtos carregados no modal:', productsData?.length || 0);
      productsData?.forEach(product => {
        console.log(`  📦 ${product.name}: imageUrl="${product.imageUrl || '(vazio)'}"`);
      });
      
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 handleSubmit chamado', {
      temArquivo: !!imageFile,
      formDataImageUrl: formData.imageUrl,
      editingProduct: editingProduct ? {
        id: editingProduct._id,
        name: editingProduct.name,
        imageUrl: editingProduct.imageUrl,
        image: editingProduct.image
      } : null
    });
    
    try {
      let imageUrl = formData.imageUrl;
      
      // Se houver um arquivo selecionado, fazer upload primeiro
      if (imageFile) {
        setUploadingImage(true);
        console.log('📤 Fazendo upload da imagem...');
        try {
          const uploadResult = await uploadAPI.uploadProductImage(imageFile);
          imageUrl = uploadResult.imageUrl;
          console.log('✅ Upload concluído, URL:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Erro no upload:', uploadError);
          alert('Erro ao fazer upload da imagem: ' + uploadError.message);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      } else if (!imageUrl || imageUrl.trim() === '') {
        // Se não houver arquivo nem URL, verificar se está editando
        if (editingProduct) {
          imageUrl = editingProduct.imageUrl || editingProduct.image || '';
          console.log('⚠️ Usando imageUrl existente do produto:', imageUrl);
        } else {
          imageUrl = '';
          console.log('⚠️ Nenhuma imagem fornecida para novo produto');
        }
      } else {
        // Se houver URL, normalizar usando função dedicada
        console.log('🔄 Normalizando URL antes de enviar:', imageUrl);
        imageUrl = normalizeImageUrl(imageUrl);
        console.log('🔄 URL após normalização:', imageUrl);
      }
      
      console.log('✅ imageUrl final antes de enviar:', imageUrl);
      console.log('✅ Tipo do imageUrl:', typeof imageUrl);
      console.log('✅ imageUrl tem valor?', !!imageUrl);
      
      // Preparar dados do produto
      const productData = {
        name: formData.name,
        description: formData.description || '',
        subDescription: formData.subDescription || '',
        tutorial: formData.tutorial || '',
        tutorialText: formData.tutorialText || '',
        download: formData.download || '',
        active: formData.active,
        imageUrl: imageUrl || '', // SEMPRE incluir imageUrl, mesmo que vazio
      };

      console.log('📤 Salvando produto - dados completos:', JSON.stringify(productData, null, 2));

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
      } else {
        await productsAPI.create(productData);
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert(error.message || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (product) => {
    console.log('📝 Iniciando edição do produto:', {
      id: product._id,
      name: product.name,
      imageUrl: product.imageUrl,
      image: product.image,
      fullProduct: product
    });
    
    setEditingProduct(product);
    
    // Normalizar imageUrl ao editar - verificar tanto imageUrl quanto image
    let imageUrl = '';
    if (product.imageUrl) {
      imageUrl = product.imageUrl.trim();
    } else if (product.image) {
      imageUrl = product.image.trim();
    }
    
    console.log('📝 Produto sendo editado - imageUrl encontrado:', imageUrl);
    
    const formDataToSet = {
      name: product.name || '',
      description: product.description || '',
      subDescription: product.subDescription || '',
      tutorial: product.tutorial || '',
      tutorialText: product.tutorialText || '',
      download: product.download || '',
      imageUrl: imageUrl,
      active: product.active !== undefined ? product.active : true,
    };
    
    console.log('📝 FormData que será definido:', formDataToSet);
    
    setFormData(formDataToSet);
    setImageFile(null);
    setImagePreview(imageUrl || null); // Preview da imagem existente
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto? Isso também removerá todos os planos associados.')) return;
    
    try {
      await productsAPI.delete(id);
      await loadData();
    } catch (error) {
      alert(error.message || 'Erro ao deletar produto');
    }
  };

  const resetForm = () => {
    console.log('🔄 resetForm chamado');
    setFormData({
      name: '',
      description: '',
      subDescription: '',
      imageUrl: '',
      tutorial: '',
      tutorialText: '',
      download: '',
      active: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem!');
        e.target.value = '';
        return;
      }
      
      // Verificar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB!');
        e.target.value = '';
        return;
      }
      
      setImageFile(file);
      setFormData({ ...formData, imageUrl: '' }); // Limpar URL se houver arquivo
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      console.log('📁 Arquivo selecionado:', file.name, file.size, 'bytes');
    }
  };


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="products-modal-overlay" onClick={onClose}>
      <div className="products-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="products-modal-header">
          <h2>Gerenciar Produtos</h2>
          <div className="modal-header-actions">
            {!showForm && (
              <button className="btn-add-product" onClick={() => setShowForm(true)}>
                <FaPlus /> Novo Produto
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="products-modal-body">
          {showForm ? (
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-header">
                <h3>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button type="button" className="btn-back" onClick={resetForm}>
                  <FaTimes /> Voltar
                </button>
              </div>

              <div className="form-group">
                <label>Nome do Produto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Valorant ESP"
                />
              </div>

              <div className="form-group">
                <label>Descrição Curta *</label>
                <p className="field-hint">Esta descrição aparecerá na lista de produtos</p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Descrição breve para a lista de produtos..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição Detalhada</label>
                <p className="field-hint">Esta descrição aparecerá na página de detalhes do produto</p>
                <textarea
                  name="subDescription"
                  value={formData.subDescription}
                  onChange={(e) => setFormData({ ...formData, subDescription: e.target.value })}
                  placeholder="Descrição mais completa e detalhada..."
                />
              </div>

              <div className="form-group">
                <label>Link do Tutorial (Opcional)</label>
                <p className="field-hint">Link externo para tutorial (opcional, aparece como botão adicional)</p>
                <input
                  type="url"
                  value={formData.tutorial}
                  onChange={(e) => setFormData({ ...formData, tutorial: e.target.value })}
                  placeholder="https://exemplo.com/tutorial"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Produto Ativo</span>
                </label>
              </div>

              <div className="form-group">
                <label>Imagem do Produto {!editingProduct && '*'}</label>
                <p className="field-hint">
                  {editingProduct 
                    ? 'Deixe em branco para manter a imagem atual, ou escolha uma nova imagem/URL' 
                    : 'Escolha uma imagem do seu computador ou cole uma URL'
                  }
                </p>
                
                {/* Opção 1: Upload de arquivo */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #08a4f7',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#08a4f7',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}>
                    <FaUpload />
                    {imageFile ? `Arquivo: ${imageFile.name}` : 'Escolher Imagem do PC'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                
                {/* Separador OU */}
                <div style={{ 
                  textAlign: 'center', 
                  margin: '12px 0',
                  color: '#6b7280',
                  fontSize: '12px'
                }}>
                  OU
                </div>
                
                {/* Opção 2: URL */}
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => {
                    console.log('🔵 Campo imageUrl alterado:', e.target.value);
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (e.target.value) {
                      setImageFile(null);
                      setImagePreview(null);
                    }
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData('text');
                    console.log('📋 URL colada:', pastedText);
                    setFormData({ ...formData, imageUrl: pastedText });
                    setImageFile(null);
                    setImagePreview(null);
                    e.preventDefault();
                  }}
                  placeholder="Ou cole aqui o endereço da imagem (URL)"
                  style={{ marginTop: '8px' }}
                />
                
                {/* Preview */}
                {(imagePreview || formData.imageUrl) && (
                  <div className="image-preview" style={{ marginTop: '12px' }}>
                    <img 
                      src={imagePreview || normalizeImageUrl(formData.imageUrl || '')} 
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('❌ Erro no preview da imagem:', imagePreview || formData.imageUrl);
                        const errorMsg = e.target.nextElementSibling;
                        if (errorMsg) {
                          errorMsg.style.display = 'block';
                          errorMsg.textContent = `Erro ao carregar imagem`;
                        }
                      }}
                      onLoad={(e) => {
                        console.log('✅ Preview da imagem carregada');
                        const errorMsg = e.target.nextElementSibling;
                        if (errorMsg) {
                          errorMsg.style.display = 'none';
                        }
                      }}
                    />
                    <p className="image-error" style={{ display: 'none', color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
                      Erro ao carregar imagem.
                    </p>
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remover arquivo
                      </button>
                    )}
                  </div>
                )}
                
                {uploadingImage && (
                  <p style={{ color: '#08a4f7', marginTop: '8px', fontSize: '12px' }}>
                    📤 Fazendo upload da imagem...
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm} disabled={uploadingImage}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={uploadingImage}>
                  <FaCheck /> {uploadingImage ? 'Fazendo Upload...' : (editingProduct ? 'Atualizar' : 'Criar Produto')}
                </button>
              </div>
            </form>
          ) : (
            <>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Carregando produtos...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <FaImage className="empty-icon" />
                  <h3>Nenhum produto cadastrado</h3>
                  <p>Comece adicionando seu primeiro produto</p>
                  <button className="btn-add-first" onClick={() => setShowForm(true)}>
                    <FaPlus /> Adicionar Primeiro Produto
                  </button>
                </div>
              ) : (
                <div className="products-list">
                  {products.map((product) => (
                    <div key={product._id} className="product-item">
                      <div className="product-item-image">
                        {(() => {
                          const url = normalizeImageUrl(product.imageUrl || product.image || '');
                          return url ? (
                            <>
                              <img 
                                src={url} 
                                alt={product.name || 'Produto'}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.error('❌ Erro ao carregar imagem do produto:', {
                                    urlOriginal: product.imageUrl || product.image,
                                    urlNormalizada: url,
                                    urlTentada: e.target.src,
                                    productId: product._id,
                                    productName: product.name
                                  });
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.nextSibling;
                                  if (placeholder) {
                                    placeholder.style.display = 'flex';
                                  }
                                }}
                                onLoad={(e) => {
                                  console.log('✅ Imagem carregada com sucesso:', url);
                                  const placeholder = e.target.nextSibling;
                                  if (placeholder) {
                                    placeholder.style.display = 'none';
                                  }
                                }}
                              />
                              <div 
                                className="product-image-placeholder" 
                                style={{ display: 'none' }}
                              >
                                <FaImage />
                              </div>
                            </>
                          ) : (
                            <div className="product-image-placeholder" style={{ display: 'flex' }}>
                              <FaImage />
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="product-item-info">
                        <div className="product-item-header">
                          <h4>{product.name}</h4>
                          <span className={`product-status ${product.active ? 'active' : 'inactive'}`}>
                            {product.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <p className="product-item-description">
                          {product.description || 'Sem descrição'}
                        </p>
                        
                        {product.plans && product.plans.length > 0 ? (
                          <div className="product-item-plans">
                            <strong>Planos:</strong>
                            <div className="plans-badges">
                              {product.plans.map((plan, idx) => {
                                const planObj = typeof plan === 'object' ? plan : {};
                                return (
                                  <span key={plan._id || plan || idx} className="plan-badge">
                                    {planObj.name || plan} - {formatCurrency(planObj.value || 0)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="product-item-plans">
                            <p className="no-plans-text" style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px', margin: 0 }}>
                              Nenhum plano associado
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="product-item-actions">
                        <button 
                          className="btn-edit-item"
                          onClick={() => handleEdit(product)}
                        >
                          <FaEdit /> Editar
                        </button>
                        <button 
                          className="btn-delete-item"
                          onClick={() => handleDelete(product._id)}
                        >
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsModal;

