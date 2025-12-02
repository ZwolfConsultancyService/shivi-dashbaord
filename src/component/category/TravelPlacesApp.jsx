import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Eye, Trash2 } from 'lucide-react';

const API_URL = 'https://shivi-backend.onrender.com/api';

export default function TravelPlacesApp() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [loading, setLoading] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    categoryType: 'general',
    image: null
  });

  const [placeForm, setPlaceForm] = useState({
    title: '',
    description: '',
    location: '',
    image: null
  });

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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryForm.image) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('name', categoryForm.name);
    formData.append('description', categoryForm.description);
    formData.append('categoryType', categoryForm.categoryType);
    formData.append('image', categoryForm.image);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/categories/createCategory/create`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Category created successfully!');
        setCategoryForm({ name: '', description: '', categoryType: 'general', image: null });
        fetchCategories();
        setActiveView('list');
      } else {
        alert(data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = async (e) => {
    e.preventDefault();
    
    if (!placeForm.image) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('title', placeForm.title);
    formData.append('description', placeForm.description);
    formData.append('location', placeForm.location);
    formData.append('image', placeForm.image);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/places/${selectedCategory._id}/add-place`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Place added successfully!');
        setPlaceForm({ title: '', description: '', location: '', image: null });
        fetchCategories();
        setActiveView('list');
      } else {
        alert(data.message || 'Failed to add place');
      }
    } catch (error) {
      console.error('Error adding place:', error);
      alert('Error adding place');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Category deleted successfully!');
        fetchCategories();
        if (selectedCategory?._id === id) {
          setSelectedCategory(null);
          setActiveView('list');
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  };

  const handleDeletePlace = async (placeId) => {
    if (!confirm('Are you sure you want to delete this place?')) return;

    try {
      const response = await fetch(`${API_URL}/places/place/${placeId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Place deleted successfully!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      alert('Error deleting place');
    }
  };

  const viewCategoryDetails = (category) => {
    setSelectedCategory(category);
    setActiveView('detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="text-indigo-600" size={36} />
            Travel Places Manager
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveView('list')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeView === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setActiveView('createCategory')}
            className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeView === 'createCategory'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plus size={20} />
            Create Category
          </button>
          <button
            onClick={() => {
              if (categories.length === 0) {
                alert('Please create a category first');
                return;
              }
              setSelectedCategory(categories[0]);
              setActiveView('addPlace');
            }}
            className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeView === 'addPlace'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Plus size={20} />
            Add Place
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          )}

          {activeView === 'list' && !loading && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">All Categories</h2>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No categories found. Create one to get started!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category._id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {category.categoryType}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {category.places?.length || 0} places
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewCategoryDetails(category)}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'detail' && selectedCategory && (
            <div>
              <button
                onClick={() => setActiveView('list')}
                className="mb-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
              >
                ← Back to Categories
              </button>
              
              <div className="mb-6">
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedCategory.name}</h2>
                <p className="text-gray-600 mb-2">{selectedCategory.description}</p>
                <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded">
                  {selectedCategory.categoryType}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Places ({selectedCategory.places?.length || 0})
              </h3>

              {selectedCategory.places?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No places added yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCategory.places?.map((place) => (
                    <div key={place._id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                      <img
                        src={place.image}
                        alt={place.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-1">{place.title}</h4>
                        <p className="text-sm text-indigo-600 mb-2 flex items-center gap-1">
                          <MapPin size={14} />
                          {place.location}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">{place.description}</p>
                        <button
                          onClick={() => handleDeletePlace(place._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete Place
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'createCategory' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Category</h2>
              <div className="max-w-2xl">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Category Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Category Type</label>
                  <select
                    value={categoryForm.categoryType}
                    onChange={(e) => setCategoryForm({...categoryForm, categoryType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="region">Region</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Category Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCategoryForm({...categoryForm, image: e.target.files[0]})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {categoryForm.image && (
                    <p className="text-sm text-green-600 mt-2">✓ {categoryForm.image.name}</p>
                  )}
                </div>

                <button
                  onClick={handleCreateCategory}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </div>
          )}

          {activeView === 'addPlace' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Place to Category</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Select Category</label>
                <select
                  value={selectedCategory?._id || ''}
                  onChange={(e) => {
                    const cat = categories.find(c => c._id === e.target.value);
                    setSelectedCategory(cat);
                  }}
                  className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="max-w-2xl">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Place Title</label>
                  <input
                    type="text"
                    value={placeForm.title}
                    onChange={(e) => setPlaceForm({...placeForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    value={placeForm.description}
                    onChange={(e) => setPlaceForm({...placeForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={placeForm.location}
                    onChange={(e) => setPlaceForm({...placeForm, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Place Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPlaceForm({...placeForm, image: e.target.files[0]})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {placeForm.image && (
                    <p className="text-sm text-green-600 mt-2">✓ {placeForm.image.name}</p>
                  )}
                </div>

                <button
                  onClick={handleAddPlace}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Place'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}