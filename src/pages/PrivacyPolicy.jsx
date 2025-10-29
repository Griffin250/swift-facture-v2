import { Link } from "react-router-dom";
import LegalLayout from "../components/legal/LegalLayout";
import TableOfContents from "../components/legal/TableOfContents";
import SectionHeading from "../components/legal/SectionHeading";

const PrivacyPolicy = () => {
  const lastUpdated = "2024-10-29";
  
  const breadcrumbs = [
    { label: "Privacy Policy" }
  ];

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "data-collection", title: "Data We Collect" },
    { id: "data-usage", title: "How We Use Data" },
    { id: "data-retention", title: "Data Retention" },
    { id: "data-security", title: "Data Security" },
    { id: "data-sharing", title: "Data Sharing" },
    { id: "international-transfers", title: "International Data Transfers" },
    { id: "your-rights", title: "Your Rights" },
    { id: "children-privacy", title: "Children's Privacy" },
    { id: "policy-changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" }
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated={lastUpdated}
      breadcrumbs={breadcrumbs}
    >
      <TableOfContents sections={sections} />
      
      <div className="prose max-w-none">
        <SectionHeading id="introduction" level={2}>
          1. Introduction
        </SectionHeading>
        <p className="mb-4">
          SwiftFacture is committed to protecting your privacy and ensuring the security of your personal data. 
          This Privacy Policy explains how we collect, use, process, and protect your information when you use our 
          invoice generation and business management services.
        </p>
        <p className="mb-6">
          We comply with the EU General Data Protection Regulation (GDPR), the ePrivacy Directive, and applicable 
          international privacy laws including the California Consumer Privacy Act (CCPA) and Brazil's Lei Geral 
          de Proteção de Dados (LGPD). Our services are designed with privacy by design principles to ensure 
          your data is protected at every step.
        </p>

        <SectionHeading id="data-collection" level={2}>
          2. Data We Collect
        </SectionHeading>
        <p className="mb-4">We collect and process the following categories of personal data:</p>
        
        <h3 className="text-lg font-semibold mb-3">Account Information</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Name, email address, and contact information</li>
          <li>Business information (company name, address, tax identification)</li>
          <li>Profile picture and preferences</li>
          <li>Account authentication data</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">Financial and Billing Data</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Payment information processed through Stripe (we do not store credit card details)</li>
          <li>Subscription and billing history</li>
          <li>Invoice and estimate data you create</li>
          <li>Customer information you input for invoicing</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">Usage and Technical Data</h3>
        <ul className="mb-6 list-disc pl-6 space-y-1">
          <li>Application usage logs and analytics</li>
          <li>Device information (browser, operating system, IP address)</li>
          <li>Performance and error logs for service improvement</li>
          <li>Session data and authentication tokens</li>
        </ul>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Cookie Notice:</strong> We use minimal, essential cookies for authentication and functionality. 
            We do not use tracking cookies or third-party marketing cookies without your explicit consent.
          </p>
        </div>

        <SectionHeading id="data-usage" level={2}>
          3. How We Use Data
        </SectionHeading>
        <p className="mb-4">
          We process your personal data based on the following legal grounds under GDPR:
        </p>

        <h3 className="text-lg font-semibold mb-3">Contract Performance (Article 6(1)(b) GDPR)</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Providing invoice generation and business management services</li>
          <li>Processing payments and managing subscriptions</li>
          <li>Delivering customer support and technical assistance</li>
          <li>Managing your account and user preferences</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">Legal Obligation (Article 6(1)(c) GDPR)</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Compliance with accounting and tax regulations</li>
          <li>Fraud prevention and financial crime detection</li>
          <li>Responding to legal requests and court orders</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">Legitimate Interest (Article 6(1)(f) GDPR)</h3>
        <ul className="mb-6 list-disc pl-6 space-y-1">
          <li>Improving our services and user experience</li>
          <li>Security monitoring and threat detection</li>
          <li>Analytics for business optimization</li>
          <li>Communication about service updates and new features</li>
        </ul>

        <SectionHeading id="data-retention" level={2}>
          4. Data Retention
        </SectionHeading>
        <p className="mb-4">
          We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
        </p>
        <ul className="mb-6 list-disc pl-6 space-y-2">
          <li><strong>Account Data:</strong> Retained while your account is active and for 3 years after closure for legal compliance</li>
          <li><strong>Financial Records:</strong> Retained for 7 years as required by accounting regulations</li>
          <li><strong>Usage Logs:</strong> Retained for 12 months for security and service improvement purposes</li>
          <li><strong>Marketing Data:</strong> Deleted immediately upon withdrawal of consent</li>
        </ul>

        <SectionHeading id="data-security" level={2}>
          5. Data Security
        </SectionHeading>
        <p className="mb-4">
          We implement comprehensive security measures to protect your personal data:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-2">
          <li><strong>Encryption:</strong> All data is encrypted at rest and in transit using industry-standard protocols</li>
          <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication for administrative functions</li>
          <li><strong>Infrastructure:</strong> Hosted on secure cloud infrastructure with regular security audits</li>
          <li><strong>Monitoring:</strong> Continuous security monitoring and incident response procedures</li>
        </ul>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>EU Data Hosting:</strong> Your data is primarily processed and stored within the European Union 
            to ensure compliance with GDPR data localization requirements.
          </p>
        </div>

        <SectionHeading id="data-sharing" level={2}>
          6. Data Sharing
        </SectionHeading>
        <p className="mb-4">
          We share your personal data only with trusted service providers under strict contractual agreements:
        </p>

        <h3 className="text-lg font-semibold mb-3">Service Providers</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li><strong>Supabase:</strong> Database hosting and authentication services</li>
          <li><strong>Stripe:</strong> Payment processing (covered by their DPA)</li>
          <li><strong>Cloud Infrastructure:</strong> Hosting services with EU-based data centers</li>
        </ul>

        <p className="mb-6">
          All service providers have signed Data Processing Agreements (DPAs) and are required to maintain 
          GDPR-compliant data protection standards. <strong>We never sell your personal data to third parties.</strong>
        </p>

        <SectionHeading id="international-transfers" level={2}>
          7. International Data Transfers
        </SectionHeading>
        <p className="mb-4">
          Your personal data is primarily stored and processed within the European Union. When data must be 
          transferred outside the EU/EEA, we ensure adequate protection through:
        </p>
        <ul className="mb-6 list-disc pl-6 space-y-1">
          <li>European Commission adequacy decisions</li>
          <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
          <li>Binding Corporate Rules or certification schemes</li>
          <li>Your explicit consent where required</li>
        </ul>

        <SectionHeading id="your-rights" level={2}>
          8. Your Rights
        </SectionHeading>
        <p className="mb-4">
          Under GDPR and other applicable privacy laws, you have the following rights regarding your personal data:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Right of Access</h4>
            <p className="text-sm text-gray-600">Request a copy of your personal data we process</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Right to Rectification</h4>
            <p className="text-sm text-gray-600">Correct inaccurate or incomplete data</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Right to Erasure</h4>
            <p className="text-sm text-gray-600">Request deletion of your personal data</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Right to Restriction</h4>
            <p className="text-sm text-gray-600">Limit how we process your data</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Right to Portability</h4>
            <p className="text-sm text-gray-600">Receive your data in a structured format</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Right to Object</h4>
            <p className="text-sm text-gray-600">Object to processing based on legitimate interest</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm mb-2">
            <strong>Exercise Your Rights:</strong> You can exercise these rights through our self-service portal 
            or by contacting our Data Protection Officer.
          </p>
          <div className="space-x-3">
            <Link 
              to="/privacy/data-requests" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Request My Data
            </Link>
            <a 
              href="#contact" 
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Contact DPO
            </a>
          </div>
        </div>

        <SectionHeading id="children-privacy" level={2}>
          9. Children's Privacy
        </SectionHeading>
        <p className="mb-6">
          SwiftFacture is intended for business use and is not designed for individuals under the age of 16 
          (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect 
          personal information from children. If you believe we have inadvertently collected information 
          from a child, please contact us immediately for removal.
        </p>

        <SectionHeading id="policy-changes" level={2}>
          10. Changes to This Policy
        </SectionHeading>
        <p className="mb-6">
          We may update this Privacy Policy periodically to reflect changes in our practices or applicable 
          laws. We will notify you of material changes through email or a prominent notice in our application. 
          The "Last Updated" date at the top of this policy indicates when changes were last made. 
          Continued use of our services after changes constitutes acceptance of the updated policy.
        </p>

        <SectionHeading id="contact" level={2}>
          11. Contact Us
        </SectionHeading>
        <p className="mb-4">
          If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
        </p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Data Protection Officer</h4>
              <p className="text-sm text-gray-600 mb-1">Email: privacy@swiftfacture.eu</p>
              <p className="text-sm text-gray-600">Response time: Within 30 days</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Postal Address</h4>
              <p className="text-sm text-gray-600">
                SwiftFacture Data Protection<br />
                [Your Business Address]<br />
                European Union
              </p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold mb-2">Supervisory Authority</h4>
            <p className="text-sm text-gray-600">
              If you believe your data protection rights have been violated, you have the right to lodge 
              a complaint with your local data protection authority.
            </p>
          </div>
        </div>

        <div className="text-center space-x-4 pt-6 border-t border-gray-200">
          <Link 
            to="/terms" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors"
          >
            View Terms of Service
          </Link>
          <Link 
            to="/privacy/data-requests" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            Data Request Portal
          </Link>
        </div>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;