import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zwolf-blogwebsite-backend.onrender.com/api';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      if (endpoint !== 'uploadImage') {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  tagTypes: ['Blog', 'Category', 'Tags', 'Authors', 'Stats'],
  endpoints: (builder) => ({
    // BLOG ENDPOINTS
    
    // Get all blogs with pagination, search, and filters
    getBlogs: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = '', 
        author = '', 
        tags = '', 
        includeUnpublished = false,
        published = '',
        dateFrom = '',
        dateTo = '',
        sortBy = 'publishedAt'
      } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (author) params.append('author', author);
        if (tags) params.append('tags', tags);
        if (includeUnpublished) params.append('includeUnpublished', 'true');
        if (published !== '') params.append('published', published);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (sortBy) params.append('sortBy', sortBy);
                
        return `/blogs/fetch?${params.toString()}`;
      },
      providesTags: ['Blog'],
    }),

    // Get only published blogs
    getPublishedBlogs: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        
        return `/blogs/published?${params.toString()}`;
      },
      providesTags: ['Blog'],
    }),

    // Get blogs by category
    getBlogsByCategory: builder.query({
      query: ({ 
        categoryId, 
        page = 1, 
        limit = 10, 
        search = '', 
        author = '', 
        tags = '', 
        includeUnpublished = false,
        dateFrom = '',
        dateTo = '',
        sortBy = 'publishedAt'
      }) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (author) params.append('author', author);
        if (tags) params.append('tags', tags);
        if (includeUnpublished) params.append('includeUnpublished', 'true');
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (sortBy) params.append('sortBy', sortBy);
                
        return `/blogs/category/${categoryId}?${params.toString()}`;
      },
      providesTags: ['Blog'],
    }),

    // Get single blog by ID
    getBlog: builder.query({
      query: ({ id, includeUnpublished = false }) => {
        const params = includeUnpublished ? '?includeUnpublished=true' : '';
        return `/blogs/${id}${params}`;
      },
      providesTags: (result, error, { id }) => [{ type: 'Blog', id }],
    }),

    // Create blog post
    createBlog: builder.mutation({
      query: (blogData) => ({
        url: '/blogs/create',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: ['Blog', 'Stats'],
    }),

    // Update blog post
    updateBlog: builder.mutation({
      query: ({ id, ...blogData }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: blogData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blog', 'Stats'],
    }),

    // Toggle publish status
    togglePublishStatus: builder.mutation({
      query: ({ id, isPublished }) => ({
        url: `/blogs/${id}/toggle-publish`,
        method: 'PATCH',
        body: { isPublished },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blog', 'Stats'],
    }),

    // Delete blog post
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog', 'Stats'],
    }),

    // Upload image for blog post
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/blogs/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),

    // Get blog statistics
    getBlogStats: builder.query({
      query: () => '/blogs/stats',
      providesTags: ['Stats'],
    }),

    // Get all unique tags from blog posts
    getTags: builder.query({
      query: ({ includeUnpublished = false } = {}) => {
        const params = includeUnpublished ? '?includeUnpublished=true' : '';
        return `/blogs/tags${params}`;
      },
      providesTags: ['Tags'],
    }),

    // Get all unique authors from blog posts  
    getAuthors: builder.query({
      query: ({ includeUnpublished = false } = {}) => {
        const params = includeUnpublished ? '?includeUnpublished=true' : '';
        return `/blogs/authors${params}`;
      },
      providesTags: ['Authors'],
    }),

    // CATEGORY ENDPOINTS

    // Get all categories with pagination
    getCategories: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = '', 
        sortBy = 'createdAt' 
      } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);
        
        return `/categories/fetch?${params.toString()}`;
      },
      providesTags: ['Category'],
    }),

    // Get simple category list (for dropdowns)
    getCategoriesSimple: builder.query({
      query: () => '/categories/list',
      providesTags: ['Category'],
    }),

    // Get categories with their blogs
    getCategoriesWithBlogs: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        blogLimit = 5, 
        includeUnpublished = false 
      } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (blogLimit) params.append('blogLimit', blogLimit.toString());
        if (includeUnpublished) params.append('includeUnpublished', 'true');
        
        return `/categories/with-blogs?${params.toString()}`;
      },
      providesTags: ['Category', 'Blog'],
    }),

    // Get single category by ID
    getCategory: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Get category with its blogs
    getCategoryWithBlogs: builder.query({
      query: ({ 
        id, 
        page = 1, 
        limit = 10, 
        includeUnpublished = false 
      }) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (includeUnpublished) params.append('includeUnpublished', 'true');
        
        return `/categories/${id}/with-blogs?${params.toString()}`;
      },
      providesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Blog'],
    }),

    // Get category by name
    getCategoryByName: builder.query({
      query: (name) => `/categories/name/${name}`,
      providesTags: (result, error, name) => [{ type: 'Category', id: name }],
    }),

    // Create category
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories/create',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    // Update category
    updateCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category'],
    }),

    // Delete category
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Get category statistics
    getCategoryStats: builder.query({
      query: () => '/categories/stats',
      providesTags: ['Category', 'Stats'],
    }),
  }),
});

export const {
  // Blog hooks
  useGetBlogsQuery,
  useGetPublishedBlogsQuery,
  useGetBlogsByCategory,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useTogglePublishStatusMutation,
  useDeleteBlogMutation,
  useUploadImageMutation,
  useGetBlogStatsQuery,
  useGetTagsQuery,
  useGetAuthorsQuery,
  
  // Category hooks
  useGetCategoriesQuery,
  useGetCategoriesSimpleQuery,
  useGetCategoriesWithBlogsQuery,
  useGetCategoryQuery,
  useGetCategoryWithBlogsQuery,
  useGetCategoryByNameQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryStatsQuery,
} = blogApi;