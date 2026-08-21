import { useState } from 'react';

function getYouTubeId(url) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/);
  return match ? match[1] : '';
}

export default function FeaturedVideo({ title, description, youtubeUrl, thumbnail }) {
  const [loaded, setLoaded] = useState(false);
  const videoId = getYouTubeId(youtubeUrl || '');
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  if (!embedUrl) return null;

  return (
    <div className="featured-video">
      <div className="featured-video-header">
        <h3>{title || 'Featured Video'}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="featured-video-wrapper">
        {!loaded && thumbnail && (
          <div className="featured-video-preview" onClick={() => setLoaded(true)}>
            <img src={thumbnail} alt={title} loading="lazy" />
            <button className="featured-video-play" aria-label="Play video">▶</button>
          </div>
        )}
        {!loaded && !thumbnail && (
          <div className="featured-video-preview" onClick={() => setLoaded(true)}>
            <div className="featured-video-placeholder">
              <span>▶</span>
            </div>
          </div>
        )}
        {loaded && (
          <iframe
            src={embedUrl}
            title={title || 'Featured Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
      <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="featured-video-link">
        Watch on YouTube
      </a>
    </div>
  );
}
