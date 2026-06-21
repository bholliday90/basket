import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Compare from './pages/Compare'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">Basket</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <NavLink 
                to="/" 
                className={({isActive}) => `font-bold transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              >
                Explore
              </NavLink>
              <NavLink 
                to="/search" 
                className={({isActive}) => `font-bold transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              >
                Price Search
              </NavLink>
              <NavLink 
                to="/compare" 
                className={({isActive}) => `font-bold transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
              >
                Compare
              </NavLink>
            </nav>

            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="hidden sm:block bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                Sign In
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-20">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <span className="text-xl font-black tracking-tight">Basket</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                The smart way to shop. We scan thousands of prices so you don't have to. Save up to 40% on your weekly grocery bill.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link to="/search" className="hover:text-green-600">Search Prices</Link></li>
                <li><Link to="/compare" className="hover:text-green-600">Compare Stores</Link></li>
                <li><Link to="/" className="hover:text-green-600">Trending Deals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-green-600">Help Center</a></li>
                <li><a href="#" className="hover:text-green-600">Contact Us</a></li>
                <li><a href="#" className="hover:text-green-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Basket Technologies Inc. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
