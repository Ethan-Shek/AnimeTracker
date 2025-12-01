const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const AnimeForm = require('./AnimeForm.jsx');
const AnimeList = require('./AnimeList.jsx');
const ProfilePage = require('./ProfilePage.jsx');
const CollectionManager = require('./CollectionManager.jsx');

// Main app component
const App = () => {
  const [currentView, setCurrentView] = useState('tracker'); // tracker, profile, collections
  const [userProfile, setUserProfile] = useState(null);
  const [refreshList, setRefreshList] = useState(false);
  const [anime, setAnime] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/profile');
        const result = await response.json();
        setUserProfile(result);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadProfile();
  }, []);

  // Load anime when view changes
  useEffect(() => {
    if (currentView === 'tracker') {
      loadAnime();
    }
  }, [currentView]);

  const loadAnime = async () => {
    try {
      const response = await fetch('/getAnime');
      const result = await response.json();
      setAnime(result.anime || []);
    } catch (err) {
      console.error('Error loading anime:', err);
    }
  };

  const handleAnimeAdded = (newAnime) => {
    setAnime([...anime, newAnime]);
    setRefreshList(!refreshList);
  };

  const handleAnimeDeleted = async (animeId) => {
    try {
      const response = await fetch('/deleteAnime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _id: animeId }),
      });

      if (response.ok) {
        setAnime(anime.filter((a) => a._id !== animeId));
        setRefreshList(!refreshList);
      }
    } catch (err) {
      console.error('Error deleting anime:', err);
    }
  };

  const handleAnimeUpdated = async (updatedAnime) => {
    try {
      const response = await fetch('/updateAnime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAnime),
      });

      if (response.ok) {
        setAnime(
          anime.map((a) => (a._id === updatedAnime._id ? updatedAnime : a)),
        );
        setRefreshList(!refreshList);
      }
    } catch (err) {
      console.error('Error updating anime:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/logout');
      window.location.href = '/';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1>🎌 AnimeTracker</h1>
        </div>
        <nav className="header-nav">
          <button
            type="button"
            className={`nav-btn ${currentView === 'tracker' ? 'active' : ''}`}
            onClick={() => setCurrentView('tracker')}
          >
            My Anime
          </button>
          <button
            type="button"
            className={`nav-btn ${currentView === 'collections' ? 'active' : ''}`}
            onClick={() => setCurrentView('collections')}
          >
            Collections
            {userProfile?.isPremium && <span className="premium-dot">⭐</span>}
          </button>
          <button
            type="button"
            className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            Profile
          </button>
          <button type="button" className="nav-btn logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'tracker' && (
          <div className="tracker-view">
            <div className="form-section">
              <AnimeForm onAnimeAdded={handleAnimeAdded} />
            </div>
            <div className="list-section">
              <AnimeList
                refresh={refreshList}
                onSelectAnime={setSelectedAnime}
                onDelete={handleAnimeDeleted}
                onUpdate={handleAnimeUpdated}
              />
            </div>
          </div>
        )}

        {currentView === 'collections' && (
          <div className="collections-view">
            <CollectionManager
              anime={anime}
              isPremium={userProfile?.isPremium || false}
              onCollectionsUpdate={() => setRefreshList(!refreshList)}
            />
          </div>
        )}

        {currentView === 'profile' && (
          <div className="profile-view">
            <ProfilePage
              userProfile={userProfile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}
      </main>

      <div id="animeMessage" className="hidden">
        <div id="errorMessage" className="error-display" />
      </div>
    </div>
  );
};

// Render the app
const init = () => {
  const root = createRoot(document.getElementById('app'));
  root.render(<App />);
};

window.onload = init;


