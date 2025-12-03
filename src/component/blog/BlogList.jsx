import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, Eye, Calendar, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Select from 'react-select';
import axios from 'axios';

const API_BASE_URL =  "https://shivi-backend.onrender.com/api";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false
  });

  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Fetch tags and authors on component mount
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [tagsResponse, authorsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/blog/tags`),
          axios.get(`${API_BASE_URL}/blog/authors`)
        ]);
        
        setTags(tagsResponse.data.data || []);
        setAuthors(authorsResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching filters data:', error);
      }
    };

    fetchFiltersData();
  }, []);

  // Fetch blogs with filters
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit: 10,
        };

        if (search) params.search = search;
        if (selectedAuthor) params.author = selectedAuthor.value;
        if (selectedTags.length > 0) {
          params.tags = selectedTags.map(tag => tag.value).join(',');
        }
        if (sortBy) params.sortBy = sortBy;

    const response = await axios.get(`${API_BASE_URL}/blog/getAllblog`, { params });

    console.log("------",response.data.data);
    
        
        setBlogs(response.data.data || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalBlogs: 0,
          hasNext: false,
          hasPrev: false
        });
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError(error.response?.data?.message || 'Failed to fetch blogs');
        toast.error('Failed to load blogs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [page, search, selectedAuthor, selectedTags, sortBy]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/blog/${id}`);
        toast.success('Blog deleted successfully');
        
        // Refresh the blog list
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id));
        
        // If current page becomes empty, go to previous page
        if (blogs.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error(error.response?.data?.message || 'Failed to delete blog');
      }
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleAuthorChange = (selectedOption) => {
    setSelectedAuthor(selectedOption);
    setPage(1);
  };

  const handleTagsChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedAuthor(null);
    setSelectedTags([]);
    setSortBy('');
    setPage(1);
  };

  const authorOptions = authors.map(author => ({
    value: author,
    label: author
  }));

  const tagOptions = tags.map(tag => ({
    value: tag,
    label: tag
  }));

  const sortOptions = [
    { value: '', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'author', label: 'Author (A-Z)' }
  ];

  if (isLoading && blogs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Error loading blogs</div>
        <p className="text-gray-600 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );

    
  }



  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">All Blog Posts</h2>
        <Link
          to="/create"
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <span>Create New Post</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search blogs by title, content, or author..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <Select
                  value={selectedAuthor}
                  onChange={handleAuthorChange}
                  options={authorOptions}
                  isClearable
                  placeholder="Select author..."
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <Select
                  value={selectedTags}
                  onChange={handleTagsChange}
                  options={tagOptions}
                  isMulti
                  isClearable
                  placeholder="Select tags..."
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {blogs.length} of {pagination.totalBlogs || 0} blogs
        </span>
        <span>
          Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No blogs found</div>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              {blog.images && blog.images.length > 0 && (
                <div className="aspect-video bg-gray-100 flex-shrink-0">
                <img
  src={blog.images?.[0]?.url}
  alt={blog.title}
  className="w-full h-full object-cover"
/>

                </div>

                
              )}

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 h-14">
                  {blog.title}
                </h3>

                <div 
                  className="text-gray-600 text-sm mb-4 line-clamp-3 h-16"
                  dangerouslySetInnerHTML={{ 
                    __html: blog.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                  }}
                />

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{blog.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex items-start text-sm text-gray-500">
                      <Tag className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{blog.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <Link
                    to={`/blog/${blog._id}`}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit/${blog._id}`}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(blog._id, blog.title)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 7) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 4) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 6 + i;
              } else {
                pageNum = pagination.currentPage - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    pageNum === pagination.currentPage
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;