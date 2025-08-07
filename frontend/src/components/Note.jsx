const Note = ({ note, toggleImportance, deleteNote }) => {
  const label = note.important 
    ? 'make not important' 
    : 'make important'

  return (
    <li className="note-item">
      <div className="note-content">
        <span className="note-text">{note.content}</span>
        <div className="note-actions">
          <button 
            className={`importance-btn ${note.important ? 'important' : ''}`}
            onClick={toggleImportance}
          >
            {label}
          </button>
          <button 
            className="delete-btn"
            onClick={deleteNote}
            title="Delete note"
          >
            <svg className="delete-icon" viewBox="0 0 24 24">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}

export default Note