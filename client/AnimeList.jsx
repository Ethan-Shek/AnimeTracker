const React = require('react');
const { useState, useEffect } = React;
const AnimeCard = require('./AnimeCard.jsx');

// Component to display and manage the list of anime
const AnimeList = (props) => {
  const {
    refresh, onSelectAnime, onDelete, onUpdate,
  } = props;

  const [anime, setAnime] = useState([]);
  const [filteredAnime, setFilteredAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');

  // Fetch anime from server
  useEffect(() => {
    const loadAnime = async () => {
      try {
        setLoading(true);
        const response = await fetch('/getAnime');
        const result = await response.json();
        setAnime(result.anime || []);
      } catch (err) {
        console.error('Error loading anime:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnime();
  }, [refresh]);

  // Filter and sort anime
  useEffect(() => {
    let filtered = anime;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query)
          || (a.genres && a.genres.some((g) => g.toLowerCase().includes(query))),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'dateAdded':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'title':
        default:
          return a.title.localeCompare(b.title);
      }
    });

    setFilteredAnime(sorted);
  }, [anime, statusFilter, searchQuery, sortBy]);

  if (loading) {
    return <div className="loading">Loading anime...</div>;
  }

  return (
    <div className="anime-list-container">
      <div className="controls">
        <input
          type="text"
          placeholder="Search anime or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="watching">Watching</option>
          <option value="plan">Plan to Watch</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="title">Sort by Title</option>
          <option value="rating">Sort by Rating</option>
          <option value="dateAdded">Sort by Date Added</option>
        </select>
      </div>

      {filteredAnime.length === 0 ? (
        <div className="empty-state">
          <p>
            {anime.length === 0
              ? 'No anime yet. Add your first one!'
              : 'No anime matching your filters.'}
          </p>
        </div>
      ) : (
        <div className="anime-grid">
          {filteredAnime.map((animeItem) => (
            <AnimeCard
              key={animeItem._id}
              anime={animeItem}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onSelect={onSelectAnime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

module.exports = AnimeList;
