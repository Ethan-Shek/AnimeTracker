const React = require('react');

// Component to display a single anime card
const AnimeCard = (props) => {
  const {
    anime, onDelete, onUpdate, onSelect,
  } = props;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this anime?')) {
      onDelete(anime._id);
    }
  };

  const handleStatusChange = (e) => {
    const updatedAnime = { ...anime, status: e.target.value };
    onUpdate(updatedAnime);
  };

  return (
    <div className="anime-card">
      <div className="card-header">
        <h3 className="anime-title">{anime.title}</h3>
        <button
          className="btn-delete"
          onClick={handleDelete}
          type="button"
          aria-label="Delete anime"
        >
          ✕
        </button>
      </div>

      <div className="card-body">
        {anime.genres && anime.genres.length > 0 && (
          <div className="genres">
            {anime.genres.map((genre) => (
              <span key={genre} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>
        )}

        <div className="rating">
          <span className="rating-label">Rating:</span>
          <span className="rating-value">{anime.rating}/10</span>
        </div>

        <div className="status-selector">
          <label htmlFor="status">Status:</label>
          <select
            id={`status-${anime._id}`}
            value={anime.status}
            onChange={handleStatusChange}
            className="status-select"
          >
            <option value="plan">Plan to Watch</option>
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        {anime.notes && (
          <div className="notes">
            <strong>Notes:</strong>
            <p>{anime.notes}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn-view"
        onClick={() => onSelect(anime)}
      >
        View Details
      </button>
    </div>
  );
};

module.exports = AnimeCard;
