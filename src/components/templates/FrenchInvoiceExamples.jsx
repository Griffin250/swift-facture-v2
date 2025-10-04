import FrenchInvoiceTemplate from '../components/templates/FrenchInvoiceTemplate';

// Example 1: Complete invoice with all sections
const CompleteInvoiceExample = () => {
  const invoiceData = {
    number: 'FACT-2024-001',
    date: '2024-10-04',
    dueDate: '2024-11-04',
    operationType: 'Vente de marchandises',
    orderNumber: 'CMD-2024-001',
    sender: {
      name: 'Mon Entreprise SARL',
      address: '123 Rue de la République',
      postalCode: '75001',
      city: 'Paris',
      phone: '+33 1 23 45 67 89',
      email: 'contact@monentreprise.fr',
      siret: '12345678901234',
      tva: 'FR12345678901'
    },
    receiver: {
      name: 'Client SARL',
      address: '456 Avenue des Champs',
      postalCode: '69000',
      city: 'Lyon',
      phone: '+33 4 12 34 56 78',
      email: 'contact@client.fr'
    },
    items: [
      {
        description: 'Prestation de conseil',
        date: '2024-10-01',
        quantity: 5,
        unit: 'heure',
        unitPrice: 80.00,
        vatRate: 20,
        amount: 400.00
      }
    ],
    payment: {
      bank: 'Banque Populaire',
      iban: 'FR76 1234 5678 9012 3456 789',
      bic: 'CCBPFRPPXXX'
    },
    notes: 'Merci de votre confiance.',
    terms: 'Conditions générales de vente disponibles sur notre site web.'
  };

  return (
    <FrenchInvoiceTemplate 
      invoiceData={invoiceData}
      showInvoiceNumber={true}
      showDueDate={true}
      showOperationType={true}
      showOrderNumber={true}
      showSenderInfo={true}
      showReceiverInfo={true}
      showTotals={true}
      showPaymentInfo={true}
      showFooter={true}
      showNotes={true}
      showTerms={true}
      hideColumns={[]}
      currency="€"
      locale="fr-FR"
      enablePdfExport={true}
    />
  );
};

// Example 2: Simplified invoice without some columns and sections
const SimplifiedInvoiceExample = () => {
  const invoiceData = {
    number: 'FACT-2024-002',
    date: '2024-10-04',
    sender: {
      name: 'Freelance Services',
      address: '789 Rue Simple',
      postalCode: '33000',
      city: 'Bordeaux',
      email: 'freelance@example.fr'
    },
    receiver: {
      name: 'Client Simple',
      address: '321 Avenue Basic',
      postalCode: '13000',
      city: 'Marseille',
      email: 'client@simple.fr'
    },
    items: [
      {
        description: 'Développement web',
        quantity: 1,
        unitPrice: 1200.00,
        vatRate: 20,
        amount: 1200.00
      }
    ]
  };

  return (
    <FrenchInvoiceTemplate 
      invoiceData={invoiceData}
      showInvoiceNumber={true}
      showDueDate={false}
      showOperationType={false}
      showOrderNumber={false}
      showSenderInfo={true}
      showReceiverInfo={true}
      showTotals={true}
      showPaymentInfo={false}
      showFooter={false}
      hideColumns={['Date', 'Unit', 'VAT']}
      currency="€"
      locale="fr-FR"
    />
  );
};

// Example 3: Quote/Estimate format
const QuoteExample = () => {
  const quoteData = {
    number: 'DEVIS-2024-001',
    date: '2024-10-04',
    dueDate: '2024-10-18',
    operationType: 'Devis',
    sender: {
      name: 'Agence Créative',
      address: '555 Boulevard Design',
      postalCode: '69000',
      city: 'Lyon',
      phone: '+33 4 56 78 90 12',
      email: 'contact@agence-creative.fr'
    },
    receiver: {
      name: 'Startup Innovante',
      address: '777 Rue Innovation',
      postalCode: '75011',
      city: 'Paris',
      email: 'contact@startup-innovante.fr'
    },
    items: [
      {
        description: 'Conception logo et identité visuelle',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 800.00,
        vatRate: 20,
        amount: 800.00
      },
      {
        description: 'Développement site web responsive',
        quantity: 1,
        unit: 'forfait',
        unitPrice: 2500.00,
        vatRate: 20,
        amount: 2500.00
      }
    ],
    notes: 'Ce devis est valable 30 jours. Un acompte de 50% sera demandé au démarrage.'
  };

  return (
    <FrenchInvoiceTemplate 
      invoiceData={quoteData}
      showInvoiceNumber={true}
      showDueDate={true}
      showOperationType={true}
      showOrderNumber={false}
      showSenderInfo={true}
      showReceiverInfo={true}
      showTotals={true}
      showPaymentInfo={false}
      showFooter={true}
      showNotes={true}
      showTerms={false}
      hideColumns={['Date']}
      currency="€"
      locale="fr-FR"
    />
  );
};

export { CompleteInvoiceExample, SimplifiedInvoiceExample, QuoteExample };