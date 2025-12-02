import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Calendar, Trash2 } from 'lucide-react';

const API_URL = 'https://shivi-backend.onrender.com/api';

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlaceDetail();
  }, [id]);

  const fetchPlaceDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/places/place/${id}`);
      const data = await response.json();
      if (data.success) {
        setPlace(data.data);
      }
    } catch (error) {
      console.error('Error fetching place:', error);
      alert('Failed to fetch place details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlace = async () => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;

    try {
      const response = await fetch(`${API_URL}/places/place/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Place deleted successfully!');
        navigate('/places/categories');
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
          <p className="mt-4 text-gray-600 text-lg">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Place not found</h2>
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
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-96">
            <img
              src={place.image}
              alt={place.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-3">{place.title}</h1>
              <div className="flex items-center gap-2 text-lg mb-2">
                <MapPin size={24} />
                <span>{place.location}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About this place</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{place.description}</p>
            </div>

            {place.createdAt && (
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <Calendar size={20} />
                <span>Added on {new Date(place.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleDeletePlace}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={20} />
                Delete Place
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}