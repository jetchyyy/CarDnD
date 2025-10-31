import { Clock, DollarSign, Calendar, AlertCircle, Shield, CheckCircle } from 'lucide-react';

const CancellationPolicy = () => {
  const refundTiers = [
    {
      icon: CheckCircle,
      title: "24+ Hours Before Booking",
      percentage: "100%",
      description: "Full refund of the booking amount",
      timeframe: "Cancel 24 hours or more before your scheduled pickup time",
      color: "green"
    },
    {
      icon: Clock,
      title: "10-24 Hours Before Booking",
      percentage: "50%",
      description: "Half refund of the booking amount",
      timeframe: "Cancel between 10 to 24 hours before your scheduled pickup time",
      color: "yellow"
    },
    {
      icon: AlertCircle,
      title: "Less Than 10 Hours",
      percentage: "0%",
      description: "No refund available",
      timeframe: "Cancel less than 10 hours before pickup or after booking starts",
      color: "red"
    }
  ];

  const additionalPolicies = [
    {
      title: "Processing Time",
      content: "Refunds are processed within 5-7 business days after cancellation approval. The refund will be credited to your original payment method."
    },
    {
      title: "Host Cancellations",
      content: "If a host cancels your confirmed booking, you will receive a full 100% refund regardless of timing. The host may also be subject to penalties under our host terms."
    },
    {
      title: "Modification vs Cancellation",
      content: "Modifying your booking dates or times is subject to vehicle availability and host approval. Modifications made within the cancellation windows above may incur the same penalties."
    },
    {
      title: "No-Show Policy",
      content: "If you fail to pick up the vehicle at the scheduled time without prior cancellation, this is considered a no-show and no refund will be issued."
    },
    {
      title: "Weather & Emergencies",
      content: "In cases of severe weather warnings, natural disasters, or documented emergencies, special cancellation considerations may apply. Contact our support team for assistance."
    },
    {
      title: "Insurance & Protection",
      content: "Service fees and insurance charges are non-refundable in all cancellation scenarios. Only the base rental amount is eligible for refund based on the cancellation timing."
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-100 text-green-600 border-green-600",
      yellow: "bg-yellow-100 text-yellow-600 border-yellow-600",
      red: "bg-red-100 text-red-600 border-red-600"
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">Cancellation Policy</h1>
          <p className="text-xl text-center text-blue-100">
            Understanding your refund options
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">
            At CarDnD, we understand that plans can change. Our cancellation policy is designed to be fair 
            to both renters and vehicle hosts while providing flexibility when you need it.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The refund amount you receive depends on when you cancel your booking relative to your scheduled pickup time.
          </p>
        </div>

        {/* Refund Tiers */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Refund Schedule</h2>
          <div className="space-y-6">
            {refundTiers.map((tier, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg flex-shrink-0 ${getColorClasses(tier.color)}`}>
                    <tier.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{tier.title}</h3>
                      <span className={`text-3xl font-bold px-4 py-2 rounded-lg border-2 ${getColorClasses(tier.color)}`}>
                        {tier.percentage}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">{tier.description}</p>
                    <p className="text-gray-600">{tier.timeframe}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example Calculation */}
        <div className="bg-blue-50 rounded-lg p-8 border-l-4 border-blue-600 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Example Calculation
          </h2>
          <div className="space-y-3 text-gray-700">
            <p className="leading-relaxed">
              If your booking costs <span className="font-bold">₱5,000</span> and you cancel:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-2">•</span>
                <span><span className="font-semibold">25 hours before:</span> Full refund of ₱5,000</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 font-bold mr-2">•</span>
                <span><span className="font-semibold">15 hours before:</span> 50% refund of ₱2,500</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-2">•</span>
                <span><span className="font-semibold">8 hours before:</span> No refund (₱0)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Policies */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Additional Information</h2>
          <div className="space-y-6">
            {additionalPolicies.map((policy, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{policy.title}</h3>
                <p className="text-gray-700 leading-relaxed">{policy.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Cancel */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            How to Cancel Your Booking
          </h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-3">1.</span>
              <span>Log in to your CarDnD account and navigate to "My Bookings"</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3">2.</span>
              <span>Find the booking you wish to cancel</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3">3.</span>
              <span>Click "Cancel Booking" and confirm your cancellation</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3">4.</span>
              <span>You will receive a confirmation email with refund details</span>
            </li>
          </ol>
        </div>

        {/* Contact Section */}
        <div className="bg-blue-50 rounded-lg p-8 border-l-4 border-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions about our cancellation policy or need assistance with a cancellation:
          </p>
          <div className="space-y-2 text-gray-700">
            <p>Email: <span className="font-semibold">support@cardnd.com</span></p>
            <p>Phone: <span className="font-semibold">+63 912 345 6789</span></p>
            <p>Available: <span className="font-semibold">24/7 Customer Support</span></p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500 mt-8">
          <p className="text-gray-800">
            <span className="font-bold">Important:</span> This cancellation policy applies to guest cancellations only. 
            Different terms may apply for host cancellations or platform-initiated cancellations. Always review your 
            booking confirmation for specific cancellation deadlines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;