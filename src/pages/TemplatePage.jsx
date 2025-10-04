import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, FileText, Plus, Mail, Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generatePDF } from '../utils/pdfGenerator';
import { templates } from '../utils/templateRegistry';


const TemplatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.formData) {
      setFormData(location.state.formData);
      setCurrentTemplate(location.state.selectedTemplate || 1);
    } else {
      // If no form data in location state, try to load from localStorage
      const savedFormData = localStorage.getItem('formData');
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
  }, [location.state]);

  const handleTemplateChange = (templateNumber) => {
    setCurrentTemplate(templateNumber);
  };

  const handleDownloadPDF = async () => {
    if (formData && !isDownloading) {
      setIsDownloading(true);
      try {
        await generatePDF(formData, currentTemplate);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleLoadSampleData = () => {
    const sampleData = {
      billTo: {
        name: "John Doe",
        address: "123 Main St, Anytown, USA",
        phone: "(555) 123-4567",
      },
      shipTo: {
        name: "Jane Smith",
        address: "456 Elm St, Othertown, USA",
        phone: "(555) 987-6543",
      },
      invoice: {
        date: new Date().toISOString().split("T")[0],
        paymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        number: `INV-${Math.floor(Math.random() * 10000)}`,
      },
      yourCompany: {
        name: "Your Company",
        address: "789 Oak St, Businessville, USA",
        phone: "(555) 555-5555",
      },
      items: [
        {
          name: "Product A",
          description: "High-quality item",
          quantity: 2,
          amount: 50,
          total: 100,
        },
        {
          name: "Service B",
          description: "Professional service",
          quantity: 1,
          amount: 200,
          total: 200,
        },
        {
          name: "Product C",
          description: "Another great product",
          quantity: 3,
          amount: 30,
          total: 90,
        },
      ],
      taxPercentage: 10,
      notes: "Thank you for your business!",
      selectedCurrency: "USD",
    };
    setFormData(sampleData);
  };

  const handleCreateNewInvoice = () => {
    navigate('/');
  };

  const handleSendEmail = () => {
    if (formData?.billTo?.name && formData?.invoice?.number) {
      const subject = `Invoice ${formData.invoice.number}`;
      const body = `Dear ${formData.billTo.name},\n\nPlease find attached the invoice ${formData.invoice.number}.\n\nThank you for your business!`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/');
  };

  // Loading simulation
  useEffect(() => {
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

  if (!formData) {
    return <div>{t('templatePage.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Button Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
          {/* Left side buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleBack} className="font-semibold">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t('templatePage.backToSwiftFacture')}
            </Button>
            <Button variant="secondary" onClick={handleLoadSampleData} className="font-semibold">
              <FileText className="mr-2 h-4 w-4" /> {t('templatePage.loadSampleData')}
            </Button>
            <Button variant="default" onClick={handleCreateNewInvoice} className="font-semibold">
              <Plus className="mr-2 h-4 w-4" /> {t('templatePage.createNewInvoice')}
            </Button>
          </div>
          
          {/* Right side action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleSendEmail} className="font-semibold">
              <Mail className="mr-2 h-4 w-4" /> {t('templatePage.sendEmail')}
            </Button>
            <Button variant="outline" onClick={handlePrint} className="font-semibold">
              <Printer className="mr-2 h-4 w-4" /> {t('templatePage.printInvoice')}
            </Button>
            <Button 
              variant="accent" 
              onClick={handleDownloadPDF} 
              disabled={isDownloading}
              className="font-semibold"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('templatePage.generatingPDF')}
                </>
              ) : (
                t('templatePage.downloadPDF')
              )}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-4 text-center">
            {t('templatePage.invoicePreview')}
          </h1>
          <div className="card-modern bg-blue-200">
            <h3 className="text-lg font-semibold gradient-text mb-4">{t('templatePage.chooseTemplateStyle')}</h3>
            <div className="flex flex-wrap gap-3">
              {templates.map((template, index) => (
                <Button
                  key={index}
                  variant={currentTemplate === index + 1 ? "default" : "outline"}
                  onClick={() => handleTemplateChange(index + 1)}
                  className="font-semibold"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[210mm] h-[297mm] mx-auto border-2 border-border/30 shadow-2xl rounded-xl overflow-hidden bg-white">
          <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
        </div>
      </div>
    </div>
  );
};

export default TemplatePage;
