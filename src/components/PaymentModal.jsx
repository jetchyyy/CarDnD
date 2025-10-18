import { useState } from "react";
import { X, Upload } from "lucide-react";

export default function PaymentModal({ isOpen, onClose, amount, qrCodeUrl, onUploadProof }) {
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProof(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!proof) {
      alert("Please upload a proof of payment.");
      return;
    }

    // Send the file to parent (for backend upload or verification)
    onUploadProof(proof);

    alert("Proof of payment submitted!");
    setProof(null);
    setPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Payment
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Scan the QR code below and upload your proof of payment.
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <img
            src={qrCodeUrl}
            alt="Payment QR Code"
            className="w-56 h-56 border rounded-xl shadow-md"
          />
        </div>

        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-gray-600">Amount to Pay</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱{amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Upload Proof Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">
            Upload Proof of Payment
          </label>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition">
            {preview ? (
              <div className="flex flex-col items-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg mb-2"
                />
                <button
                  onClick={() => {
                    setProof(null);
                    setPreview(null);
                  }}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-gray-400 mb-2" size={36} />
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className="inline-block mt-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 text-sm"
                >
                  Choose File
                </label>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Submit Proof
        </button>
      </div>
    </div>
  );
}
