const React = require('react');
const { useState } = React;

// Component for adding/editing anime
const AnimeForm = (props) => {
  const { onAnimeAdded } = props;
  const [title, setTitle] = useState('');
  const [genres, setGenres] = useState('');
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('plan');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Anime title is required!');
      return;
    }

    const genreArray = genres
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    try {
      const response = await fetch('/addAnime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          genres: genreArray,
          rating: parseInt(rating, 10),
          status,
          notes: notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to add anime');
        return;
      }

      // Reset form
      setTitle('');
      setGenres('');
      setRating(0);
      setStatus('plan');
      setNotes('');

      // Call callback to refresh list
      if (onAnimeAdded) {
        onAnimeAdded(result.anime);
      }
    } catch (err) {
      console.error(err);
      setError('Error adding anime!');
    }
  };

  return (
    <div className="anime-form-container">
      <h2>Add New Anime</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="anime-form">
        <div className="form-group">
          <label htmlFor="title">Anime Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Attack on Titan"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="genres">Genres (comma-separated)</label>
          <input
            id="genres"
            type="text"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            placeholder="e.g., Action, Fantasy, Drama"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rating">Rating (1-10)</label>
            <input
              id="rating"
              type="number"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="plan">Plan to Watch</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add personal notes about this anime..."
            rows="3"
          />
        </div>

        <button type="submit" className="btn-submit">
          Add Anime
        </button>
      </form>
    </div>
  );
};

module.exports = AnimeForm;
