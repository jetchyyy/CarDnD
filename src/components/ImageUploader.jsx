import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onImagesChange, maxImages = 5 }) => {
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newImages = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  };

  const removeImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive ? 'border-[#007BFF] bg-[#007BFF]/10' : 'border-[#8C8C8C] bg-[#FFFFFF]'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-[#8C8C8C] mb-3" />
          <p className="text-[#171717] font-medium mb-2">
            Drop your images here or <span className="text-[#007BFF]">browse</span>
          </p>
          <p className="text-sm text-[#8C8C8C]">
            Maximum {maxImages} images. PNG, JPG up to 10MB each
          </p>
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-[#171717]">
              Uploaded Images ({images.length}/{maxImages})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-[#8C8C8C]/30 hover:border-[#007BFF] transition-all"
              >
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-[#007BFF] text-[#171717] text-xs font-semibold px-2 py-1 rounded shadow-lg">
                    Cover
                  </div>
                )}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
            ))}
            
            {/* Add More Images Button */}
            {images.length < maxImages && (
              <label
                htmlFor="file-upload"
                className="aspect-square rounded-lg border-2 border-dashed border-[#8C8C8C] hover:border-[#007BFF] flex flex-col items-center justify-center cursor-pointer bg-[#FFFFFF] hover:bg-[#007BFF]/10 transition-all"
              >
                <ImageIcon className="w-8 h-8 text-[#8C8C8C] mb-2" />
                <span className="text-sm text-[#8C8C8C]">Add More</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
