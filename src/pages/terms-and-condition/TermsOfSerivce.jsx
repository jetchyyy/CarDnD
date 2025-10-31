import { Car, Shield, AlertTriangle, FileText, Scale, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const sections = [
    {
      icon: FileText,
      title: "1. Acceptance of Terms",
      content: "By accessing and using CarDnD's platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
    },
    {
      icon: UserCheck,
      title: "2. User Eligibility",
      content: "You must be at least 18 years old with a valid driver's license to rent vehicles through CarDnD. Users must provide accurate, current, and complete information during registration and maintain the security of their account credentials."
    },
    {
      icon: Car,
      title: "3. Rental Agreement",
      content: "All vehicle rentals are subject to availability and owner approval. Renters must inspect vehicles before use and report any pre-existing damage. Vehicles must be returned in the same condition as received, at the agreed time and location. Late returns may incur additional charges."
    },
    {
      icon: Shield,
      title: "4. Insurance and Liability",
      content: "Basic insurance coverage is included with all rentals. Renters are responsible for damages, theft, or loss during the rental period up to the deductible amount. Renters must comply with all traffic laws and regulations. Any violations, fines, or penalties are the renter's responsibility."
    },
    {
      icon: Scale,
      title: "5. Payment and Fees",
      content: "Payment is processed through our secure platform. Rental fees, security deposits, and applicable taxes are charged at booking. Cancellations must follow our cancellation policy. Refunds are subject to timing and circumstances of cancellation. Late fees may apply for overdue payments."
    },
    {
      icon: AlertTriangle,
      title: "6. Prohibited Uses",
      content: "Vehicles cannot be used for: illegal activities, racing or competitive events, commercial purposes (unless explicitly agreed), transportation of hazardous materials, or subletting to third parties. Violation of these terms may result in immediate rental termination and account suspension."
    }
  ];

  const additionalTerms = [
    {
      title: "7. Host Responsibilities",
      content: "Hosts must provide accurate vehicle information, maintain vehicles in safe working condition, have proper insurance coverage, and respond promptly to rental requests and renter communications."
    },
    {
      title: "8. Platform Fees",
      content: "CarDnD charges service fees to both renters and hosts. These fees are disclosed before transaction completion and cover platform maintenance, customer support, and insurance administration."
    },
    {
      title: "9. Dispute Resolution",
      content: "Disputes between renters and hosts should first be resolved through our support team. If resolution cannot be reached, disputes may be subject to binding arbitration in accordance with Philippine law."
    },
    {
      title: "10. Privacy and Data",
      content: "We collect and process personal data in accordance with our Privacy Policy. User information is protected and only shared as necessary to facilitate rentals. We use industry-standard security measures to protect your data."
    },
    {
      title: "11. Modifications to Terms",
      content: "CarDnD reserves the right to modify these terms at any time. Users will be notified of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of modified terms."
    },
    {
      title: "12. Termination",
      content: "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, harmful, or illegal activities. Users may close their accounts at any time through account settings."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">Terms of Service</h1>
          <p className="text-xl text-center text-blue-100">
            Last updated: October 28, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to CarDnD. These Terms of Service govern your use of our vehicle rental platform. 
            By using CarDnD, you agree to these terms in full. Please read them carefully before using our services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            These terms apply to all users of the platform, including renters, vehicle hosts, and visitors.
          </p>
        </div>

        {/* Main Sections with Icons */}
        <div className="space-y-6 mb-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                  <section.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Terms */}
        <div className="space-y-6 mb-8">
          {additionalTerms.map((term, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{term.title}</h2>
              <p className="text-gray-700 leading-relaxed">{term.content}</p>
            </div>
          ))}
        </div>

        {/* Cancellation Policy Link */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-blue-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancellation Policy</h2>
              <p className="text-gray-700">
                Learn about our refund schedule and cancellation terms for bookings.
              </p>
            </div>
            <Link 
              to="/cancellation-policy"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md whitespace-nowrap ml-4"
            >
              View Policy
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-blue-50 rounded-lg p-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>Email: <span className="font-semibold">legal@cardnd.com</span></p>
            <p>Phone: <span className="font-semibold">+63 912 345 6789</span></p>
            <p>Address: <span className="font-semibold">123 IT Park, Cebu City, Philippines</span></p>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500 mt-8">
          <p className="text-gray-800">
            <span className="font-bold">Important:</span> By continuing to use CarDnD, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;