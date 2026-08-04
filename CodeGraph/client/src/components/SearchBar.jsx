import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const [allApis, setAllApis] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const response = await api.get('/apis');
        setAllApis(response.data.apis || []);
      } catch (err) {
        console.error('Error preloading API list:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAll();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults(allApis);
      return;
    }

    const keyword = query.toLowerCase();
    const filtered = allApis.filter(apiItem => 
      apiItem.name.toLowerCase().includes(keyword) || 
      apiItem.description.toLowerCase().includes(keyword)
    );
    setFilteredResults(filtered);
  }, [query, allApis]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (name) => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) onSelect(name);
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search className="search-input-icon" size={20} />
        <input
          type="text"
          className="search-bar"
          placeholder="Click here to show all APIs, or type to search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {loading && (
          <div style={{ position: 'absolute', right: '1.25rem', color: 'var(--color-indigo)' }}>
            <Loader2 className="animate-spin" size={20} style={{ animation: 'loading 1s linear infinite' }} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          <div style={{ padding: '0.4rem 0.8rem 0.2rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
            {query.trim() === '' ? 'Available APIs' : 'Search Results'}
          </div>

          {filteredResults.length > 0 ? (
            filteredResults.map((apiItem) => (
              <div
                key={apiItem.name}
                className="search-result-item"
                onClick={() => handleItemClick(apiItem.name)}
              >
                <div className="search-result-info">
                  <span className="search-result-name">{apiItem.name}</span>
                  <span className="search-result-desc">{apiItem.description}</span>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))
          ) : (
            <div className="search-no-results">
              No APIs found matching "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
