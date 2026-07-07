import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [animeList, setAnimeList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // NEW: State to track our pagination offset
  const [offset, setOffset] = useState(0);

  // NEW: We moved the fetch logic outside of useEffect so we can call it on demand
  const fetchAnimeData = async (currentOffset) => {
    try {
      const response = await fetch(`https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]=${currentOffset}`);
      const json = await response.json();
      
      setAnimeList((prevList) => {
        // 1. Create a Set of existing IDs for quick lookups
        const existingIds = new Set(prevList.map(anime => anime.id));
        
        // 2. Filter the incoming data to only include unique items
        const newAnimes = json.data.filter(anime => !existingIds.has(anime.id));
        
        // 3. Combine the previous list with the filtered unique items
        return [...prevList, ...newAnimes];
      });
    } catch (error) {
      console.error("Error fetching anime data:", error);
    }
  };

  // 1. Initial Load
  useEffect(() => {
    fetchAnimeData(0); // Fetch the first 20 items when the page loads
  }, []);

  // NEW: Function to handle the Load More button click
  const handleLoadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset); // Update state to remember where we are
    fetchAnimeData(newOffset); // Fetch the next batch using the new offset
  };

  // 2. Filtering Data
  const filteredAnimes = animeList.filter((anime) => {
    const title = anime.attributes.canonicalTitle?.toLowerCase() || "";
    const status = anime.attributes.status;
    
    const matchesSearch = title.includes(searchInput.toLowerCase());
    const matchesStatus = statusFilter === "" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 3. Calculating Summary Statistics
  const totalAnime = filteredAnimes.length;
  
  const averageRating = filteredAnimes.reduce((acc, anime) => {
    const rating = parseFloat(anime.attributes.averageRating) || 0;
    return acc + rating;
  }, 0) / (totalAnime || 1); 

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
          <h3>Total Shows Displayed</h3>
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

      {/* Rendering the List */}
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

      {/* NEW: Load More Button */}
      {/* We only show this button if there is NO search query, because searching Kitsu's entire database requires a different API setup */}
      {searchInput === "" && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More Anime
          </button>
        </div>
      )}
    </div>
  );
}

export default App;