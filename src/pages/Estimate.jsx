"use client";

import * as React from "react";
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EstimateTemplate from "@/components/templates/EstimateTemplate";
import EstimateProfessional from "@/components/templates/EstimateProfessional";
import SmartCustomerSelector from "@/components/SmartCustomerSelector";

import html2canvas from "html2canvas";
import { estimateService } from "@/services/estimateService";
import { jsPDF } from "jspdf";
// ...existing code...

const currencyFmt = (n, currency = "€") => `${currency}${n.toFixed(2)}`;

export const Estimate = () => {
  // Success message state
  const [successMsg, setSuccessMsg] = React.useState("");
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [showTemplatePreview, setShowTemplatePreview] = React.useState(false);
  // Convert to Invoice (finalize estimate)
  const convertToInvoice = () => {
    const newInvoice = {
      number: estimateNo,
      date: issueDate,
      customer,
      total,
      currency,
      status: "sent",
      notes,
      items,
      validUntil,
      company,
    };
    let all = [];
    try {
      const raw = localStorage.getItem("saved_invoices");
      if (raw) all = JSON.parse(raw);
    } catch {
      // Ignore errors
    }
    const idx = all.findIndex((e) => e.number === newInvoice.number);
    if (idx !== -1) {
      all[idx] = newInvoice;
    } else {
      all.push(newInvoice);
    }
    localStorage.setItem("saved_invoices", JSON.stringify(all));
    fetchInvoices();
    resetForm();
    setShowForm(false);
  };
  // Edit estimate
  const editEstimate = (number) => {
    const raw = localStorage.getItem("saved_invoices");
    if (!raw) return;
    try {
      const all = JSON.parse(raw);
      const est = all.find((e) => e.number === number);
      if (est) {
        setCompany(est.company);
        setCustomer(est.customer);
        setEstimateNo(est.number);
        setIssueDate(est.date);
        setValidUntil(est.validUntil);
        setCurrency(est.currency);
        setTaxRate(est.taxRate || 24);
        setDiscount(est.discount || 0);
        setNotes(est.notes || "");
        setStatus(est.status);
        setItems(est.items || []);
        setShowForm(true);
      }
    } catch {
      // Ignore errors
    }
  };
  const previewEstimate = () => {
    setShowTemplatePreview(true);
  };
  // Delete estimate
  const deleteEstimate = async (id) => {
    const { error } = await estimateService.deleteEstimate(id);
    if (!error) fetchInvoices();
    else setSuccessMsg('Error deleting estimate: ' + error.message);
  };

  // Change status
  const changeStatus = async (id, newStatus) => {
    const { error } = await estimateService.updateEstimateStatus(id, newStatus);
    if (!error) fetchInvoices();
    else setSuccessMsg('Error updating status: ' + error.message);
  };
  // Form visibility and edit state
  const [showForm, setShowForm] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editNumber, setEditNumber] = React.useState(null);
  // Helper to reset form
  const resetForm = () => {
    setCompany("");
    setCustomer("");
    setEstimateNo("");
    setIssueDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().slice(0, 10));
  setCurrency("EUR");
    setTaxRate(24);
    setDiscount(0);
    setNotes("");
    setStatus("draft");
    setItems([
      {
        id: crypto.randomUUID(),
        description: "Consulting",
        quantity: 1,
        price: 100,
      },
    ]);
    setEditMode(false);
    setEditNumber(null);
  };
  // --- Fetch and display all saved invoices ---
  const [invoices, setInvoices] = React.useState([]);
  // Helper to get all saved estimates from localStorage
  // Fetch estimates from Supabase
  const fetchInvoices = async () => {
    const { data, error } = await estimateService.getAllEstimates();
    if (error || !data) {
      setInvoices([]);
    } else {
      setInvoices(data);
    }
  };
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currencyFilter, setCurrencyFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");

  React.useEffect(() => {
    fetchInvoices();
  }, []);
  // Save as draft
  const saveDraft = async () => {
    const estimateData = {
      estimate_number: estimateNo,
      date: issueDate,
      customer_id: selectedCustomer?.id || null,
      status,
      total,
      currency,
      notes,
      items,
      valid_until: validUntil,
      company,
    };
    const { error } = await estimateService.createEstimate(estimateData);
    if (error) {
      setSuccessMsg("Error saving estimate: " + error.message);
    } else {
      setSuccessMsg("Estimate saved as draft successfully!");
      fetchInvoices();
    }
  };

  // Save as finalized invoice
  const saveInvoice = () => {
    const newInvoice = {
      number: estimateNo,
      date: issueDate,
      customer,
      total,
      currency,
      status: "sent",
      notes,
      items,
      validUntil,
      company,
    };
    let all = [];
    try {
      const raw = localStorage.getItem("saved_invoices");
      if (raw) all = JSON.parse(raw);
    } catch {
      // Ignore errors in saveInvoice
    }
    const idx = all.findIndex((e) => e.number === newInvoice.number);
    if (idx !== -1) {
      all[idx] = newInvoice;
    } else {
      all.push(newInvoice);
    }
    localStorage.setItem("saved_invoices", JSON.stringify(all));
    fetchInvoices();
    setSuccessMsg("Estimate finalized and saved successfully!");
  };

  // Download as PDF (functional)
  const downloadPDF = async () => {
    const element = document.querySelector('.estimate-preview');
    if (!element) {
      setSuccessMsg('Estimate preview not found');
      return;
    }
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    const imgData = canvas.toDataURL('image/png');
    // Strict A4 size: 210 x 297 mm
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${estimateNo || 'estimate'}.pdf`);
    setSuccessMsg('Estimate downloaded as PDF successfully!');
  };

  // Send estimate (stub)
  const sendEstimate = () => {
    // TODO: Integrate with email API
    openSoon("Send Estimate");
    saveInvoice();
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.number && inv.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.customer && inv.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.notes && inv.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCurrency =
      currencyFilter === "All" || inv.currency === currencyFilter;
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesSearch && matchesCurrency && matchesStatus;
  });

  // --- UI Section for invoices ---
  // Basic meta
  const [company, setCompany] = React.useState("My Company Ltd");
  const [customer, setCustomer] = React.useState("Acme Oy");
  const [selectedCustomer, setSelectedCustomer] = React.useState(null);
  const [isManualCustomerMode, setIsManualCustomerMode] = React.useState(false);

  const [estimateNo, setEstimateNo] = React.useState("EST-0001");
  const [issueDate, setIssueDate] = React.useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [validUntil, setValidUntil] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [currency, setCurrency] = React.useState("EUR");
  const [taxRate, setTaxRate] = React.useState(24);
  const [discount, setDiscount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [status, setStatus] = React.useState("draft");
  const [items, setItems] = React.useState([
    {
      id: crypto.randomUUID(),
      description: "Consulting",
      quantity: 1,
      price: 100,
    },
  ]);

  // Load draft once
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("react_estimate_draft");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setCompany(parsed.company ?? company);
      setCustomer(parsed.customer ?? customer);
      setEstimateNo(parsed.estimateNo ?? estimateNo);
      setIssueDate(parsed.issueDate ?? issueDate);
      setValidUntil(parsed.validUntil ?? validUntil);
      setCurrency(parsed.currency ?? currency);
      setTaxRate(typeof parsed.taxRate === "number" ? parsed.taxRate : taxRate);
      setDiscount(
        typeof parsed.discount === "number" ? parsed.discount : discount
      );
      setNotes(parsed.notes ?? notes);
      setStatus(parsed.status ?? status);
      if (Array.isArray(parsed.items) && parsed.items.length)
        setItems(parsed.items);
    } catch {
      // Ignore errors loading draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed unused persist function

  const clearDraft = () => {
    try {
      localStorage.removeItem("react_estimate_draft");
    } catch {
      // Ignore errors clearing draft
    }
  };

  // Items ops
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: 1, price: 0 },
    ]);
  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));
  const duplicateItem = (id) =>
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: crypto.randomUUID() };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  // Totals
  const subtotal = items.reduce(
    (sum, i) => sum + (i.quantity || 0) * (i.price || 0),
    0
  );
  const discountAmount = Math.min(Math.max(discount, 0), 100) * 0.01 * subtotal;
  const taxable = Math.max(subtotal - discountAmount, 0);
  const tax = Math.max(taxRate, 0) * 0.01 * taxable;
  const total = taxable + tax;

  // Coming soon dialog
  const [comingSoonOpen, setComingSoonOpen] = React.useState(false);
  const [comingSoonAction, setComingSoonAction] = React.useState("");
  const openSoon = (action) => {
    setComingSoonAction(action);
    setComingSoonOpen(true);
  };

  const loadSample = () => {
    const sampleItems = [
      {
        id: crypto.randomUUID(),
        description: "Design work",
        quantity: 10,
        price: 75,
      },
      {
        id: crypto.randomUUID(),
        description: "Development",
        quantity: 20,
        price: 90,
      },
      {
        id: crypto.randomUUID(),
        description: "Hosting (3 months)",
        quantity: 1,
        price: 60,
      },
    ];
    setCompany("Griffin Techs");
    setCustomer("Isiah Griffin");
    setEstimateNo(`EST-${Math.floor(1000 + Math.random() * 9000)}`);
    setIssueDate(new Date().toISOString().slice(0, 10));
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setValidUntil(d.toISOString().slice(0, 10));
  setCurrency("USD");
    setTaxRate(24);
    setDiscount(5);
    setNotes("This estimate is valid for 30 days. Thank you!");
    setItems(sampleItems);
    setStatus("draft");
  };

  // Handle customer selection from Smart Customer Selector
  const handleCustomerSelect = (customerData) => {
    setSelectedCustomer(customerData);
    if (customerData) {
      setCustomer(customerData.name || '');
      if (customerData.company) setCompany(customerData.company);
      if (customerData.email) setNotes(`Email: ${customerData.email}`);
      // Add more fields as needed
    }
  };

  // Handle manual customer mode toggle
  const handleManualModeChange = (isManual) => {
    setIsManualCustomerMode(isManual);
    if (!isManual) {
      setSelectedCustomer(null);
      setCustomer("Acme Oy");
    }
  };



  // Loading simulation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      {successMsg && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-lg font-semibold animate-fade-in">
          {successMsg}
          <button className="ml-4 text-green-600 hover:text-green-900" onClick={() => setSuccessMsg("")}>×</button>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 pt-6">
          <h1 className="text-3xl font-bold text-black mb-2">
            {t('estimatePage.title')}
          </h1>
          <p className="text-gray-600">
            {t('estimatePage.subtitle')}
          </p>
        </div>


        {/* Create New Invoice Button */}
        {!showForm && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('estimatePage.createNewEstimate')}
            </button>
               
          </div>
        )}

        {/* Saved Estimates Section */}
        <section className="mb-8 rounded-2xl bg-white shadow-xl border border-blue-100 overflow-hidden">
       <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 rounded-xl shadow-2xl">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
  </div>
  
  {/* Animated Orbs */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce"></div>
  
  {/* Content */}
  <div className="relative z-10">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div className="mb-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t('estimatePage.savedEstimates')}
        </h2>
        <p className="text-blue-100 opacity-90">
          {t('estimatePage.manageExistingEstimates')}
        </p>
      </div>
      <EstimateTemplate />
    </div>
  </div>
</div>

          <div className="p-6">
            <div className="mb-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="relative flex-1 max-w-md">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('estimatePage.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-black focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">{t('estimatePage.filterByCurrency')}</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {["All", "draft", "sent", "accepted", "declined"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        statusFilter === s
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {filteredInvoices.length}
                </div>
                <div className="text-sm text-gray-600">{t('estimatePage.total')}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {filteredInvoices.filter((i) => i.status === "draft").length}
                </div>
                <div className="text-sm text-gray-600">{t('estimatePage.pending')}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {filteredInvoices.filter((i) => i.status === "sent").length}
                </div>
                <div className="text-sm text-gray-600">{t('estimatePage.sent')}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">
                  {
                    filteredInvoices.filter((i) => i.status === "accepted")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">{t('estimatePage.accepted')}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-700">
                  {
                    filteredInvoices.filter((i) => i.status === "declined")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">{t('estimatePage.declined')}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-700">
                  $
                  {filteredInvoices
                    .reduce((sum, i) => sum + i.total, 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">{t('estimatePage.totalValue')}</div>
              </div>
            </div>

            {/* Estimates Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">#</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">{t('estimatePage.number')}</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">{t('estimatePage.date')}</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">{t('estimatePage.customer')}</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">{t('estimatePage.total')}</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">{t('estimatePage.status')}</th>
                    <th className="py-4 px-4 font-semibold text-gray-700 text-left">{t('estimatePage.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        <svg
                          className="w-12 h-12 mx-auto text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        No estimates found. Create your first estimate to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv, idx) => {
                      let customerName = inv.customer;
                      if (!customerName && inv.customers && inv.customers.name) {
                        customerName = inv.customers.name;
                      }
                      return (
                        <tr key={inv.number} className="hover:bg-blue-50 transition-colors">
                          <td className="py-4 px-4 font-mono font-semibold text-blue-700">{idx + 1}</td>
                          <td className="py-4 px-4 font-mono font-semibold text-blue-700">{inv.number}</td>
                          <td className="py-4 px-4 text-gray-600">{inv.date}</td>
                          <td className="py-4 px-4 font-semibold text-black">{customerName}</td>
                          <td className="py-4 px-4 font-bold text-blue-700">{currencyFmt(inv.total, inv.currency)}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              inv.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : inv.status === "sent"
                                ? "bg-blue-100 text-blue-800"
                                : inv.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 items-center">
                              {/* View Estimate */}
                              <button
                                onClick={() => {
                                  setShowTemplatePreview(true);
                                  setCompany(inv.company);
                                  setCustomer(customerName);
                                  setEstimateNo(inv.number);
                                  setIssueDate(inv.date);
                                  setValidUntil(inv.validUntil);
                                  setCurrency(inv.currency);
                                  setTaxRate(inv.taxRate || 24);
                                  setDiscount(inv.discount || 0);
                                  setNotes(inv.notes || "");
                                  setStatus(inv.status);
                                  setItems(inv.items || []);
                                }}
                                className="text-purple-600 hover:text-purple-800 p-2 rounded hover:bg-purple-50 transition-colors"
                                title={t('estimatePage.preview')}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              {/* Edit Estimate */}
                              <button
                                onClick={() => {
                                  editEstimate(inv.number);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                                title={t('estimatePage.edit')}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {/* Delete Estimate */}
                              <button
                                onClick={() => deleteEstimate(inv.id)}
                                className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                                title={t('estimatePage.delete')}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {/* Status Dropdown */}
                              <select
                                value={inv.status}
                                onChange={(e) => changeStatus(inv.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="accepted">Accepted</option>
                                <option value="declined">Declined</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        
        {/* Estimate Form Section */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {editMode
                    ? `Edit Estimate (${editNumber})`
                    : "Create New Estimate"}
                </h2>
                <div className="flex gap-3">
                      <button
                    onClick={previewEstimate}
                    className="bg-white/90 hover:bg-white text-blue-700 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 border border-white/30 hover:scale-105 flex items-center shadow-lg hover:shadow-xl"
                  >
                    Preview Estimate
                  </button>
                  <button
                    onClick={saveDraft}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={convertToInvoice}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Convert to Invoice
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
            
{showTemplatePreview && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 py-10">
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-2 md:p-8 animate-fade-in" style={{maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto'}}>
      <button
        onClick={() => setShowTemplatePreview(false)}
        className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-2 shadow transition-colors"
        title={t('estimatePage.closePreview')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="estimate-preview">
        <EstimateProfessional estimate={{
          company: { name: company },
          customer: { name: customer },
          number: estimateNo,
          date: issueDate,
          validUntil,
          currency,
          taxRate,
          discount,
          notes,
          items,
          status
        }} />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          Download PDF
        </button>
        <button
          onClick={saveDraft}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition-all"
        >
          Save Estimate
        </button>
      </div>
    </div>
  </div>
)}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Details Card */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t('estimatePage.estimateDetails')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('estimatePage.company')}
                        </label>
                        <input
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <SmartCustomerSelector
                          onCustomerSelect={handleCustomerSelect}
                          selectedCustomer={selectedCustomer}
                          onManualModeChange={handleManualModeChange}
                          isManualMode={isManualCustomerMode}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('estimatePage.estimateNumber')}
                        </label>
                        <input
                          value={estimateNo}
                          onChange={(e) => setEstimateNo(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('estimatePage.issueDate')}
                          </label>
                          <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('estimatePage.validUntil')}
                          </label>
                          <input
                            type="date"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('estimatePage.currency')}
                          </label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('estimatePage.taxPercent')}
                          </label>
                          <input
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('estimatePage.discountPercent')}
                          </label>
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) =>
                              setDiscount(Number(e.target.value))
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Card */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        {t('estimatePage.items')}
                      </h3>
                      <button
                        onClick={addItem}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {t('estimatePage.addItem')}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => {
                        const line = (item.quantity || 0) * (item.price || 0);
                        return (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                              <div className="md:col-span-5">
                                <input
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(item.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Item description"
                                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(item.id, {
                                      quantity: Number(e.target.value),
                                    })
                                  }
                                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="md:col-span-3">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateItem(item.id, {
                                      price: Number(e.target.value),
                                    })
                                  }
                                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="md:col-span-1 text-right font-semibold text-blue-700">
                                {currencyFmt(line, currency)}
                              </div>
                              <div className="md:col-span-1 flex gap-2 justify-end">
                                <button
                                  onClick={() => duplicateItem(item.id)}
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                  title="Duplicate"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                  title="Remove"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes Card */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      Notes
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional details for the customer..."
                    />
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Summary</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          status === "accepted"
                            ? "bg-green-500"
                            : status === "declined"
                            ? "bg-red-500"
                            : status === "sent"
                            ? "bg-blue-400"
                            : "bg-gray-400"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-blue-100">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          {currencyFmt(subtotal, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-blue-100">
                        <span>Discount</span>
                        <span className="font-medium">
                          -{currencyFmt(discountAmount, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-blue-100">
                        <span>Tax ({taxRate}%)</span>
                        <span className="font-medium">
                          {currencyFmt(tax, currency)}
                        </span>
                      </div>
                      <div className="border-t border-blue-400 pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>{currencyFmt(total, currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Card */}
<div className="relative bg-gradient-to-br from-white via-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
  {/* Decorative Elements */}
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200 to-amber-200 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"></div>
  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-200 to-amber-200 rounded-full opacity-30 translate-y-1/2 -translate-x-1/2"></div>
  
  <div className="relative z-10">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
        Estimate Actions
      </h3>
      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="space-y-4">
      {/* Save Draft Button */}
      <button
        onClick={saveDraft}
        className="group w-full bg-white border-2 border-orange-200 text-orange-700 px-4 py-2 rounded-xl hover:bg-orange-50 hover:border-orange-300 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
      >
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
          <svg className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold">Save as Draft</div>
          <div className="text-xs text-orange-500 opacity-80 font-bold">Save for later editing</div>
        </div>
        <svg className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Download & Save Buttons on Preview */}
      <button
        onClick={downloadPDF}
        className="group w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
      >
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold">Download PDF</div>
          <div className="text-xs text-white/80 font-bold">Professional format</div>
        </div>
        <svg className="w-3 h-3 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    

      {/* Send Email Button */}
      <button
        onClick={sendEstimate}
        className="group w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
      >
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="text-left flex-1">
          <div className="font-semibold">Send by Email</div>
          <div className="text-xs text-white/80 font-bold">Direct to client</div>
        </div>
        <svg className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={clearDraft}
          className="group bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Draft
        </button>
        
        <button
          onClick={loadSample}
          className="group bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Load Sample
        </button>
      </div>
    </div>
  </div>
</div>

                  {/* Bill To Card */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-black mb-3">
                      Bill To
                    </h3>
                    <p className="text-gray-600 mb-4">{customer}</p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Estimate No:</span>
                        <span className="font-mono font-semibold">
                          {estimateNo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issue Date:</span>
                        <span>{issueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid Until:</span>
                        <span>{validUntil}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coming soon dialog */}
        <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
          <DialogContent className="sm:max-w-md bg-white rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {comingSoonAction} – Coming soon
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-600">
                This feature will be available shortly. For now, you can save
                your estimate as a draft and continue working.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                onClick={() => setComingSoonOpen(false)}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Got it
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Estimate;
