import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State to hold the raw data fetched from Kitsu
  const [animeList, setAnimeList] = useState([]);
  
  // State for user inputs
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 1. Fetching Data with useEffect
  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        // Fetching 20 items to ensure we have at least 10 unique items to display
        const response = await fetch('https://kitsu.io/api/edge/anime?page[limit]=20');
        const json = await response.json();
        setAnimeList(json.data);
      } catch (error) {
        console.error("Error fetching anime data:", error);
      }
    };

    fetchAnimeData();
  }, []); // Empty dependency array means this runs ONCE when the component mounts

  // 2. Filtering Data (.filter())
  // We chain filters: first by search string, then by dropdown category
  const filteredAnimes = animeList.filter((anime) => {
    const title = anime.attributes.canonicalTitle.toLowerCase();
    const status = anime.attributes.status;
    
    // Check if title matches search
    const matchesSearch = title.includes(searchInput.toLowerCase());
    // Check if status matches dropdown (or if dropdown is empty/All)
    const matchesStatus = statusFilter === "" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 3. Calculating Summary Statistics
  const totalAnime = filteredAnimes.length;
  
  // Calculate average rating of currently displayed anime
  const averageRating = filteredAnimes.reduce((acc, anime) => {
    const rating = parseFloat(anime.attributes.averageRating) || 0;
    return acc + rating;
  }, 0) / (totalAnime || 1); 

  // Calculate total episodes of currently displayed anime
  const totalEpisodes = filteredAnimes.reduce((acc, anime) => {
    return acc + (anime.attributes.episodeCount || 0);
  }, 0);

  return (
    <div>
      <div className="dashboard-header">
        <h1>🌸 Kitsu Anime Discovery 🌸</h1>
      </div>

      {/* Summary Statistics Section */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Shows</h3>
          <p>{totalAnime}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Rating</h3>
          <p>{averageRating.toFixed(2)} / 100</p>
        </div>
        <div className="stat-card">
          <h3>Total Episodes</h3>
          <p>{totalEpisodes}</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="current">Currently Airing</option>
          <option value="finished">Finished</option>
          <option value="tba">TBA</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      {/* Rendering the List (.map()) */}
      <div className="anime-grid">
        {filteredAnimes.length > 0 ? (
          filteredAnimes.map((anime) => (
            <div className="anime-card" key={anime.id}>
              <img 
                src={anime.attributes.posterImage?.small} 
                alt={`${anime.attributes.canonicalTitle} poster`} 
              />
              <h3>{anime.attributes.canonicalTitle}</h3>
              <p><strong>Rating:</strong> {anime.attributes.averageRating || "N/A"}</p>
              <p><strong>Episodes:</strong> {anime.attributes.episodeCount || "N/A"}</p>
              <p><strong>Status:</strong> {anime.attributes.status}</p>
            </div>
          ))
        ) : (
          <p>No anime found matching your criteria!</p>
        )}
      </div>
    </div>
  );
}

export default App;