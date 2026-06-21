import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const storeParam = searchParams.get('store') || '';
  const categoryParam = searchParams.get('category') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterStore, setFilterStore] = useState(storeParam);
  const [filterCategory, setFilterCategory] = useState(categoryParam);
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (queryParam) {
      handleSearch(queryParam, filterStore);
    }
  }, [queryParam, filterStore]);

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

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSearch = async (query, store = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      let url = `${apiUrl}/api/products/search?q=${encodeURIComponent(query)}`;
      if (store) url += `&store=${encodeURIComponent(store)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      
      // Group results by product_id
      const grouped = data.reduce((acc, item) => {
        if (!acc[item.product_id]) {
          acc[item.product_id] = {
            product: {
              id: item.product_id,
              product_name: item.product_name,
              category: item.category,
              unit: item.unit,
              image_url: item.image_url
            },
            prices: []
          };
        }
        acc[item.product_id].prices.push({
          store_name: item.store_name,
          store_slug: item.store_slug,
          store_url: item.store_url,
          price: item.price,
          unit_price: item.unit_price,
          fetched_at: item.fetched_at
        });
        return acc;
      }, {});
      
      let finalResults = Object.values(grouped);
      
      // Client-side filtering
      if (filterCategory) {
        finalResults = finalResults.filter(group => group.product.category === filterCategory);
      }

      if (filterPriceMax) {
        finalResults = finalResults.filter(group => 
          group.prices.some(p => p.price <= parseFloat(filterPriceMax))
        );
      }
      
      // Client-side sorting
      finalResults = sortResults(finalResults, sortBy);
      
      setResults(finalResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortResults = (data, sortType) => {
    const sorted = [...data];
    if (sortType === 'price-asc') {
      sorted.sort((a, b) => Math.min(...a.prices.map(p => p.price)) - Math.min(...b.prices.map(p => p.price)));
    } else if (sortType === 'price-desc') {
      sorted.sort((a, b) => Math.max(...b.prices.map(p => p.price)) - Math.max(...a.prices.map(p => p.price)));
    } else if (sortType === 'name-asc') {
      sorted.sort((a, b) => a.product.product_name.localeCompare(b.product.product_name));
    }
    return sorted;
  };

  const onSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setResults(sortResults(results, newSortBy));
  };

  const onStoreFilterChange = (e) => {
    const newStore = e.target.value;
    setFilterStore(newStore);
    setSearchParams({ q: queryParam, store: newStore, category: filterCategory });
  };

  const onCategoryFilterChange = (e) => {
    const newCategory = e.target.value;
    setFilterCategory(newCategory);
    setSearchParams({ q: queryParam, store: filterStore, category: newCategory });
    // Trigger re-filter
    handleSearch(queryParam, filterStore);
  };

  const triggerSearch = (q) => {
    setSearchParams({ q, store: filterStore, category: filterCategory });
  };

  const onPriceFilterChange = (e) => {
    const val = e.target.value;
    setFilterPriceMax(val);
    handleSearch(queryParam, filterStore);
  };

  return (
    <div className="p-4 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Price Comparison</h1>
        <p className="text-gray-500">Real-time grocery prices across all stores</p>
      </div>

      <SearchBar onSearch={triggerSearch} initialValue={queryParam} />

      {queryParam && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto flex-1">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store</label>
                <select 
                  value={filterStore} 
                  onChange={onStoreFilterChange}
                  className="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                >
                  <option value="">All Stores</option>
                  {stores.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={filterCategory} 
                  onChange={onCategoryFilterChange}
                  className="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Max Price</label>
                <input 
                  type="number"
                  value={filterPriceMax}
                  onChange={onPriceFilterChange}
                  placeholder="e.g. 5"
                  className="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={onSortChange}
                  className="w-full mt-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                >
                  <option value="price-asc">Cheapest First</option>
                  <option value="price-desc">Highest Price</option>
                  <option value="name-asc">Product Name</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <div className="text-sm font-bold text-gray-400">
              Showing {results.length} matching products
            </div>
            {queryParam && (
              <button 
                onClick={() => {
                  setSearchParams({});
                  setResults([]);
                  setFilterStore('');
                  setFilterCategory('');
                  setFilterPriceMax('');
                }}
                className="text-xs font-bold text-red-400 hover:text-red-500"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6 pb-20">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-6">
            {results.map((group) => (
              <ProductCard 
                key={group.product.id} 
                product={group.product} 
                prices={group.prices} 
              />
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && queryParam && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg font-bold">No products found for "{queryParam}"</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
