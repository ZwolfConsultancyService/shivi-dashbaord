import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Trash2, Plus } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const fetchCategoryDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories/${id}`);
      const data = await response.json();
      if (data.success) {
        setCategory(data.data);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Failed to fetch category details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetail();
  }, [id]);

  const handleDeletePlace = async (placeId) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;

    try {
      const response = await fetch(`${API_URL}/places/place/${placeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Place deleted successfully!');
        fetchCategoryDetail();
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      alert('Error deleting place');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Category not found</h2>
          <button
            onClick={() => navigate('/places/categories')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => navigate('/places/categories')}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <ArrowLeft size={20} />
          Back to Categories
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-80">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                  {category.categoryType}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
              <p className="text-lg text-white/90">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Places ({category.places?.length || 0})
          </h2>
          <button
            onClick={() => navigate('/places/add-place', { state: { categoryId: category._id, categoryName: category.name } })}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Add Place
          </button>
        </div>

        {category.places?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MapPin className="mx-auto text-gray-400 mb-4" size={60} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Places Yet</h3>
            <p className="text-gray-600 mb-6">Add your first place to this category!</p>
            <button
              onClick={() => navigate('/places/add-place', { state: { categoryId: category._id, categoryName: category.name } })}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Add First Place
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.places?.map((place) => (
              <div 
                key={place._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
	onClick={() => navigate(`/places/place/${place._id}`)}




              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{place.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-3 text-indigo-600">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">{place.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{place.description}</p>
                  
                  {/* <button
                    onClick={() => handleDeletePlace(place._id)}
                    className="w-full bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 size={18} />
                    Delete Place
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}