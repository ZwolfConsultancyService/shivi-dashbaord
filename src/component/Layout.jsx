import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, BookOpen, Plus, Home, FileText, BadgePoundSterlingIcon } from 'lucide-react';
import { ImBlog } from "react-icons/im";

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Blog Dashboard</h1>
            </div>
            
            <nav className="flex items-center space-x-1 sm:space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ImBlog className="h-4 w-4" />
                <span className="hidden sm:inline">Blog</span>
              </Link>
              
              <Link
                to="/create"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/create')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Post</span>
              </Link>
              
              {/* <Link
                to="/forms"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/forms')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Forms</span>
              </Link> */}


                <Link
                to="/places/categories"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/forms')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BadgePoundSterlingIcon className="h-4 w-4" />
                <span className="hidden sm:inline">TravelPlacesApp</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <PenTool className="h-4 w-4" />
            <span className="text-sm">Blog Management Dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;