import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_BASE_URL =  "https://shivi-backend.onrender.com/api";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true);
      setError(null);

      try {
       const response = await axios.get(`${API_BASE_URL}/blog/${id}`);
        setBlog(response.data.data);
        
        // Optionally increment view count
        // You could add this endpoint to your backend
        // await axios.post(`${API_BASE_URL}/blogs/${id}/view`);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError(error.response?.data?.message || 'Failed to load blog');
        toast.error('Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setIsDeleting(true);
      try {
        await axios.delete(`${API_BASE_URL}/blog/${id}`);
        toast.success('Blog post deleted successfully');
        navigate('/');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error(error.response?.data?.message || 'Failed to delete blog post');
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            {error ? 'Error Loading Blog' : 'Blog Not Found'}
          </h2>
          <p className="text-gray-500 mb-4">
            {error || 'The requested blog post could not be found.'}
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center text-red-600 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-red-600 hover:text-red-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog List
        </Link>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {blog.title || 'Untitled'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{blog.author}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(blog.createdAt), 'MMMM dd, yyyy')}</span>
              </div>
              
              {blog.views !== undefined && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{blog.views} views</span>
                </div>
              )}
              
              {!blog.isPublished && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  Draft
                </span>
              )}
            </div>
            
            {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {format(new Date(blog.updatedAt), 'MMMM dd, yyyy')}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link
              to={`/edit/${blog._id}`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.images && blog.images.length > 0 && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <img
            src={blog.images[0].url}
            alt={blog.title}
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Multiple Images Gallery */}
      {blog.images && blog.images.length > 1 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {blog.images.slice(1).map((image, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-sm">
              <img
                src={image.url}
                alt={`${blog.title} - ${index + 2}`}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-gray-500" />
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <article className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="prose prose-lg max-w-none">
          {blog.content ? (
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )}
        </div>
      </article>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link
            to="/create"
            className="text-green-600 hover:text-green-800 font-medium flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Write a new blog post
          </Link>
          <Link
            to="/"
            className="text-red-600 hover:text-red-800 font-medium flex items-center"
          >
            View all posts
            <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;