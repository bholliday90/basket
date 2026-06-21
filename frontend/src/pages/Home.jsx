import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetchStores();
    fetchDeals();
  }, []);

  const fetchStores = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/stores`);
      const data = await response.json();
      setStores(data);
    } catch (err) {
      console.error('Failed to fetch stores');
    }
  };

  const fetchDeals = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/deals`);
      const data = await response.json();
      setDeals(data);
    } catch (err) {
      console.error('Failed to fetch deals');
    }
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const popularSearches = ['Milk', 'Eggs', 'Bread', 'Bananas', 'Chicken', 'Apples'];

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-black text-gray-900 leading-tight">
          Stop Overpaying for <br/>
          <span className="text-green-600">Your Groceries.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Compare prices across every major store in your area instantly. 
          Build your list around the best deals.
        </p>
        
        <SearchBar onSearch={handleSearch} />
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <span className="text-sm text-gray-400 font-medium py-1">Popular:</span>
          {popularSearches.map(term => (
            <button 
              key={term}
              onClick={() => handleSearch(term)}
              className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Store Selector */}
      <section className="px-4 space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Store</h2>
          <Link to="/search" className="text-green-600 font-bold hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stores.map(store => (
            <button
              key={store.id}
              onClick={() => navigate(`/search?store=${store.slug}&q=Milk`)}
              className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-green-500 shadow-sm transition-all text-center space-y-3"
            >
              <div className="w-12 h-12 bg-green-50 rounded-full mx-auto flex items-center justify-center text-green-600 font-bold text-xl">
                {store.name[0]}
              </div>
              <span className="block font-bold text-gray-800">{store.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Deals */}
      <section className="px-4 space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-900">Trending Deals</h2>
          <span className="text-gray-400 text-sm">Updated just now</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl border border-gray-100 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleSearch(deal.product_name)}>
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                {deal.image_url ? (
                  <img src={deal.image_url} alt={deal.product_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-300">Image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{deal.product_name}</h3>
                <p className="text-sm text-gray-400">{deal.store_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-green-600">${deal.price.toFixed(2)}</span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best Price</span>
                </div>
              </div>
              <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
