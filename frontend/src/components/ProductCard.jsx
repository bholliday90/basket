import React from 'react';

const ProductCard = ({ product, prices }) => {
  const cheapestPrice = Math.min(...prices.map(p => p.price));

  const handleShopClick = async (e, storeSlug, productId, originalUrl) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/affiliate/${storeSlug}/${productId}?url=${encodeURIComponent(originalUrl)}`);
      const data = await response.json();
      if (data.affiliateUrl) {
        window.open(data.affiliateUrl, '_blank');
      } else {
        window.open(originalUrl, '_blank');
      }
    } catch (err) {
      console.error('Affiliate link error:', err);
      window.open(originalUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 flex gap-4">
        <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-300">No Image</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-900 truncate">{product.product_name}</h3>
              <p className="text-sm text-gray-500">{product.category} • {product.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Cheapest</p>
              <p className="text-xl font-black text-green-600">${cheapestPrice.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prices.map((price, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${price.price === cheapestPrice ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-gray-700">{price.store_name}</span>
                  <span className={`text-sm font-bold ${price.price === cheapestPrice ? 'text-green-600' : 'text-gray-900'}`}>
                    ${price.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Unit: ${price.unit_price?.toFixed(2)}/{product.unit}</span>
                    {price.fetched_at && (
                      <span className="text-[8px] text-gray-300">
                        Updated: {new Date(price.fetched_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('add-to-basket', { detail: { product, price } }))}
                      className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200 transition-colors"
                    >
                      + List
                    </button>
                    <button 
                      onClick={(e) => handleShopClick(e, price.store_slug, product.id, price.store_url || 'https://www.google.com')}
                      className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      Shop <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
