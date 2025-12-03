import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Layout from './component/Layout';
import BlogList from './component/blog/BlogList';
import BlogForm from './component/blog/BlogForm';
import BlogDetail from './component/blog/BlogDetail';
import './index.css';
import Form from './component/form/Form';
import TravelPlacesApp from './component/category/TravelPlacesApp';
import CategoryList from './component/category/CategoryList';
import CategoryDetail from './component/category/CategoryDetail';
import CreateCategory from './component/category/CreateCategory';
import AddPlace from './component/category/AddPlace';
import PlaceDetail from './component/category/PlaceDetail';

function App() {
  return (
    <Provider store={store}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Layout>
            <Routes>

              <Route path="/forms" element={<Form />} />
              <Route path="/" element={<BlogList />} />
              <Route path="/create" element={<BlogForm />} />
              <Route path="/edit/:id" element={<BlogForm />} />
              <Route path="/blog/:id" element={<BlogDetail />} />

              <Route path="/places" element={<TravelPlacesApp />} />
              <Route path="/places/categories" element={<CategoryList />} />
              <Route path="/places/category/:id" element={<CategoryDetail />} />
              <Route path="/places/create-category" element={<CreateCategory />} />
              <Route path="/places/add-place" element={<AddPlace />} />
              <Route path="/places/place/:id" element={<PlaceDetail />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
