import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetBlogQuery, useDeleteBlogMutation } from '../../store/api/blogApi';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: response, isLoading, error } = useGetBlogQuery({ id });

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();

  // Extract blog from response (in case your API returns { success: true, data: blog })
  const blog = response?.data || response;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('Blog post deleted successfully');
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete blog post');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            {error ? 'Something went wrong while loading the blog post.' : 'The requested blog post could not be found.'}
          </p>
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  // Debug: Log the blog object to see its structure
  // console.log('Blog object:', blog);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with navigation and actions */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog List
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title || 'Untitled'}</h1>
            <p className="text-gray-600 text-sm">
              {blog.createdAt && `Published on ${formatDate(blog.createdAt)}`}
              {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                <span> • Updated on {formatDate(blog.updatedAt)}</span>
              )}
            </p>
          </div>
          
          <div className="flex space-x-2 ml-4">
            <Link
              to={`/edit/${blog.id || blog._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Blog content - FIXED: Now renders HTML properly */}
      <article className="bg-white rounded-lg shadow-md p-8">
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

      {/* Author section */}
      {blog.author && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Author:</h3>
          <p className="text-gray-700">{blog.author}</p>
        </div>
      )}

      {/* Tags section */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link
            to="/create"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Write a new blog post
          </Link>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View all posts
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;