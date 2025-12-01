const React = require('react');
const { useState, useEffect } = React;

// Component for managing premium collections
const CollectionManager = (props) => {
  const { anime, isPremium, onCollectionsUpdate } = props;
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');
  const [selectedAnimeIds, setSelectedAnimeIds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPremium) {
      loadCollections();
    }
  }, [isPremium]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/getCollections');
      const result = await response.json();
      setCollections(result.collections || []);
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setError('');

    if (!collectionName.trim()) {
      setError('Collection name is required!');
      return;
    }

    try {
      const response = await fetch('/createCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: collectionName.trim(),
          description: collectionDesc.trim(),
          animeIds: selectedAnimeIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create collection');
        return;
      }

      setCollections([...collections, result.collection]);
      setCollectionName('');
      setCollectionDesc('');
      setSelectedAnimeIds([]);
      setShowForm(false);

      if (onCollectionsUpdate) {
        onCollectionsUpdate(collections.length + 1);
      }
    } catch (err) {
      console.error(err);
      setError('Error creating collection!');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Delete this collection?')) {
      return;
    }

    try {
      const response = await fetch('/deleteCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: collectionId }),
      });

      if (!response.ok) {
        setError('Failed to delete collection');
        return;
      }

      setCollections(collections.filter((c) => c._id !== collectionId));
    } catch (err) {
      console.error(err);
      setError('Error deleting collection!');
    }
  };

  if (!isPremium) {
    return (
      <div className="collection-locked">
        <p>⭐ Premium feature - Purchase credits to unlock custom collections!</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading collections...</div>;
  }

  const toggleAnimeSelection = (animeId) => {
    if (selectedAnimeIds.includes(animeId)) {
      setSelectedAnimeIds(selectedAnimeIds.filter((id) => id !== animeId));
    } else {
      setSelectedAnimeIds([...selectedAnimeIds, animeId]);
    }
  };

  return (
    <div className="collection-manager">
      <div className="collection-header">
        <h2>My Collections</h2>
        <button
          type="button"
          className="btn-new-collection"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Collection'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateCollection} className="collection-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="collName">Collection Name *</label>
            <input
              id="collName"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., My Favorite Action Shows"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="collDesc">Description</label>
            <textarea
              id="collDesc"
              value={collectionDesc}
              onChange={(e) => setCollectionDesc(e.target.value)}
              placeholder="Optional description..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Select Anime to Add:</label>
            <div className="anime-selection">
              {anime && anime.length > 0 ? (
                anime.map((animeItem) => (
                  <label key={animeItem._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedAnimeIds.includes(animeItem._id)}
                      onChange={() => toggleAnimeSelection(animeItem._id)}
                    />
                    {animeItem.title}
                  </label>
                ))
              ) : (
                <p>No anime to add. Add some first!</p>
              )}
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Create Collection
          </button>
        </form>
      )}

      <div className="collections-list">
        {collections.length === 0 ? (
          <p className="empty-state">No collections yet. Create your first one!</p>
        ) : (
          collections.map((collection) => (
            <div key={collection._id} className="collection-item">
              <div className="collection-info">
                <h3>{collection.name}</h3>
                {collection.description && <p>{collection.description}</p>}
                <p className="anime-count">
                  {collection.animeIds.length}
                  {' '}
                  anime
                </p>
              </div>
              <button
                type="button"
                className="btn-delete-collection"
                onClick={() => handleDeleteCollection(collection._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

module.exports = CollectionManager;
