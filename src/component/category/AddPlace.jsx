import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function AddPlace() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    categoryId: location.state?.categoryId || '',
    title: '',
    description: '',
    location: '',
    image: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/getAllCategories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
        // If no category selected and categories exist, select first one
        if (!formData.categoryId && data.data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('location', formData.location);
    data.append('image', formData.image);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/places/${formData.categoryId}/add-place`, {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Place added successfully!');
        navigate(`/places/category/${formData.categoryId}`);
      } else {
        alert(result.message || 'Failed to add place');
      }
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Error adding place');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat._id === formData.categoryId);

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
            <h1 className="text-3xl font-bold text-gray-800">Add New Place</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Select Category <span className="text-red-500">*</span>
              </label>
              {categories.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 mb-2">No categories found!</p>
                  <button
                    onClick={() => navigate('/places/create-category')}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Create a category first →
                  </button>
                </div>
              ) : (
                <div>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} ({cat.places?.length || 0} places)
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <p className="text-sm text-gray-600 mt-2">
                      Adding to: <span className="font-medium text-indigo-600">{selectedCategory.name}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Place Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Munnar Hills, Gateway of India"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Kerala, Mumbai, Maharashtra"
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
                placeholder="Describe this place, what makes it special..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Place Image <span className="text-red-500">*</span>
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
                disabled={loading || categories.length === 0}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Place...' : 'Add Place'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}