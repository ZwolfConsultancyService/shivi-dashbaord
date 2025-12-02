import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetBlogsQuery, useGetBlogQuery , useGetTagsQuery, useGetAuthorsQuery, useDeleteBlogMutation } from '../../store/api/blogApi';
import { Search, Filter, Edit, Trash2, Eye, Calendar, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Select from 'react-select';


const BlogList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);


  const { data: blogsData, isLoading, error } = useGetBlogsQuery({
    page,
    limit: 10,
    search,
    author: selectedAuthor?.value || '',
    tags: selectedTags.map(tag => tag.value).join(','),
    sortBy
  });
  const { data: tagsData } = useGetTagsQuery();
  const { data: authorsData } = useGetAuthorsQuery();
  const [deleteBlog] = useDeleteBlogMutation();

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteBlog(id).unwrap();
        toast.success('Blog deleted successfully');
      } catch (error) {
        toast.error('Failed to delete blog');
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

  // Prepare options for selects
  const authorOptions = authorsData?.data?.map(author => ({
    value: author,
    label: author
  })) || [];

  const tagOptions = tagsData?.data?.map(tag => ({
    value: tag,
    label: tag
  })) || [];

  const sortOptions = [
    { value: '', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'author', label: 'Author (A-Z)' }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Error loading blogs</div>
        <p className="text-gray-600 mt-2">Please try again later</p>
      </div>
    );
  }

  const blogs = blogsData?.data || [];
  const pagination = blogsData?.pagination || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">All Blog Posts</h2>
        <Link
          to="/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <span>Create New Post</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Author Filter */}
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

              {/* Tags Filter */}
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

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {blogs.length} of {pagination.totalBlogs || 0} blogs
        </span>
        <span>
          Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
        </span>
      </div>

      {/* Blog Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No blogs found</div>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Blog Image */}
              {blog.images && blog.images.length > 0 && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={blog.images[0].url}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {blog.title}
                </h3>

                {/* Content Preview */}
                <div 
                  className="text-gray-600 text-sm mb-4 line-clamp-3"
                  dangerouslySetInnerHTML={{ 
                    __html: blog.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                  }}
                />

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Tag className="h-4 w-4 mr-1" />
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

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    to={`/blog/${blog._id}`}
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    {/* <Link
                      to={`/edit/${blog._id}`}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link> */}
                    
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

      {/* Pagination */}
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
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  pageNum === pagination.currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
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