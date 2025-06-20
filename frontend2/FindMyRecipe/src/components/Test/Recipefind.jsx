import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const FILTER_CATEGORIES = {
  cuisine: '/recipes/cuisines',
  course: '/recipes/courses',
  diet: '/recipes/diets',
};

const RecipeFind = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useRef();

  // Parse initial filters from URL
  const parseQueryParams = () => {
    const params = new URLSearchParams(location.search);
    const parsed = {};
    for (let key of Object.keys(FILTER_CATEGORIES)) {
      parsed[key] = params.getAll(key);
    }
    return parsed;
  };

  const [filters, setFilters] = useState(parseQueryParams);
  const [options, setOptions] = useState({ cuisine: [], course: [], diet: [] });
  const [searchInputs, setSearchInputs] = useState({ cuisine: '', course: '', diet: '' });
  const [openFilter, setOpenFilter] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load filter options
  useEffect(() => {
    Object.entries(FILTER_CATEGORIES).forEach(async ([key, endpoint]) => {
      try {
        const res = await axios.get(`https://accmovies.pythonanywhere.com${endpoint}`);
        const dataKey = Object.keys(res.data)[0];
        setOptions(prev => ({ ...prev, [key]: res.data[dataKey] }));
      } catch (err) {
        console.error(`Failed loading ${key}:`, err);
      }
    });
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const query = recipeSearch.trim();
  
      if (query) {
        setPage(1);
        setHasMore(true);
        fetchSearchRecipes(query, 1, true);  // reset = true
      } else {
        setPage(1);
        setHasMore(true);
        fetchRecipes(true);
      }
    }, 400);
  
    return () => clearTimeout(delayDebounce);
  }, [recipeSearch, filters]);
  
  
  
  const fetchSearchRecipes = async (query, pageNum = 1, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, page: pageNum });
  
      Object.entries(filters).forEach(([key, values]) => {
        values.forEach(val => params.append(key, val));
      });
  
      const res = await axios.get(
        `https://accmovies.pythonanywhere.com/recipes/search?query=${encodeURIComponent(query)}&${params.toString()}`
      );
  
      const results = res.data.results || [];
  
      if (reset) {
        setRecipes(results);
      } else {
        setRecipes(prev => [...prev, ...results]);
      }
  
      setHasMore(results.length === 20);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error("Smart search failed", err);
    }
    setLoading(false);
  };
  
  
  



  // Fetch recipes
  const fetchRecipes = async (reset = false) => {
    setLoading(true);
  
    // 👇 FIX START
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    // 👆 FIX END
  
    try {
      const params = new URLSearchParams({ limit: 20, page: reset ? 1 : page });
      Object.entries(filters).forEach(([key, values]) => {
        values.forEach(val => params.append(key, val));
      });
  
      const res = await axios.get(`https://accmovies.pythonanywhere.com/recipes/recipes?${params.toString()}`);
      const fetched = res.data.recipes || [];
  
      if (reset) {
        setRecipes(fetched);
        setPage(2); // Next page
      } else {
        setRecipes(prev => [...prev, ...fetched]);
        setPage(prev => prev + 1);
      }
  
      setHasMore(fetched.length === 20); // Only show "Load More" if we got full page
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
    }
  
    setLoading(false);
  };
  

  // Update filters in URL
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, values]) => {
      values.forEach(v => params.append(key, v));
    });
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  useEffect(() => {
    fetchRecipes(true);
    updateURL(filters);
  }, [filters]);

  // Filter selection logic
  const toggleFilter = (type) => {
    setOpenFilter(prev => (prev === type ? null : type));
    setSearchInputs(prev => ({ ...prev, [type]: '' }));
  };

  const handleFilterSelect = (type, value) => {
    setFilters(prev => {
      const updated = prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: [] }));
    setOpenFilter(null);
  };

  const handleSearchInputChange = (type, value) => {
    setSearchInputs(prev => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderFilter = (type) => {
    const search = searchInputs[type]?.toLowerCase() || '';
    const filtered = options[type].filter((o) => o.toLowerCase().includes(search));
    const selected = filters[type];

    return (
      <div key={type} className="relative">
        <button
          onClick={() => toggleFilter(type)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-5 rounded-full shadow capitalize"
        >
          {selected.length > 0 ? `${type}: ${selected.join(', ')}` : `Select ${type}`}
        </button>

        {openFilter === type && (
          <div
            ref={popupRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto z-50"
          >
            <h2 className="text-lg font-semibold mb-3 capitalize text-yellow-600">{type} Options</h2>
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchInputs[type]}
              onChange={(e) => handleSearchInputChange(type, e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFilterSelect(type, item)}
                    className={`px-4 py-2 rounded-full text-sm transition ${
                      selected.includes(item)
                        ? 'bg-yellow-400 text-black font-semibold'
                        : 'bg-gray-100 hover:bg-yellow-100 text-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-400">No options found.</p>
              )}
            </div>
            <div className="text-right">
              <button onClick={() => clearFilter(type)} className="text-red-500 hover:underline text-sm mr-4">
                Clear
              </button>
              <button onClick={() => setOpenFilter(null)} className="bg-black text-white px-4 py-2 rounded-full text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredRecipes = recipes;


  return (
    <div className="min-h-screen bg-white text-gray-800 font-serif flex flex-col items-center pb-24">
      {/* header */}
      <header className="w-full shadow-sm bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400 cursor-pointer" onClick={() => navigate('/')}>🍽️ FindMyRecipe</h1>
          <nav className="space-x-6 text-md font-medium text-white">
            <button onClick={() => navigate('/home')} className="hover:text-yellow-400">Home</button>
            <button onClick={() => navigate('/about')} className="hover:text-yellow-400">About</button>
            <button onClick={() => navigate('/contact')} className="hover:text-yellow-400">Contact</button>
          </nav>
        </div>
      </header>

      {/* filters */}
      <div className="flex flex-wrap gap-4 mt-8 px-6 justify-center">
        {['cuisine', 'course', 'diet'].map(renderFilter)}
      </div>

      {/* search input */}
      <div className="mt-6 w-full max-w-md px-4">
        <input
          type="text"
          placeholder="🔍 Search recipe titles..."
          value={recipeSearch}
          onChange={(e) => setRecipeSearch(e.target.value)}
          className="w-full py-3 px-5 border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* recipe list */}
      {loading && <p className="text-lg mt-10 text-gray-500">Loading...</p>}

      {!loading && filteredRecipes.length > 0 && (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 px-4">
          {filteredRecipes.map((recipe, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/recipe/${encodeURIComponent(recipe.name)}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer"
            >
              <img src={recipe.image_url} alt={recipe.name} className="w-full h-48 object-cover rounded-md mb-3" />
              <h2 className="text-lg font-semibold text-yellow-700 mb-1">{recipe.name}</h2>
              <p className="text-gray-600 text-sm mb-1"><strong>Cuisine:</strong> {recipe.cuisine}</p>
              <p className="text-gray-600 text-sm mb-1"><strong>Course:</strong> {recipe.course}</p>
              <p className="text-gray-600 text-sm mb-1"><strong>Diet:</strong> {recipe.diet}</p>
              <p className="text-gray-600 text-sm mb-1"><strong>Prep Time:</strong> {recipe.prep_time}</p>
            </div>
          ))}
        </div>
      )}

      {/* load more */}
      {!loading && hasMore &&  (
  <button
  onClick={() => {
    if (recipeSearch.trim()) {
      fetchSearchRecipes(recipeSearch.trim(), page, false);
    } else {
      fetchRecipes(false);
    }
  }}
  
    className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-full shadow"
  >
    ⬇️ Load More
  </button>
)}


      {/* no results */}
      {!loading && !filteredRecipes.length && <p className="text-lg mt-10 text-gray-400">No recipes found.</p>}

      <footer className="fixed bottom-0 w-full bg-black/30 backdrop-blur-sm text-white text-sm text-center py-4">
        &copy; {new Date().getFullYear()} FindMyRecipe. All rights reserved.
      </footer>
    </div>
  );
};

export default RecipeFind;
