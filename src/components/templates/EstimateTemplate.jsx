"use client";

import * as React from "react";
import EstimateProfessional from './EstimateProfessional.jsx';
// Removed unused Dialog imports

const currencyFmt = (n, currency = "€") => `${currency}${n.toFixed(2)}`;

// Template 1: Modern Professional
const ModernTemplate = ({ estimate, watermark = true }) => {
  const subtotal = estimate.items.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);
  const discountAmount = Math.min(Math.max(estimate.discount, 0), 100) * 0.01 * subtotal;
  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = Math.max(estimate.taxRate, 0) * 0.01 * taxable;
  const total = taxable + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8 font-sans">
      {watermark && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-10 z-0">
          <div className="text-[120px] font-bold text-gray-400 transform rotate-45">ESTIMATE</div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">ESTIMATE</h1>
              <p className="text-blue-100 text-lg">Thank you for your business inquiry</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{estimate.number}</div>
              <div className="text-blue-100">Estimate #</div>
            </div>
          </div>
        </div>

        {/* Company & Client Info */}
        <div className="p-8 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">From</h3>
              <div className="text-lg font-bold text-gray-900">{estimate.company}</div>
              <div className="text-gray-600 mt-2">123 Business Street</div>
              <div className="text-gray-600">Suite 100, City, State 12345</div>
              <div className="text-gray-600">contact@company.com</div>
              <div className="text-gray-600">(555) 123-4567</div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h3>
              <div className="text-lg font-bold text-gray-900">{estimate.customer}</div>
              <div className="text-gray-600 mt-2">Client Company Inc.</div>
              <div className="text-gray-600">456 Client Avenue</div>
              <div className="text-gray-600">City, State 67890</div>
            </div>
          </div>
        </div>

        {/* Estimate Details */}
        <div className="p-8 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-500">Issue Date</div>
              <div className="text-lg font-bold text-gray-900">{estimate.date}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">Valid Until</div>
              <div className="text-lg font-bold text-gray-900">{estimate.validUntil}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-500">Currency</div>
              <div className="text-lg font-bold text-gray-900">{estimate.currency}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700 border-b">Description</th>
                <th className="text-center p-4 font-semibold text-gray-700 border-b">Qty</th>
                <th className="text-right p-4 font-semibold text-gray-700 border-b">Unit Price</th>
                <th className="text-right p-4 font-semibold text-gray-700 border-b">Amount</th>
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4 border-b text-gray-800">{item.description}</td>
                  <td className="p-4 border-b text-center text-gray-600">{item.quantity}</td>
                  <td className="p-4 border-b text-right text-gray-600">{currencyFmt(item.price, estimate.currency)}</td>
                  <td className="p-4 border-b text-right font-semibold text-gray-900">
                    {currencyFmt(item.quantity * item.price, estimate.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="max-w-md ml-auto">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{currencyFmt(subtotal, estimate.currency)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Discount ({estimate.discount}%):</span>
                <span className="font-semibold text-red-600">-{currencyFmt(discountAmount, estimate.currency)}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax ({estimate.taxRate}%):</span>
              <span className="font-semibold">{currencyFmt(tax, estimate.currency)}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-gray-300 mt-2">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-blue-700">{currencyFmt(total, estimate.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {estimate.notes && (
          <div className="p-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
            <p className="text-gray-600">{estimate.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-8 bg-gray-900 rounded-b-2xl text-white text-center">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">
              {estimate.company} • Professional Services
            </div>
            <div className="text-sm text-gray-300">
              This is an estimate, not a binding invoice
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template 2: Minimal Corporate
const MinimalTemplate = ({ estimate, watermark = true }) => {
  const subtotal = estimate.items.reduce((sum, i) => sum + (i.quantity || 0) * (i.price || 0), 0);
  const discountAmount = Math.min(Math.max(estimate.discount, 0), 100) * 0.01 * subtotal;
  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = Math.max(estimate.taxRate, 0) * 0.01 * taxable;
  const total = taxable + tax;

  return (
    <div className="min-h-screen bg-white p-8 font-serif">
      {watermark && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0">
          <div className="text-[100px] font-light text-gray-400 tracking-widest">PROPOSAL</div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto border border-gray-300 relative z-10">
        {/* Header */}
        <div className="border-b border-gray-300 p-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-light tracking-widest">{estimate.company}</div>
              <div className="text-xs text-gray-500 mt-1">PROFESSIONAL SERVICES</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold">ESTIMATE</div>
              <div className="text-sm text-gray-600 mt-1">#{estimate.number}</div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="p-8 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Prepared For</div>
              <div className="text-lg font-semibold">{estimate.customer}</div>
              <div className="text-sm text-gray-600 mt-2">Attn: Project Manager</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Estimate Details</div>
              <div className="text-sm">
                <div>Issued: {estimate.date}</div>
                <div>Valid Until: {estimate.validUntil}</div>
                <div>Currency: {estimate.currency}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="p-8 bg-gray-50 border-b border-gray-300">
          <p className="text-gray-700 italic">
            Thank you for the opportunity to provide this estimate. We&apos;re confident we can deliver exceptional results for your project.
          </p>
        </div>

        {/* Items */}
        <div className="p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left pb-4 font-normal text-gray-600">ITEM</th>
                <th className="text-center pb-4 font-normal text-gray-600">HOURS</th>
                <th className="text-right pb-4 font-normal text-gray-600">RATE</th>
                <th className="text-right pb-4 font-normal text-gray-600">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {estimate.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 text-gray-800">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-500 mt-1">Professional service delivery</div>
                  </td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-600">{currencyFmt(item.price, estimate.currency)}</td>
                  <td className="py-4 text-right font-medium text-gray-900">
                    {currencyFmt(item.quantity * item.price, estimate.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-8 bg-gray-50 border-t border-gray-300">
          <div className="max-w-sm ml-auto">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{currencyFmt(subtotal, estimate.currency)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Professional Discount</span>
                  <span className="text-green-600">-{currencyFmt(discountAmount, estimate.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{currencyFmt(tax, estimate.currency)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>ESTIMATED TOTAL</span>
                  <span>{currencyFmt(total, estimate.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="p-8 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
            <div>
              <div className="font-medium mb-2">Terms & Conditions</div>
              <ul className="space-y-1 text-xs">
                <li>• This estimate is valid for 30 days</li>
                <li>• Payment terms: Net 15 upon invoice</li>
                <li>• 50% deposit required to begin work</li>
                <li>• Additional charges may apply for scope changes</li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Next Steps</div>
              <ul className="space-y-1 text-xs">
                <li>• Review and approve this estimate</li>
                <li>• Sign and return for confirmation</li>
                <li>• We&apos;ll schedule a kickoff meeting</li>
                <li>• Project begins upon deposit receipt</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-900 text-white text-xs">
          <div className="flex justify-between items-center">
            <div>{estimate.company} • www.company.com • contact@company.com</div>
            <div className="text-gray-400">ESTIMATE • NOT AN INVOICE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Selector Component
const TemplateSelector = ({ estimate, onClose, onTemplateSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = React.useState('modern');
  const [showWatermark, setShowWatermark] = React.useState(true);

  // Import the new professional template
  const templates = {
    modern: { name: 'Modern Professional', component: ModernTemplate },
    minimal: { name: 'Corporate Minimal', component: MinimalTemplate },
    professional: { name: 'Professional', component: EstimateProfessional }
  };

  const CurrentTemplate = templates[selectedTemplate].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 mt-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Preview Estimate</h2>
              <p className="text-blue-100">Select a template and preview your estimate</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-4xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option disabled value="Choose Template"> Choose Template</option>
                <option value="modern">Modern Professional</option>
                <option value="minimal">Corporate Minimal</option>
                <option value="professional">Professional</option>
              </select>
              
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Show Watermark
              </label>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Print
              </button>
              <button
                onClick={() => onTemplateSelect(selectedTemplate)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="overflow-auto max-h-[calc(90vh-200px)]">
          <CurrentTemplate estimate={estimate} watermark={showWatermark} />
        </div>
      </div>
    </div>
  );
};

// Updated ReactEstimate component with template functionality
export const EstimateTemplate = () => {
  // State for template preview
  const [showTemplatePreview, setShowTemplatePreview] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState('modern');

  // Dummy data for missing variables
  const company = "Your Company Name";
  const customer = "Customer Name";
  const estimateNo = "EST-001";
  const issueDate = "2025-09-27";
  const validUntil = "2025-10-27";
  const currency = "$";
  const taxRate = 10;
  const discount = 5;
  const notes = "Thank you for considering us.";
  const items = [
    { id: 1, description: "Service A", quantity: 10, price: 100 },
    { id: 2, description: "Service B", quantity: 5, price: 200 }
  ];
  const status = "Draft";

  // Define missing functions
  const saveDraft = () => {
    alert("Draft saved!");
  };
  const convertToInvoice = () => {
    alert("Converted to invoice!");
  };

  const previewEstimate = () => {
    setShowTemplatePreview(true);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplatePreview(false);
    localStorage.setItem('estimate_template', template);
  };

  // Action buttons
  const actionButtons = (
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={saveDraft}
          className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-300 border border-white/20 hover:border-white/30 hover:scale-105 flex items-center shadow-lg"
        >
          <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Draft
        </button>
        
        <button 
          onClick={previewEstimate}
          className="group hidden bg-white/90 hover:bg-white text-blue-700 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 border border-white/30 hover:scale-105 items-center shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview Estimate
        </button>
        
        <button 
          onClick={convertToInvoice}
          className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-300 border border-green-400/30 hover:scale-105 flex items-center shadow-lg hover:shadow-xl"
        >
          <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Convert to Invoice
        </button>
      </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-10 lg:px-[100px] pb-16">
      {actionButtons}
      {showTemplatePreview && (
        <TemplateSelector
          estimate={{
            company,
            customer,
            number: estimateNo,
            date: issueDate,
            validUntil,
            currency,
            taxRate,
            discount,
            notes,
            items,
            status
          }}
          onClose={() => setShowTemplatePreview(false)}
          onTemplateSelect={handleTemplateSelect}
        />
      )}
    </div>
  );
};

export default EstimateTemplate;