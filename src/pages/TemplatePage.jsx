import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    setCurrentTemplate(parseInt(templateNumber));
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={handleBack} className="font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('templatePage.backToSwiftFacture')}
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

        <h1 className="text-3xl font-bold gradient-text mb-6 text-center">
          {t('templatePage.invoicePreview')}
        </h1>

        {/* Side-by-Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Current Template with Data */}
          <div className="flex flex-col">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-4">
              <h3 className="text-lg font-semibold gradient-text text-center">
                {t('templatePage.currentInvoice')}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {templates[currentTemplate - 1]?.name}
              </p>
            </div>
            <div className="w-full aspect-[210/297] border-2 border-border/30 shadow-2xl rounded-xl overflow-hidden bg-white">
              <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
            </div>
          </div>

          {/* Right: Template Selector & Preview */}
          <div className="flex flex-col">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-4">
              <h3 className="text-lg font-semibold gradient-text mb-3 text-center">
                {t('templatePage.chooseTemplate')}
              </h3>
              <Select value={currentTemplate.toString()} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full bg-white border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <SelectValue>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">{templates[currentTemplate - 1]?.name}</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-white">
                  {templates.map((template, index) => (
                    <SelectItem 
                      key={index} 
                      value={(index + 1).toString()}
                      className="cursor-pointer hover:bg-accent/10"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <img 
                          src={`/assets/template${index + 1}-preview.png`}
                          alt={template.name}
                          className="w-12 h-16 object-cover rounded border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Live Preview of Selected Template */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground text-center mb-2">
                {t('templatePage.livePreview')}
              </h3>
            </div>
            <div className="w-full aspect-[210/297] border-2 border-primary/30 shadow-2xl rounded-xl overflow-hidden bg-white ring-2 ring-primary/20">
              <InvoiceTemplate data={formData} templateNumber={currentTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePage;
