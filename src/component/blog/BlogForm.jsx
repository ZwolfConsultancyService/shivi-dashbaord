import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGetBlogQuery,
  useUploadImageMutation,
  useGetCategoriesQuery,
} from "../../store/api/blogApi";
import { Upload, X, Save, ArrowLeft, Image as ImageIcon, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const BlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  // Add debugging
  console.log("URL params:", useParams());
  console.log("ID from params:", id);
  console.log("Is editing:", isEditing);
  
  const imageInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: blogData, isLoading: isBlogLoading, error: blogError } = useGetBlogQuery(id, {
    skip: !isEditing,
    refetchOnMountOrArgChange: true,
  });
  
  // Add debugging for blog data
  console.log("Blog data:", blogData);
  console.log("Blog loading:", isBlogLoading);
  console.log("Blog error:", blogError);
  
  const { data: authorsData } = useGetAuthorsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [uploadImage] = useUploadImageMutation();

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
      category: "",
      tags: [],
      images: [],
      author: "",
      publishedAt: "",
      isPublished: true,
    },
  });

  const watchedTags = watch("tags");
  const watchedIsPublished = watch("isPublished");
  const watchedPublishedAt = watch("publishedAt");

  useEffect(() => {
    if (isEditing && blogData?.data) {
      const blog = blogData.data;
      console.log("Setting form values with blog data:", blog);
      setValue("title", blog.title || "");
      setValue("content", blog.content || "");
      setValue("category", blog.category?._id || blog.category || "");
      setValue("tags", blog.tags || []);
      setValue("author", blog.author || "");
      setValue("publishedAt", blog.publishedAt ? new Date(blog.publishedAt).toISOString().slice(0, 16) : "");
      setValue("isPublished", blog.isPublished !== undefined ? blog.isPublished : true);
      setImages(blog.images || []);
    }
  }, [blogData, setValue, isEditing]);

  const handleImageUploadClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setIsUploadingImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB.`);
        }

        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not a valid image.`);
        }

        const formData = new FormData();
        formData.append("image", file);

        const response = await uploadImage(formData).unwrap();
        return {
          url: response.data.url,
          fileId: response.data.fileId || response.data.id,
          name: response.data.name || file.name
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      const errorMessage = error.data?.message || error.message || "Failed to upload images";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      const currentTags = watchedTags || [];

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
    try {
      const blogData = {
        ...data,
        images: images,
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString(),
      };

      console.log("Submitting blog data:", blogData);

      if (isEditing) {
        console.log("Updating blog with ID:", id);
        await updateBlog({ id, ...blogData }).unwrap();
        toast.success("Blog updated successfully");
      } else {
        console.log("Creating new blog");
        await createBlog(blogData).unwrap();
        toast.success("Blog created successfully");
      }

      navigate("/");
    } catch (error) {
      toast.error(
        isEditing ? "Failed to update blog" : "Failed to create blog"
      );
      console.error("Submit error:", error);
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
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent', 'blockquote',
    'code-block', 'color', 'background', 'align', 'link'
  ];

  // Show debugging info in the UI during development
  if (process.env.NODE_ENV === 'development') {
    console.log("=== BlogForm Debug Info ===");
    console.log("ID:", id);
    console.log("IsEditing:", isEditing);
    console.log("BlogData:", blogData);
    console.log("isBlogLoading:", isBlogLoading);
    console.log("blogError:", blogError);
  }

  if (isEditing && isBlogLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="ml-4">
          <p>Loading blog data...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-gray-500">ID: {id}</p>
          )}
        </div>
      </div>
    );
  }

  if (isEditing && blogError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Error loading blog</div>
        <p className="text-gray-600 mt-2">
          {blogError.data?.message || blogError.message || "Please try again later"}
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-sm text-gray-500">
            <p>ID: {id}</p>
            <p>Error: {JSON.stringify(blogError, null, 2)}</p>
          </div>
        )}
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Posts</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? `Edit Blog Post ${id ? `(ID: ${id})` : ''}` : "Create New Blog Post"}
        </h1>
        
        {/* Development debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            <p><strong>Debug:</strong> ID={id}, isEditing={String(isEditing)}, hasData={Boolean(blogData?.data)}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter blog title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              {...register("category", {
                required: "Category is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {categoriesData?.data?.map((category) => (
                <option key={category._id || category.id} value={category._id || category.id}>
                  {category.name || category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author *
            </label>
            <select
              id="author"
              {...register("author", {
                required: "Author is required",
                maxLength: {
                  value: 100,
                  message: "Author name cannot exceed 100 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select author...</option>
              {authorsData?.data?.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">
                {errors.author.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Type a tag and press Enter..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Tags will be automatically converted to lowercase
            </p>
            {watchedTags && watchedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleImageUploadClick}
                    disabled={isUploadingImage}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {isUploadingImage ? "Uploading..." : "Upload Images"}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG up to 5MB each. Multiple files supported.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="publishedAt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Calendar className="inline h-4 w-4 mr-1" />
                Publish Date
              </label>
              <input
                type="datetime-local"
                id="publishedAt"
                {...register("publishedAt")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty for current date/time
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Status
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  {...register("isPublished")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                  Published
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Uncheck to save as draft
              </p>
            </div>
          </div>

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

          {watchedIsPublished && watchedPublishedAt && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Will be published on: {new Date(watchedPublishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          )}

          {!watchedIsPublished && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <span className="text-sm font-medium text-yellow-800">
                  📝 This post will be saved as a draft
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isCreating || isUpdating ? (
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