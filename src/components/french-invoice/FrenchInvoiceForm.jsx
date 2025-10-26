import { useState, useCallback } from 'react';
import { Plus, Trash2, Upload, Save, FileText, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { validateIBAN } from '../../utils/frenchInvoiceCalculations';
import SmartCustomerSelector from '../SmartCustomerSelector';

const FrenchInvoiceForm = ({ 
  invoiceData, 
  onDataChange, 
  onSave,
  onPreview,
  onCustomerSelect,
  className = '' 
}) => {
  const { t } = useTranslation();
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Collapsed states for sections
  const [collapsedSections, setCollapsedSections] = useState({
    items: false,
    payment: true,
    footer: true
  });

  // Manual customer entry state
  const [isManualMode, setIsManualMode] = useState(false);

  // Handle manual mode change
  const handleManualModeChange = useCallback((manualMode) => {
    setIsManualMode(manualMode);
  }, []);

  // Toggle section collapse
  const toggleSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Handle company data changes
  const updateCompany = useCallback((field, value) => {
    onDataChange({
      ...invoiceData,
      company: {
        ...invoiceData.company,
        [field]: value
      }
    });
  }, [invoiceData, onDataChange]);

  // Handle invoice data changes
  const updateInvoice = useCallback((field, value) => {
    onDataChange({
      ...invoiceData,
      invoice: {
        ...invoiceData.invoice,
        [field]: value
      }
    });
  }, [invoiceData, onDataChange]);

  // Handle payment data changes
  const updatePayment = useCallback((field, value) => {
    const newPayment = {
      ...invoiceData.payment,
      [field]: value
    };

    // Validate IBAN if it&apos;s being updated
    if (field === 'iban' && value) {
      const validation = validateIBAN(value);
      setErrors(prev => ({
        ...prev,
        iban: validation.isValid ? null : validation.error
      }));
    }

    onDataChange({
      ...invoiceData,
      payment: newPayment
    });
  }, [invoiceData, onDataChange]);

  // Handle footer settings changes
  const updateFooter = useCallback((field, value) => {
    onDataChange({
      ...invoiceData,
      footer: {
        ...invoiceData.footer,
        [field]: value
      }
    });
  }, [invoiceData, onDataChange]);

  // Handle items changes
  const updateItem = useCallback((index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    onDataChange({
      ...invoiceData,
      items: newItems
    });
  }, [invoiceData, onDataChange]);

  // Add new item
  const addItem = useCallback(() => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      quantity: '',
      unitPrice: 0,
      vatRate: 20
    };
    onDataChange({
      ...invoiceData,
      items: [...invoiceData.items, newItem]
    });
  }, [invoiceData, onDataChange]);

  // Remove item
  const removeItem = useCallback((index) => {
    // Prevent deleting if only one item remains
    if (invoiceData.items.length <= 1) {
      return;
    }
    
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    onDataChange({
      ...invoiceData,
      items: newItems
    });
  }, [invoiceData, onDataChange]);

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target.result;
        setLogoPreview(logoUrl);
        updateCompany('logo', logoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setLogoPreview(null);
    updateCompany('logo', ''); // Remove logo completely
  };

  // Calendar click handlers - Updated approach


  return (
    <div className={`french-invoice-form ${className}`}>
      <div className="form-container">
        
        {/* Company Information */}
        <div className="form-section">
          <h3 className="section-title">
            <FileText size={20} />
            {t('frenchInvoice.company.title')}
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company-name">{t('frenchInvoice.company.name')} *</label>
              <input
                id="company-name"
                type="text"
                value={invoiceData.company.name || ''}
                onChange={(e) => updateCompany('name', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.companyName')}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company-address">{t('frenchInvoice.company.address')}</label>
              <input
                id="company-address"
                type="text"
                value={invoiceData.company.address || ''}
                onChange={(e) => updateCompany('address', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.companyAddress')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company-city">{t('frenchInvoice.company.city')}</label>
              <input
                id="company-city"
                type="text"
                value={invoiceData.company.city || ''}
                onChange={(e) => updateCompany('city', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.companyCity')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company-phone">{t('frenchInvoice.company.phone')}</label>
              <input
                id="company-phone"
                type="tel"
                value={invoiceData.company.phone}
                onChange={(e) => updateCompany('phone', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.companyPhone')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company-email">{t('frenchInvoice.company.email')}</label>
              <input
                id="company-email"
                type="email"
                value={invoiceData.company.email || ''}
                onChange={(e) => updateCompany('email', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.companyEmail')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company-website">{t('frenchInvoice.company.website')}</label>
              <input
                id="company-website"
                type="url"
                value={invoiceData.company.website || ''}
                onChange={(e) => updateCompany('website', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.companyWebsite')}
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="form-group logo-upload">
            <label>{t('frenchInvoice.company.logo')}</label>
            <div className="logo-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="logo-input"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="logo-upload-button">
                <Upload size={20} />
                {t('frenchInvoice.company.uploadLogo')}
              </label>
              {(logoPreview || invoiceData.company.logo) && (
                <div className="logo-preview">
                  <img 
                    src={logoPreview || invoiceData.company.logo} 
                    alt="Logo preview"
                    className="logo-preview-img"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="logo-remove-btn"
                    title={t('frenchInvoice.company.removeLogo')}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="form-section">
          <h3 className="section-title">
            <FileText size={20} />
            {t('frenchInvoice.client.title')}
          </h3>
          
          <SmartCustomerSelector
            selectedCustomer={{
              name: invoiceData.client.name,
              address: invoiceData.client.address,
              city: invoiceData.client.city,
              phone: invoiceData.client.phone
            }}
            onCustomerSelect={onCustomerSelect}
            onManualModeChange={handleManualModeChange}
            isManualMode={isManualMode}
            placeholder={t('frenchInvoice.placeholders.clientName', 'Select or add a client')}
          />
        </div>

        {/* Invoice Details */}
        <div className="form-section">
          <h3 className="section-title">
            <FileText size={20} />
            {t('frenchInvoice.invoice.title')}
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="invoice-number">{t('frenchInvoice.invoice.number')} *</label>
              <input
                id="invoice-number"
                type="text"
                value={invoiceData.invoice.number}
                onChange={(e) => updateInvoice('number', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.invoiceNumber')}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="invoice-date">{t('frenchInvoice.invoice.date')} *</label>
              <input
                id="invoice-date"
                type="date"
                value={invoiceData.invoice.date ? invoiceData.invoice.date.substring(0, 10) : ''}
                onChange={e => updateInvoice('date', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="invoice-due-date">{t('frenchInvoice.invoice.dueDate')}</label>
              <input
                id="invoice-due-date"
                type="date"
                value={invoiceData.invoice.dueDate ? invoiceData.invoice.dueDate.substring(0, 10) : ''}
                onChange={e => updateInvoice('dueDate', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="operation-type">{t('frenchInvoice.invoice.operationType')}</label>
              <select
                id="operation-type"
                value={invoiceData.invoice.operationType}
                onChange={(e) => updateInvoice('operationType', e.target.value)}
              >
                <option value={t('frenchInvoice.operationTypes.goodsDelivery')}>{t('frenchInvoice.operationTypes.goodsDelivery')}</option>
                <option value={t('frenchInvoice.operationTypes.serviceProvision')}>{t('frenchInvoice.operationTypes.serviceProvision')}</option>
                <option value={t('frenchInvoice.operationTypes.sale')}>{t('frenchInvoice.operationTypes.sale')}</option>
                <option value={t('frenchInvoice.operationTypes.rental')}>{t('frenchInvoice.operationTypes.rental')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="form-section">
          <h3 
            className="section-title cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('items')}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              {t('frenchInvoice.items.title')}
              <span className="text-sm text-gray-500">
                ({invoiceData.items?.length || 0} {t('frenchInvoice.items.count', 'items')})
              </span>
            </div>
            {collapsedSections.items ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </h3>
          
          {!collapsedSections.items && (
            <div className="items-container max-h-96 overflow-y-auto">
            {invoiceData.items.map((item, index) => (
              <div key={item.id || index} className="item-row">
                <div className="item-fields">
                  <div className="form-group">
                    <label>{t('frenchInvoice.items.description')} *</label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder={t('frenchInvoice.placeholders.itemDescription')}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{t('frenchInvoice.items.quantity')}</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={item?.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? '' : (parseFloat(e.target.value) || 1))}
                      placeholder={t('frenchInvoice.placeholders.quantity')}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{t('frenchInvoice.items.unitPrice')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item?.unitPrice || 0}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{t('frenchInvoice.items.vatRate')}</label>
                    <select
                      value={item?.vatRate || 20}
                      onChange={(e) => updateItem(index, 'vatRate', parseFloat(e.target.value) || 0)}
                    >
                      <option value={0}>{t('frenchInvoice.vatRates.0')}</option>
                      <option value={5.5}>{t('frenchInvoice.vatRates.5.5')}</option>
                      <option value={10}>{t('frenchInvoice.vatRates.10')}</option>
                      <option value={20}>{t('frenchInvoice.vatRates.20')}</option>
                    </select>
                  </div>
                </div>
                
                {invoiceData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="remove-item-button"
                    title={t('frenchInvoice.items.removeItem')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addItem}
              className="add-item-button"
            >
              <Plus size={16} />
              {t('frenchInvoice.items.addItem')}
            </button>
          </div>
          )}
        </div>

        {/* Payment Information */}
        <div className="form-section">
          <h3 
            className="section-title cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('payment')}
          >
            <div className="flex items-center gap-2">
              <FileText size={20} />
              {t('frenchInvoice.payment.title')}
            </div>
            {collapsedSections.payment ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </h3>
          
          {!collapsedSections.payment && (
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="payment-show">
                <input
                  id="payment-show"
                  type="checkbox"
                  checked={invoiceData.payment?.showPaymentInfo !== false}
                  onChange={(e) => updatePayment('showPaymentInfo', e.target.checked)}
                />
                {t('frenchInvoice.payment.showPaymentInfo')}
              </label>
              <small className="form-help-text">
                {t('frenchInvoice.payment.showPaymentInfoHelp')}
              </small>
            </div>
            
            {invoiceData.payment?.showPaymentInfo !== false && (
              <>
                <div className="form-group">
                  <label htmlFor="payment-bank">{t('frenchInvoice.payment.bank')}</label>
              <input
                id="payment-bank"
                type="text"
                value={invoiceData.payment.bank}
                onChange={(e) => updatePayment('bank', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.bank')}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="payment-iban">{t('frenchInvoice.payment.iban')} *</label>
              <input
                id="payment-iban"
                type="text"
                value={invoiceData.payment.iban}
                onChange={(e) => updatePayment('iban', e.target.value)}
                placeholder={t('frenchInvoice.placeholders.iban')}
                className={errors.iban ? 'error' : ''}
              />
              {errors.iban && (
                <span className="error-message">{errors.iban}</span>
              )}
            </div>
            
                <div className="form-group">
                  <label htmlFor="payment-bic">{t('frenchInvoice.payment.bic')}</label>
                  <input
                    id="payment-bic"
                    type="text"
                    value={invoiceData.payment.bic}
                    onChange={(e) => updatePayment('bic', e.target.value)}
                    placeholder={t('frenchInvoice.placeholders.bic')}
                  />
                </div>
              </>
            )}
          </div>
          )}
        </div>

        {/* Footer Settings */}
        <div className="form-section">
          <h3 
            className="section-title cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('footer')}
          >
            <div className="flex items-center gap-2">
              <Settings size={20} />
              {t('frenchInvoice.footer.title')}
            </div>
            {collapsedSections.footer ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </h3>
          
          {!collapsedSections.footer && (
          <div className="form-group">
            <div className="form-group">
              <label htmlFor="footer-show">
                <input
                  id="footer-show"
                  type="checkbox"
                  checked={invoiceData.footer?.showFooter !== false}
                  onChange={(e) => updateFooter('showFooter', e.target.checked)}
                />
                {t('frenchInvoice.footer.showFooter')}
              </label>
            </div>
            
            {invoiceData.footer?.showFooter !== false && (
              <>
                <div className="form-group">
                  <label htmlFor="footer-company-name">{t('frenchInvoice.footer.companyName')}</label>
                  <input
                    id="footer-company-name"
                    type="text"
                    value={invoiceData.footer?.companyName || invoiceData.company?.name || ''}
                    onChange={(e) => updateFooter('companyName', e.target.value)}
                    placeholder={t('frenchInvoice.placeholders.companyName')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="footer-address">{t('frenchInvoice.footer.address')}</label>
                  <input
                    id="footer-address"
                    type="text"
                    value={invoiceData.footer?.address || `${invoiceData.company?.address || ''} ${invoiceData.company?.city || ''}`.trim() || ''}
                    onChange={(e) => updateFooter('address', e.target.value)}
                    placeholder={`${t('frenchInvoice.placeholders.companyAddress')} ${t('frenchInvoice.placeholders.companyCity')}`}
                  />
                </div>
                
                <div className="form-group form-group-full">
                  <label htmlFor="footer-custom-message">{t('frenchInvoice.footer.customMessage')}</label>
                  <textarea
                    id="footer-custom-message"
                    value={invoiceData.footer?.customMessage || ''}
                    onChange={(e) => updateFooter('customMessage', e.target.value)}
                    placeholder={t('frenchInvoice.placeholders.footerMessage')}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onPreview}
            className="preview-button"
          >
            <FileText size={16} />
            {t('frenchInvoice.actions.preview')}
          </button>
          
          <button
            type="button"
            onClick={onSave}
            className="save-button"
          >
            <Save size={16} />
            {t('frenchInvoice.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrenchInvoiceForm;