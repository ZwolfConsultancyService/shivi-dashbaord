import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  User, 
  Calendar, 
  Search, 
  Edit, 
  Eye, 
  Plus,
  FileText,
  Tag,
  AlertCircle,
  Image,
  X
} from "lucide-react";
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGetCategoriesSimpleQuery,
  useGetTagsQuery,
  useGetAuthorsQuery,
  useUploadImageMutation
} from '../../store/api/blogApi';

const BlogPostForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    published: '', // true/false for published status
    author: '', // filter by author
    tags: '', // filter by tags
    dateFrom: '', // date range from
    dateTo: '', // date range to
    sortBy: 'publishedAt' // sort by field
  });
  
  // Form state matching your blog schema exactly
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    category: "",
    tags: "",
    images: [],
    isPublished: true // Default to published as per your schema
  });

  // RTK Query hooks with correct parameters
  const {
    data: blogsData,
    isLoading: blogsLoading,
    error: blogsError,
    refetch: refetchBlogs
  } = useGetBlogsQuery({
    page,
    limit: 10,
    search: searchTerm,
    author: filters.author,
    tags: filters.tags,
    published: filters.published,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    sortBy: filters.sortBy,
    includeUnpublished: true // Include unpublished for admin panel
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useGetCategoriesSimpleQuery();

  const {
    data: tagsData
  } = useGetTagsQuery({ includeUnpublished: true });

  const {
    data: authorsData
  } = useGetAuthorsQuery({ includeUnpublished: true });

  // Mutations
  const [createBlog, { 
    isLoading: createLoading,
    error: createError 
  }] = useCreateBlogMutation();

  const [updateBlog, { 
    isLoading: updateLoading,
    error: updateError 
  }] = useUpdateBlogMutation();

  const [deleteBlog, { 
    isLoading: deleteLoading 
  }] = useDeleteBlogMutation();

  const [uploadImage, { 
    isLoading: uploadLoading 
  }] = useUploadImageMutation();

  // Extract data from RTK Query responses
  const blogPosts = blogsData?.data || [];
  const pagination = blogsData?.pagination || {};
  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];
  const authors = authorsData?.data || [];

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formDataImg = new FormData();
      formDataImg.append('image', file);
      
      try {
        const result = await uploadImage(formDataImg).unwrap();
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            url: result.data.url,
            fileId: result.data.fileId,
            name: result.data.name || file.name
          }]
        }));
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }
  };

  // Remove image from form
  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Create or update blog post
  const handleSubmit = async () => {
    try {
      const submitData = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: formData.images,
        isPublished: formData.isPublished
      };

      if (editingPost) {
        await updateBlog({ id: editingPost._id, ...submitData }).unwrap();
      } else {
        await createBlog(submitData).unwrap();
      }

      resetForm();
      
    } catch (err) {
      console.error('Error saving blog post:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      author: "",
      category: "",
      tags: "",
      images: [],
      isPublished: true
    });
    setShowCreateForm(true);
    setEditingPost(null);
  };

  // Delete blog post
  const handleDeleteBlogPost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      await deleteBlog(id).unwrap();
    } catch (err) {
      console.error('Error deleting blog post:', err);
    }
  };

  // Edit blog post
  const editBlogPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      content: post.content || "",
      author: post.author || "",
      category: post.category?._id || "",
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : "",
      images: post.images || [],
      isPublished: post.isPublished !== undefined ? post.isPublished : true
    });
    setShowCreateForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isPublished) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isPublished 
          ? "bg-green-100 text-green-800" 
          : "bg-yellow-100 text-yellow-800"
      }`}>
        {isPublished ? 'Published' : 'Draft'}
      </span>
    );
  };

  // Handle loading state
  if (blogsLoading && !blogPosts.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  const error = blogsError || createError || updateError;
  const isSubmitting = createLoading || updateLoading || deleteLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Search and Create Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Blog Posts Management
              </h1>
              <p className="text-gray-600">
                Create, manage and view all blog posts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setEditingPost(null);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                New Post
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              value={filters.published}
              onChange={(e) => setFilters({...filters, published: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
            
            <select
              value={filters.author}
              onChange={(e) => setFilters({...filters, author: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Authors</option>
              {authors.map((author, index) => (
                <option key={index} value={author}>
                  {author}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by tags"
              value={filters.tags}
              onChange={(e) => setFilters({...filters, tags: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="publishedAt">Sort by Published Date</option>
              <option value="createdAt">Sort by Created Date</option>
              <option value="title">Sort by Title</option>
              <option value="author">Sort by Author</option>
            </select>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title * <span className="text-xs text-gray-500">(max 200 characters)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author * <span className="text-xs text-gray-500">(max 100 characters)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    list="authors-list"
                  />
                  <datalist id="authors-list">
                    {authors.map((author, index) => (
                      <option key={index} value={author} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="mt-1 text-sm text-gray-500">
                  Auto-generated excerpt: {formData.content.length > 150 
                    ? formData.content.substring(0, 150) + '...' 
                    : formData.content || 'No content yet...'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={categoriesLoading}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Published</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags <span className="text-xs text-gray-500">(comma-separated, max 50 chars each)</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="technology, web development, react"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  list="tags-list"
                />
                <datalist id="tags-list">
                  {tags.map((tag, index) => (
                    <option key={index} value={tag} />
                  ))}
                </datalist>
              </div>

              {/* Images Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {uploadLoading && (
                  <div className="mt-2 text-sm text-indigo-600">Uploading images...</div>
                )}
                
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="mt-1 text-xs text-gray-600 truncate">
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p>Error: {error?.data?.message || error?.message || 'Something went wrong'}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pagination.totalBlogs || blogPosts.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogPosts.filter(post => post.isPublished).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Edit className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogPosts.filter(post => !post.isPublished).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Image className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">With Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blogPosts.filter(post => post.images && post.images.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts List */}
        {blogPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No blog posts found
            </h3>
            <p className="text-gray-600">
              {searchTerm || Object.values(filters).some(f => f)
                ? "No posts match your search criteria."
                : "No blog posts created yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogPosts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {post.title}
                            </p>
                            {post.tags && post.tags.length > 0 && (
                              <p className="text-xs text-gray-500">
                                {post.tags.slice(0, 3).join(', ')}{post.tags.length > 3 ? '...' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          {post.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.isPublished)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Image className="h-4 w-4 text-gray-400 mr-1" />
                          {post.images?.length || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(post.publishedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editBlogPost(post)}
                            disabled={isSubmitting}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center disabled:opacity-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBlogPost(post._id)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-900 transition-colors flex items-center disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(page * 10, pagination.totalBlogs)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalBlogs}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        {page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostForm;