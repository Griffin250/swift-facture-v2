import { useState } from "react";
import { Link } from "react-router-dom";
import LegalLayout from "../components/legal/LegalLayout";
import SectionHeading from "../components/legal/SectionHeading";

const DataRequestPage = () => {
  const [formData, setFormData] = useState({
    requestType: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    accountEmail: "",
    specificData: "",
    reason: "",
    identityVerification: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const breadcrumbs = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Data Request" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      identityVerification: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <LegalLayout
        title="Data Request Submitted"
        breadcrumbs={breadcrumbs}
      >
        <div className="text-center py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
            <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted Successfully</h2>
            <p className="text-gray-700 mb-6">
              Your data request has been received and will be processed within 30 days as required by GDPR. 
              You will receive email updates about the status of your request.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Identity verification (if required)</li>
                <li>• Request processing within 30 days</li>
                <li>• Email notification with results</li>
                <li>• Secure delivery of requested data</li>
              </ul>
            </div>
          </div>
          
          <div className="space-x-4">
            <Link 
              to="/privacy" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
            >
              Back to Privacy Policy
            </Link>
            <Link 
              to="/" 
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors"
            >
              Return to SwiftFacture
            </Link>
          </div>
        </div>
      </LegalLayout>
    );
  }

  return (
    <LegalLayout
      title="Data Subject Rights Request"
      breadcrumbs={breadcrumbs}
    >
      <div className="prose max-w-none">
        <div className="mb-8">
          <p className="text-gray-700 mb-4">
            Exercise your data protection rights under GDPR and other applicable privacy laws. 
            Complete this form to request access to your personal data, request corrections, 
            or request deletion of your information.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <strong>Processing Time:</strong> We will respond to your request within 30 days. 
              Complex requests may require up to 60 days with notification of the extension.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div>
            <SectionHeading id="request-type" level={3}>
              Type of Request
            </SectionHeading>
            <div className="grid gap-3">
              {[
                { value: "access", label: "Right of Access", description: "Get a copy of my personal data" },
                { value: "rectification", label: "Right to Rectification", description: "Correct inaccurate or incomplete data" },
                { value: "erasure", label: "Right to Erasure", description: "Delete my personal data" },
                { value: "restriction", label: "Right to Restriction", description: "Limit processing of my data" },
                { value: "portability", label: "Right to Portability", description: "Receive my data in a structured format" },
                { value: "objection", label: "Right to Object", description: "Object to processing based on legitimate interest" }
              ].map((option) => (
                <label key={option.value} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="requestType"
                    value={option.value}
                    checked={formData.requestType === option.value}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <SectionHeading id="personal-info" level={3}>
              Your Information
            </SectionHeading>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SwiftFacture Account Email
                </label>
                <input
                  type="email"
                  name="accountEmail"
                  value={formData.accountEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="If different from contact email"
                />
              </div>
            </div>
          </div>

          {/* Specific Data Request */}
          <div>
            <SectionHeading id="specific-data" level={3}>
              Request Details
            </SectionHeading>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Data or Information Requested
                </label>
                <textarea
                  name="specificData"
                  value={formData.specificData}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please specify which data you're requesting or what corrections you need..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Request
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please explain the reason for your request (optional)..."
                />
              </div>
            </div>
          </div>

          {/* Identity Verification */}
          <div>
            <SectionHeading id="identity-verification" level={3}>
              Identity Verification
            </SectionHeading>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Security Notice:</strong> To protect your privacy, we may require identity verification 
                for certain requests. Accepted documents include government-issued ID, passport, or driving license.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Identity Document (if requested)
              </label>
              <input
                type="file"
                name="identityVerification"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG (max 5MB)
              </p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold mb-3">Important Legal Information</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Requests will be processed within 30 days as required by GDPR</li>
              <li>• We may contact you for additional information to verify your identity</li>
              <li>• Complex requests may require up to 60 days with notification</li>
              <li>• Fraudulent requests may be reported to relevant authorities</li>
              <li>• You have the right to lodge a complaint with your local data protection authority</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Link 
              to="/privacy" 
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Privacy Policy
            </Link>
            
            <button
              type="submit"
              disabled={isSubmitting || !formData.requestType || !formData.fullName || !formData.email}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have questions about your data rights or need assistance with this form, 
            contact our Data Protection Officer:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm">
              <strong>Email:</strong> privacy@swiftfacture.eu<br />
              <strong>Response Time:</strong> Within 5 business days<br />
              <strong>Phone:</strong> Available upon request for urgent matters
            </p>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
};

export default DataRequestPage;