import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';

const API_URL = 'https://shivi-backend.onrender.com/api';

export default function CreateCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryType: 'general',
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please select an image');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('categoryType', formData.categoryType);
    data.append('image', formData.image);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories/createCategory/create`, {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Category created successfully!');
        navigate('/places/categories');
      } else {
        alert(result.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/places/categories')}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <ArrowLeft size={20} />
          Back to Categories
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Create New Category</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., South India, North India, Hill Stations"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this category..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category Type <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryType"
                value={formData.categoryType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="general">General</option>
                <option value="region">Region</option>
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="beach">Beach</option>
                <option value="mountain">Mountain</option>
                <option value="historical">Historical</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category Image <span className="text-red-500">*</span>
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg mb-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition">
                  <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                  <label className="cursor-pointer">
                    <span className="text-indigo-600 font-medium hover:text-indigo-700">
                      Click to upload
                    </span>
                    <span className="text-gray-600"> or drag and drop</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
              
              {formData.image && !imagePreview && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                  ✓ {formData.image.name}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/places/categories')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}