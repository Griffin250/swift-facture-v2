import { } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';


const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      
      <div className="container mx-auto px-4 py-12">
        <div className="p-8 bg-gradient-to-br  rounded-md">
          <h1 className="text-3xl font-bold mb-4">About PayFlow</h1>

          <p className="mb-6 text-muted-foreground">
            PayFlow is a lightweight web app for creating professional invoices and receipts quickly. It provides editable templates, easy PDF generation, and a simple form-driven workflow so you can create and share documents in seconds.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Key Features</h2>
          <ul className="list-disc list-inside mb-4 text-muted-foreground">
            <li>Multiple invoice and receipt templates with live preview</li>
            <li>Fill-in form for Bill To / Ship To, itemized line items, tax and totals</li>
            <li>Generate downloadable PDF for invoices and receipts</li>
            <li>Save draft data in your browser (localStorage) for later editing</li>
            <li>Responsive layout suitable for desktop and mobile</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">How to use</h2>
          <ol className="list-decimal list-inside mb-4 text-muted-foreground">
            <li className="mb-2">
              Start on the Dashboard or click &quot;New Invoice&quot; to open the invoice editor.
            </li>
            <li className="mb-2">
              Fill in the <strong>Bill To</strong> and <strong>Ship To</strong> sections with the customer&apos;s details.
            </li>
            <li className="mb-2">
              Add item rows using the &quot;Add Item&quot; button. For each row, enter the description, quantity, and unit price — totals update automatically.
            </li>
            <li className="mb-2">
              Set tax percentage if applicable. The app calculates tax and grand total for you.
            </li>
            <li className="mb-2">
              Choose a template under &quot;Choose Template Style&quot; to preview different looks. Templates are optimized for printing and PDF export.
            </li>
            <li className="mb-2">
              Click &quot;Download PDF&quot; on the preview page to generate a PDF you can save or email.
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Generating Receipts</h2>
          <p className="text-muted-foreground mb-4">
            To create a receipt, use the Receipt Generator (top-right on Dashboard or via the navigation). The flow is similar to invoices: fill the purchaser information, add items, and produce a printable receipt PDF. Receipts are ideal for point-of-sale acknowledgements.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Templates</h2>
          <p className="text-muted-foreground mb-4">
            Templates in PayFlow are built to be simple to customize. Selecting a template changes layout and styling; your form data is reused across templates so you can switch styles without losing data.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-2">Tips & Best Practices</h2>
          <ul className="list-disc list-inside mb-4 text-muted-foreground">
            <li>Save drafts locally — PayFlow stores form data in your browser so you don&apos;t lose progress.</li>
            <li>Use descriptive line items to improve clarity for clients.</li>
            <li>Check tax and currency settings before generating the final PDF.</li>
            <li>Preview templates on both desktop and mobile to ensure proper layout before sharing.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-2">FAQ</h2>
          <div className="space-y-3 text-muted-foreground">
            <div>
              <strong>Q: Where is my data stored?</strong>
              <p>Your data is stored in your browser localStorage — it never leaves your machine unless you explicitly export or share the generated PDF.</p>
            </div>
            <div>
              <strong>Q: Can I customize templates?</strong>
              <p>At the moment, templates are prebuilt. You can switch between them to get different looks. Future versions may include custom style editing.</p>
            </div>
            <div>
              <strong>Q: Are generated PDFs secure?</strong>
              <p>PDFs are generated client-side from your data; secure sharing depends on how you distribute the file (email, secure drive, etc.).</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={() => navigate('/')} className="px-4">Back to Dashboard</Button>
            <Button onClick={() => navigate('/invoice')} variant="outline" className="px-4">Create Invoice</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
