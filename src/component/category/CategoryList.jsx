import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, Trash2, Plus } from 'lucide-react';

const API_URL = 'https://shivi-backend.onrender.com/api';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories/getAllCategories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Category deleted successfully!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="text-indigo-600" size={40} />
            All Categories
          </h1>
          <button
            onClick={() => navigate('/places/create-category')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Create Category
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MapPin className="mx-auto text-gray-400 mb-4" size={60} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">Create your first category to get started!</p>
            <button
              onClick={() => navigate('/places/create-category')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div 
                key={category._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {category.categoryType}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <MapPin size={16} className="text-indigo-600" />
                    <span className="font-medium">{category.places?.length || 0} Places</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/places/category/${category._id}`)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}