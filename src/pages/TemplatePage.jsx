import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import InvoiceTemplate from '../components/InvoiceTemplate';
import { generatePDF } from '../utils/pdfGenerator';
import { templates } from '../utils/templateRegistry';


const TemplatePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleBack = () => {
    navigate('/');
  };

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={handleBack} className="font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to PayFlow
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
                Generating PDF...
              </>
            ) : (
              "Download PDF"
            )}
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-4 text-center">
            Invoice Preview
          </h1>
          <div className="card-modern bg-blue-200">
            <h3 className="text-lg font-semibold gradient-text mb-4">Choose Template Style</h3>
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
