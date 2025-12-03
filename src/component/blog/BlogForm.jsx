import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Upload, X, Save, ArrowLeft, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = "https://shivi-backend.onrender.com/api";

const BlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const fileInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [categories, setCategories] = useState([]);
const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      author: "",
      tags: [],
      isPublished: true,
    },
  });

  const watchedTags = watch("tags");
  const watchedIsPublished = watch("isPublished");

  // Fetch blog data if editing
  useEffect(() => {
    const fetchBlog = async () => {
      if (!isEditing) return;

      setIsLoading(true);
      try {
    const response = await axios.get(`${API_BASE_URL}/blog/${id}`);
        const blog = response.data.data;

        setValue("title", blog.title);
        setValue("content", blog.content);
        setValue("author", blog.author);
        setValue("tags", blog.tags || []);
        setValue("isPublished", blog.isPublished);
        setUploadedImages(blog.images || []);
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to load blog data");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [id, isEditing, setValue, navigate]);


  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/getAllCategories`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  fetchCategories();
}, []); 

  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate file size (5MB max per file)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed 5MB limit");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.post(`${API_BASE_URL}/blog/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data.data;
      });

      const uploadedImageData = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...uploadedImageData]);
      toast.success(`${uploadedImageData.length} image(s) uploaded successfully`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload images";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = async (index) => {
    const imageToRemove = uploadedImages[index];
    
    // If image has fileId, it's already uploaded to ImageKit
    if (imageToRemove.fileId) {
      try {
        // Note: You might want to call a delete endpoint here
        // For now, we'll just remove it from the state
        console.log("Image will be deleted when blog is saved:", imageToRemove.fileId);
      } catch (error) {
        console.error("Error marking image for deletion:", error);
      }
    }
    
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      const currentTags = watchedTags || [];

      // Validate tag length
      if (newTag.length > 50) {
        toast.error("Tag cannot exceed 50 characters");
        return;
      }

      if (!currentTags.includes(newTag)) {
        setValue("tags", [...currentTags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = watchedTags || [];
    setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const blogData = {
        ...data,
        images: uploadedImages,
      };

      let response;
      if (isEditing) {
        response = await axios.put(`${API_BASE_URL}/blog/${id}`, blogData);
        toast.success("Blog updated successfully");
      } else {
       response = await axios.post(`${API_BASE_URL}/blog/create`, blogData);
        toast.success("Blog created successfully");
      }

      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          (isEditing ? "Failed to update blog" : "Failed to create blog");
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      } else {
        toast.error(errorMessage);
      }
      
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "script", "indent", "blockquote",
    "code-block", "color", "background", "align", "link"
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Posts</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          {/* Title Field */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              {...register("title", {
                required: "Title is required",
                maxLength: {
                  value: 200,
                  message: "Title cannot exceed 200 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter blog title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Author Field */}
          <div className="mb-6">
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author *
            </label>
            <input
              type="text"
              id="author"
              {...register("author", {
                required: "Author is required",
                maxLength: {
                  value: 100,
                  message: "Author name cannot exceed 100 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter author name..."
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">
                {errors.author.message}
              </p>
            )}
          </div>

          {/* Published Status */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("isPublished")}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Publish immediately
              </span>
              {watchedIsPublished ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {watchedIsPublished 
                ? "This blog will be visible to everyone" 
                : "This blog will be saved as draft"}
            </p>
          </div>

          {/* Tags Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Type a tag and press Enter..."
            />
            {watchedTags && watchedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Images Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleImageUploadClick}
                    disabled={isUploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Images"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
    Category *
  </label>
  <select
    id="category"
    {...register("category", { required: "Category is required" })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
  >
    <option value="">Select a category</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.name}
      </option>
    ))}
  </select>
  {errors.category && (
    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
  )}
</div>

          {/* Content Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <Controller
              name="content"
              control={control}
              rules={{
                required: "Content is required",
                minLength: {
                  value: 10,
                  message: "Content must be at least 10 characters long",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <ReactQuill
                  theme="snow"
                  value={value}
                  onChange={onChange}
                  modules={quillModules}
                  formats={quillFormats}
                  className="bg-white"
                  style={{ minHeight: "300px" }}
                />
              )}
            />

            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{isEditing ? "Updating..." : "Creating..."}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditing ? "Update Post" : "Create Post"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;