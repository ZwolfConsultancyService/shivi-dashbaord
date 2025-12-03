import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shivi-backend.onrender.com/api';

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
  tagTypes: ['Blog', 'Category'],
  endpoints: (builder) => ({
    // ============ BLOG ENDPOINTS ============
    
    // Get all blogs with search, category, and tags filters
    getBlogs: builder.query({
      query: ({ 
        search = '', 
        category = '', 
        tags = ''
      } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (tags) params.append('tags', tags);
                
        return `/blog/getAllblog?${params.toString()}`;
      },
      providesTags: ['Blog'],
    }),

    // Get only published blogs
    getPublishedBlogs: builder.query({
      query: () => '/blog/published',
      providesTags: ['Blog'],
    }),

    // Get single blog by ID
    getBlog: builder.query({
      query: (id) => `/blog/${id}`,
      providesTags: (result, error, id) => [{ type: 'Blog', id }],
    }),

    // Create blog post
    createBlog: builder.mutation({
      query: (blogData) => ({
        url: '/blog/create',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: ['Blog'],
    }),

    // Update blog post
    updateBlog: builder.mutation({
      query: ({ id, ...blogData }) => ({
        url: `/blog/${id}`,
        method: 'PUT',
        body: blogData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Blog', id }, 'Blog'],
    }),

    // Delete blog post
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),

    // Upload image (ImageKit)
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/blog/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),

    // ============ CATEGORY ENDPOINTS ============
    
    // Get all categories
    getCategories: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
      transformResponse: (response) => {
        // Transform to match expected format
        return {
          success: true,
          data: response.data || response
        };
      },
    }),

    // Simple categories list (for dropdowns)
    getCategoriesSimple: builder.query({
      query: () => '/categories',
      providesTags: ['Category'],
      transformResponse: (response) => {
        return {
          success: true,
          data: response.data || response
        };
      },
    }),

    // Get single category by ID
    getCategory: builder.query({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
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

    // ============ HELPER ENDPOINTS ============
    // These extract data from blogs for filters
    
    // Get unique tags from all blogs
    getTags: builder.query({
      query: () => '/blog/getAllblog',
      transformResponse: (response) => {
        const blogs = response.data || [];
        const allTags = blogs.flatMap(blog => blog.tags || []);
        const uniqueTags = [...new Set(allTags)];
        return {
          success: true,
          data: uniqueTags
        };
      },
      providesTags: ['Blog'],
    }),

    // Get unique authors from all blogs
    getAuthors: builder.query({
      query: () => '/blog/getAllblog',
      transformResponse: (response) => {
        const blogs = response.data || [];
        const allAuthors = blogs.map(blog => blog.author).filter(Boolean);
        const uniqueAuthors = [...new Set(allAuthors)];
        return {
          success: true,
          data: uniqueAuthors
        };
      },
      providesTags: ['Blog'],
    }),
  }),
});

export const {
  // Blog hooks
  useGetBlogsQuery,
  useGetPublishedBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useUploadImageMutation,
  
  // Category hooks
  useGetCategoriesQuery,
  useGetCategoriesSimpleQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Helper hooks
  useGetTagsQuery,
  useGetAuthorsQuery,
} = blogApi;