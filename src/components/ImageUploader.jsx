import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onImagesChange, maxImages = 5 }) => {
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const FILE_MAX_SIZE = 2 * 1024 * 1024; 
  const prevImagesRef = useRef([]);

useEffect(() => {
  if (prevImagesRef.current !== images) {
    onImagesChange(images);
    prevImagesRef.current = images;
  }
}, [images, onImagesChange]);
  useEffect(() => {
  return () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
  };
}, [images]);

  const handleFiles = (files) =>{
    const fileArray = Array.from(files)
    const validFiles = []

    fileArray.forEach(file=>{
      if(file.size > FILE_MAX_SIZE){
        alert(`The following files were rejected: ${file.name}\n Please upload images up to 2MB each.`);
        return
      }
      validFiles.push(file)
    })

    const newImages = validFiles.map(file=>({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(2,11)
    }))
    
    setImages(prevImages =>{
    if(prevImages.length + newImages.length > maxImages){
      console.log(prevImages)
      alert(`You can only upload to ${maxImages} images`)
      return prevImages
    }
    return [...prevImages,...newImages] 
  })
  }

  const removeImage = useCallback((id) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(img => img.id !== id);
      const imgToRemove = prevImages.find(img => img.id === id);
      
      if (imgToRemove) {
        URL.revokeObjectURL(imgToRemove.preview);
      }

      return updatedImages;
    });
  }, []);
  

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

 const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
      e.target.value = null;
    }
  }, []); 
  

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
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
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium mb-2">
            Drop your images here or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-sm text-gray-500">
            Maximum {maxImages} images. PNG, JPG up to 2MB each
          </p>
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploaded Images ({images.length}/{maxImages})
            </h3>
            <p className="text-sm text-gray-500">
              First image will be used as cover
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    Cover
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
              </div>
            ))}
            
            {/* Add More Images Button */}
            {images.length < maxImages && (
              <label
                htmlFor="file-upload"
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Add More</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;