import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">📝</div>
        <h1>Page Not Found - 404</h1>
        <p>
          The URL you're looking for doesn't exist.
        </p>
        
        <div className="not-found-suggestions">
          <h3>What you can do:</h3>
          <ul>
            <li>Check the URL for typos</li>
            <li>Go back to your notes</li>
            <li>Create a new note instead</li>
          </ul>
        </div>
        
        <div className="not-found-actions">
          <Link to="/" className="primary-btn">
            📋 Back to Notes
          </Link>
          <Link to="/about" className="secondary-btn">
            ℹ️ About App
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound