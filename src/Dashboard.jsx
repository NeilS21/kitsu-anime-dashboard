import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [animeList, setAnimeList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);

  const fetchAnimeData = async (currentOffset) => {
    try {
      const response = await fetch(`https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]=${currentOffset}`);
      const json = await response.json();
      
      setAnimeList((prevList) => {
        const existingIds = new Set(prevList.map(anime => anime.id));
        const newAnimes = json.data.filter(anime => !existingIds.has(anime.id));
        return [...prevList, ...newAnimes];
      });
    } catch (error) {
      console.error("Error fetching anime data:", error);
    }
  };

  useEffect(() => {
    fetchAnimeData(0);
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    fetchAnimeData(newOffset);
  };

  const filteredAnimes = animeList.filter((anime) => {
    const title = anime.attributes.canonicalTitle?.toLowerCase() || "";
    const status = anime.attributes.status;
    const matchesSearch = title.includes(searchInput.toLowerCase());
    const matchesStatus = statusFilter === "" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAnime = filteredAnimes.length;
  const averageRating = filteredAnimes.reduce((acc, anime) => acc + (parseFloat(anime.attributes.averageRating) || 0), 0) / (totalAnime || 1); 
  const totalEpisodes = filteredAnimes.reduce((acc, anime) => acc + (anime.attributes.episodeCount || 0), 0);

  // --- Chart 1 Data: Status Distribution (Pie Chart) ---
  const statusCounts = filteredAnimes.reduce((acc, anime) => {
    const status = anime.attributes.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // --- Chart 2 Data: Top 10 Ratings (Bar Chart) ---
  const barData = filteredAnimes.slice(0, 10).map(anime => ({
    name: anime.attributes.canonicalTitle.substring(0, 10) + '...',
    rating: parseFloat(anime.attributes.averageRating) || 0
  }));

  return (
    <div>
      <div className="dashboard-header">
        <h1>Anime Discovery Dashboard</h1>
      </div>

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

      {/* Two Unique Charts */}
      <div className="charts-container">
        <div className="chart-box">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-box">
          <h3>Top 10 Displayed Ratings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rating" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="current">Currently Airing</option>
          <option value="finished">Finished</option>
          <option value="tba">TBA</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      <div className="anime-grid">
        {filteredAnimes.length > 0 ? (
          filteredAnimes.map((anime) => (
            /* Direct link to detail view */
            <Link to={`/anime/${anime.id}`} key={anime.id} className="anime-card-link">
              <div className="anime-card">
                <img src={anime.attributes.posterImage?.small} alt={`${anime.attributes.canonicalTitle} poster`} />
                <h3>{anime.attributes.canonicalTitle}</h3>
                <p><strong>Rating:</strong> {anime.attributes.averageRating || "N/A"}</p>
                <p><strong>Episodes:</strong> {anime.attributes.episodeCount || "N/A"}</p>
                <p><strong>Status:</strong> {anime.attributes.status}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No anime found matching your criteria!</p>
        )}
      </div>

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

export default Dashboard;