import { Link } from "react-router-dom";
import LegalLayout from "../components/legal/LegalLayout";
import TableOfContents from "../components/legal/TableOfContents";
import SectionHeading from "../components/legal/SectionHeading";

const TermsConditions = () => {
  const lastUpdated = "2024-10-29";
  
  const breadcrumbs = [
    { label: "Terms & Conditions" }
  ];

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "definitions", title: "Definitions" },
    { id: "account-terms", title: "Account Terms" },
    { id: "service-usage", title: "Use of Service" },
    { id: "payments-billing", title: "Payments & Billing" },
    { id: "data-protection", title: "Data Protection" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "service-availability", title: "Service Availability" },
    { id: "termination", title: "Termination" },
    { id: "liability-disclaimers", title: "Liability & Disclaimers" },
    { id: "governing-law", title: "Governing Law & Jurisdiction" },
    { id: "contact-notices", title: "Contact & Notices" }
  ];

  return (
    <LegalLayout
      title="Terms & Conditions"
      lastUpdated={lastUpdated}
      breadcrumbs={breadcrumbs}
    >
      <TableOfContents sections={sections} />
      
      <div className="prose max-w-none">
        <SectionHeading id="introduction" level={2}>
          1. Introduction
        </SectionHeading>
        <p className="mb-4">
          Welcome to SwiftFacture, a professional invoice generation and business management platform 
          operated from the European Union. These Terms and Conditions ("Terms") govern your access 
          to and use of the SwiftFacture service ("Service").
        </p>
        <p className="mb-6">
          By creating an account, accessing, or using our Service, you agree to be bound by these Terms 
          and our Privacy Policy. If you disagree with any part of these Terms, you may not access 
          or use our Service.
        </p>

        <SectionHeading id="definitions" level={2}>
          2. Definitions
        </SectionHeading>
        <div className="mb-6">
          <ul className="space-y-3">
            <li><strong>"Service"</strong> refers to the SwiftFacture platform, including web application, APIs, and related services</li>
            <li><strong>"User" or "You"</strong> refers to the individual or entity using the Service</li>
            <li><strong>"Account"</strong> refers to your registered user account with SwiftFacture</li>
            <li><strong>"Organization"</strong> refers to a business entity or group account within the Service</li>
            <li><strong>"Content"</strong> refers to data, information, and materials you input, upload, or generate using the Service</li>
            <li><strong>"Subscription"</strong> refers to paid access plans for premium features</li>
          </ul>
        </div>

        <SectionHeading id="account-terms" level={2}>
          3. Account Terms
        </SectionHeading>
        
        <h3 className="text-lg font-semibold mb-3">3.1 Eligibility</h3>
        <p className="mb-4">
          You must be at least 18 years old (or the age of majority in your jurisdiction) and have 
          the legal capacity to enter into contracts to use our Service. Business accounts must be 
          registered by authorized representatives.
        </p>

        <h3 className="text-lg font-semibold mb-3">3.2 Account Security</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>You are responsible for maintaining the security of your account credentials</li>
          <li>You must notify us immediately of any unauthorized access or security breaches</li>
          <li>We strongly recommend enabling multi-factor authentication (MFA)</li>
          <li>You are liable for all activities that occur under your account</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">3.3 Account Information</h3>
        <p className="mb-6">
          You must provide accurate, complete, and up-to-date information when creating your account. 
          You agree to update your information promptly if it changes. Providing false information 
          may result in account suspension or termination.
        </p>

        <SectionHeading id="service-usage" level={2}>
          4. Use of Service
        </SectionHeading>

        <h3 className="text-lg font-semibold mb-3">4.1 Permitted Uses</h3>
        <p className="mb-3">You may use SwiftFacture to:</p>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Create, manage, and send professional invoices and estimates</li>
          <li>Track payments and manage customer information</li>
          <li>Generate business reports and analytics</li>
          <li>Use multi-language and multi-currency features</li>
          <li>Integrate with approved third-party services</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">4.2 Prohibited Uses</h3>
        <p className="mb-3">You may not use SwiftFacture to:</p>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Engage in illegal activities or violate applicable laws</li>
          <li>Send spam, unsolicited communications, or fraudulent invoices</li>
          <li>Attempt to gain unauthorized access to our systems or other users' data</li>
          <li>Upload malware, viruses, or harmful code</li>
          <li>Impersonate others or provide false business information</li>
          <li>Use the Service for activities that compete directly with SwiftFacture</li>
          <li>Reverse engineer, decompile, or attempt to extract source code</li>
        </ul>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Compliance Notice:</strong> Users are responsible for ensuring their use of the Service 
            complies with local tax, accounting, and business regulations in their jurisdiction.
          </p>
        </div>

        <SectionHeading id="payments-billing" level={2}>
          5. Payments & Billing
        </SectionHeading>

        <h3 className="text-lg font-semibold mb-3">5.1 Subscription Plans</h3>
        <p className="mb-4">
          SwiftFacture offers various subscription tiers with different features and usage limits. 
          Current pricing is available on our website and may be updated periodically with notice.
        </p>

        <h3 className="text-lg font-semibold mb-3">5.2 Payment Processing</h3>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Payments are processed securely through Stripe, our authorized payment processor</li>
          <li>Subscriptions are billed monthly or annually as selected</li>
          <li>All fees are non-refundable unless required by law or our refund policy</li>
          <li>Failed payments may result in service suspension after grace period</li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">5.3 Free Trial & Cancellation</h3>
        <p className="mb-4">
          New users may receive a free trial period. You may cancel your subscription at any time 
          through your account settings or by contacting support. Cancellation takes effect at 
          the end of your current billing cycle.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>EU Consumer Rights:</strong> EU consumers have the right to cancel within 14 days 
            of purchase and may be entitled to refunds under applicable consumer protection laws.
          </p>
        </div>

        <SectionHeading id="data-protection" level={2}>
          6. Data Protection
        </SectionHeading>
        <p className="mb-4">
          Your privacy and data protection are fundamental to our service. Our comprehensive data 
          handling practices are detailed in our Privacy Policy, which forms an integral part of these Terms.
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>We process your data in accordance with GDPR and applicable privacy laws</li>
          <li>You retain ownership of all Content you create using the Service</li>
          <li>We implement appropriate technical and organizational measures to protect your data</li>
          <li>You have full control over your data and can exercise your privacy rights at any time</li>
        </ul>
        <p className="mb-6">
          For detailed information about data collection, processing, and your rights, please review our 
          <Link to="/privacy" className="text-blue-600 hover:underline"> Privacy Policy</Link>.
        </p>

        <SectionHeading id="intellectual-property" level={2}>
          7. Intellectual Property
        </SectionHeading>

        <h3 className="text-lg font-semibold mb-3">7.1 SwiftFacture Rights</h3>
        <p className="mb-4">
          SwiftFacture and its original content, features, and functionality are owned by us and are 
          protected by international copyright, trademark, patent, trade secret, and other intellectual 
          property laws.
        </p>

        <h3 className="text-lg font-semibold mb-3">7.2 Your Content Rights</h3>
        <p className="mb-4">
          You retain all rights to Content you create, upload, or input into the Service. You grant 
          us a limited, non-exclusive license to use, store, and process your Content solely to provide 
          and improve the Service.
        </p>

        <h3 className="text-lg font-semibold mb-3">7.3 Feedback and Suggestions</h3>
        <p className="mb-6">
          Any feedback, suggestions, or improvements you provide about the Service may be used by us 
          without restriction or compensation to enhance our platform.
        </p>

        <SectionHeading id="service-availability" level={2}>
          8. Service Availability
        </SectionHeading>
        <p className="mb-4">
          We strive to maintain high service availability, but we cannot guarantee uninterrupted access:
        </p>
        <ul className="mb-4 list-disc pl-6 space-y-1">
          <li>Planned maintenance will be announced in advance when possible</li>
          <li>Emergency maintenance may occur with minimal notice</li>
          <li>Service may be temporarily unavailable due to technical issues or force majeure</li>
          <li>We maintain regular backups and disaster recovery procedures</li>
        </ul>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Service Level:</strong> We target 99.9% uptime for paid subscriptions, excluding 
            scheduled maintenance periods. Status updates are available at our service status page.
          </p>
        </div>

        <SectionHeading id="termination" level={2}>
          9. Termination
        </SectionHeading>

        <h3 className="text-lg font-semibold mb-3">9.1 Termination by You</h3>
        <p className="mb-4">
          You may terminate your account at any time through your account settings or by contacting 
          our support team. Upon termination, you will retain access until the end of your current 
          billing period.
        </p>

        <h3 className="text-lg font-semibold mb-3">9.2 Termination by Us</h3>
        <p className="mb-4">
          We may suspend or terminate your account immediately if you violate these Terms, engage in 
          prohibited activities, or if required by law. We will provide notice when reasonably possible.
        </p>

        <h3 className="text-lg font-semibold mb-3">9.3 Data Retention After Termination</h3>
        <p className="mb-6">
          After termination, we will retain your data for 90 days to allow for account recovery. 
          You may request immediate deletion or data export during this period. Some data may be 
          retained longer for legal compliance as outlined in our Privacy Policy.
        </p>

        <SectionHeading id="liability-disclaimers" level={2}>
          10. Liability & Disclaimers
        </SectionHeading>

        <h3 className="text-lg font-semibold mb-3">10.1 Service Disclaimers</h3>
        <p className="mb-4">
          The Service is provided "as is" and "as available." While we strive for accuracy and reliability, 
          we make no warranties about the completeness, accuracy, or suitability of the Service for your 
          specific needs.
        </p>

        <h3 className="text-lg font-semibold mb-3">10.2 Limitation of Liability</h3>
        <p className="mb-4">
          To the maximum extent permitted by law, SwiftFacture's total liability for all claims 
          arising from or relating to the Service shall not exceed the amount you paid for the Service 
          in the 12 months preceding the claim.
        </p>

        <h3 className="text-lg font-semibold mb-3">10.3 Indemnification</h3>
        <p className="mb-6">
          You agree to indemnify and hold harmless SwiftFacture from any claims, damages, or expenses 
          arising from your use of the Service, violation of these Terms, or infringement of third-party rights.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>EU Consumer Protection:</strong> Nothing in these Terms limits or excludes liability 
            that cannot be limited or excluded under applicable consumer protection laws.
          </p>
        </div>

        <SectionHeading id="governing-law" level={2}>
          11. Governing Law & Jurisdiction
        </SectionHeading>
        <p className="mb-4">
          These Terms are governed by and construed in accordance with the laws of the European Union 
          and the jurisdiction where SwiftFacture is legally established. Any disputes arising from 
          these Terms or your use of the Service will be resolved in the competent courts of that jurisdiction.
        </p>
        <p className="mb-6">
          For consumers in the EU, you may also bring proceedings in the courts of your country of residence. 
          EU consumers may also access the European Commission's Online Dispute Resolution platform at 
          <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>.
        </p>

        <SectionHeading id="contact-notices" level={2}>
          12. Contact & Notices
        </SectionHeading>
        <p className="mb-4">
          For questions about these Terms or to contact SwiftFacture for legal or support matters:
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Legal Department</h4>
              <p className="text-sm text-gray-600 mb-1">Email: legal@swiftfacture.eu</p>
              <p className="text-sm text-gray-600">Response time: Within 5 business days</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer Support</h4>
              <p className="text-sm text-gray-600 mb-1">Email: support@swiftfacture.eu</p>
              <p className="text-sm text-gray-600">Response time: Within 24 hours</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold mb-2">Postal Address</h4>
            <p className="text-sm text-gray-600">
              SwiftFacture Legal Department<br />
              [Your Business Address]<br />
              European Union
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>Terms Updates:</strong> We may update these Terms periodically. Material changes 
            will be communicated via email or in-app notification at least 30 days before taking effect.
          </p>
        </div>

        <div className="text-center space-x-4 pt-6 border-t border-gray-200">
          <Link 
            to="/privacy" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors"
          >
            View Privacy Policy
          </Link>
          <Link 
            to="/privacy#contact" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            Contact DPO
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500 mt-6">
          These Terms are effective as of {new Date(lastUpdated).toLocaleDateString('en-EU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </LegalLayout>
  );
};

export default TermsConditions;