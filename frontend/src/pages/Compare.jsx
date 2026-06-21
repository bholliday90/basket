import React, { useState, useEffect } from 'react';

const Compare = () => {
  const [basket, setBasket] = useState([]);
  const [stores, setStores] = useState([]);
  const [allPrices, setAllPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedBasket = JSON.parse(localStorage.getItem('basket') || '[]');
    setBasket(savedBasket);
    fetchStores();
    
    if (savedBasket.length > 0) {
      fetchComparisonData(savedBasket);
    }

    const handleAdd = (e) => {
      const newItem = e.detail;
      setBasket(prev => {
        const updated = [...prev, newItem];
        localStorage.setItem('basket', JSON.stringify(updated));
        fetchComparisonData(updated);
        return updated;
      });
    };

    window.addEventListener('add-to-basket', handleAdd);
    return () => window.removeEventListener('add-to-basket', handleAdd);
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

  const fetchComparisonData = async (currentBasket) => {
    if (currentBasket.length === 0) {
      setAllPrices([]);
      return;
    }
    
    setLoading(true);
    try {
      const productIds = currentBasket.map(item => item.product.id).join(',');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/compare?ids=${productIds}`);
      const data = await response.json();
      setAllPrices(data);
    } catch (err) {
      console.error('Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  };

  const removeFromBasket = (index) => {
    const updated = basket.filter((_, i) => i !== index);
    setBasket(updated);
    localStorage.setItem('basket', JSON.stringify(updated));
    fetchComparisonData(updated);
  };

  // Group prices by store for calculation
  const storeComparison = stores.map(store => {
    const storePrices = allPrices.filter(p => p.store_slug === store.slug);
    
    // Check which items from our basket are available in this store
    const coverage = basket.map(item => {
      const priceEntry = storePrices.find(p => p.product_id === item.product.id);
      return {
        product_id: item.product.id,
        found: !!priceEntry,
        price: priceEntry ? priceEntry.price : null
      };
    });

    const itemsFound = coverage.filter(c => c.found);
    const total = itemsFound.reduce((sum, c) => sum + c.price, 0);
    
    return {
      ...store,
      total,
      foundCount: itemsFound.length,
      missingCount: basket.length - itemsFound.length,
      isComplete: itemsFound.length === basket.length
    };
  }).filter(s => s.foundCount > 0)
    .sort((a, b) => {
      // Sort by completeness first, then by total price
      if (a.isComplete && !b.isComplete) return -1;
      if (!a.isComplete && b.isComplete) return 1;
      return a.total - b.total;
    });

  return (
    <div className="p-4 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Your Basket</h1>
        <p className="text-gray-500">Compare your shopping list across stores</p>
      </div>

      {basket.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg font-bold">Your basket is empty</p>
          <p className="text-gray-400 text-sm mt-1">Add items from the search results to compare totals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-gray-800">Items ({basket.length})</h2>
              <button 
                onClick={() => {
                  setBasket([]);
                  localStorage.removeItem('basket');
                  setAllPrices([]);
                }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>
            
            {basket.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                    {item.product.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" /> : 'IMG'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.product.product_name}</h4>
                    <p className="text-xs text-gray-500">{item.product.category} • {item.product.unit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromBasket(idx)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 px-2">Store Comparison</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {storeComparison.map(store => (
                  <div key={store.id} className={`p-5 rounded-3xl border-2 transition-all ${store.isComplete ? 'bg-white border-green-500 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`font-bold text-lg ${store.isComplete ? 'text-gray-900' : 'text-gray-500'}`}>{store.name}</p>
                        <p className="text-xs font-medium">
                          {store.foundCount} of {basket.length} items found
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${store.isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                          ${store.total.toFixed(2)}
                        </p>
                        {store.isComplete && <span className="text-[10px] font-bold text-green-500 uppercase tracking-tight">Full List</span>}
                      </div>
                    </div>
                    
                    {store.isComplete && (
                      <button className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-700 transition-colors text-sm">
                        Shop at {store.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {!loading && storeComparison.length > 0 && storeComparison[0].isComplete && (
              <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-100">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.047a1 1 0 00-1.9 0l-2.147 6.156H1.3a1 1 0 00-.767 1.664l4.646 3.38-1.772 5.087a1 1 0 001.539 1.114l4.354-3.167 4.354 3.167a1 1 0 001.539-1.114l-1.772-5.087 4.646-3.38a1 1 0 00-.767-1.664h-5.953l-2.147-6.156z" clipRule="evenodd" />
                  </svg>
                  Best Value
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Shopping at <span className="text-green-400 font-bold">{storeComparison[0].name}</span> will save you the most money on this entire list.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
