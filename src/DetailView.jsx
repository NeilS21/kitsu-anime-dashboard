import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function DetailView() {
  const { id } = useParams();
  const [animeData, setAnimeData] = useState(null);

  useEffect(() => {
    // Fetch unique data for the specific item
    fetch(`https://kitsu.io/api/edge/anime/${id}`)
      .then(response => response.json())
      .then(json => setAnimeData(json.data))
      .catch(error => console.error("Error fetching details:", error));
  }, [id]);

  if (!animeData) {
    return <div>Loading details...</div>;
  }

  const { attributes } = animeData;

  return (
    <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: '#3498db' }}>
        ← Back to Dashboard
      </Link>
      
      <h1>{attributes.canonicalTitle}</h1>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
        <img 
          src={attributes.posterImage?.medium} 
          alt={attributes.canonicalTitle} 
          style={{ borderRadius: '8px', maxWidth: '300px' }}
        />
        
        <div>
          <h3>Synopsis</h3>
          <p style={{ lineHeight: '1.6' }}>{attributes.synopsis}</p>
          
          <div style={{ marginTop: '2rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
            <h3>Extra Details</h3>
            <p><strong>Popularity Rank:</strong> #{attributes.popularityRank}</p>
            <p><strong>Age Rating:</strong> {attributes.ageRatingGuide || "N/A"}</p>
            <p><strong>Show Type:</strong> {attributes.showType}</p>
            <p><strong>Start Date:</strong> {attributes.startDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailView;