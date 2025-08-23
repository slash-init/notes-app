import Note from './components/Note'
import { useState, useEffect } from 'react'
import noteService from './services/notes'
import Footer from './components/Footer'
import { Routes, Route, Link } from 'react-router-dom'
import About from './components/About'
import Social from './components/Social'
import NotFound from './components/NotFound'

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

const App = (props) => {
  const [notes, setNotes] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))
      })
      .catch(error => {
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const deleteNote = (id) => {
    const note = notes.find(n => n.id === id)
    
    if (window.confirm(`Delete "${note.content}"?`)) {
      noteService
        .remove(id)
        .then(() => {
          setNotes(notes.filter(n => n.id !== id))
        })
        .catch(error => {
          setErrorMessage(
            `Note '${note.content}' was already removed from server`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setNotes(notes.filter(n => n.id !== id))
        })
    }
  }

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const addNote = (event) => {
    event.preventDefault()
    if (!newNote.trim()) return
    
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5
    }
    
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
      .catch(error => {
        setErrorMessage('Failed to create note')
        setTimeout(() => setErrorMessage(null), 5000)
      })
  }
  
  if (!notes) {
    return (
      <div className="app-container">
        <div className="loading"></div>
      </div>
    )
  }

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important === true)

  return (
    <div className="app-container">
      {/* Add navigation */}
      <nav className="nav-bar">
        <h1>Notes</h1>
        <div className="nav-links">
          <Link to="/" className="nav-link">Notes</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={
          <div>
            <Notification message={errorMessage} />
            
            <div className="controls">
              <button className="toggle-btn" onClick={() => setShowAll(!showAll)}>
                show {showAll ? 'important' : 'all'}
              </button>
            </div>
            
            {notesToShow.length === 0 ? (
              <div className="empty-state">
                <p>No notes to display</p>
              </div>
            ) : (
              <ul className="notes-list">
                {notesToShow.map(note =>
                  <Note 
                    key={note.id} 
                    note={note} 
                    toggleImportance={() => toggleImportanceOf(note.id)}
                    deleteNote={() => deleteNote(note.id)} 
                  />
                )}
              </ul>
            )}
            
            <div className="note-form">
              <form onSubmit={addNote}>
                <div className="form-row">
                  <input 
                    className="note-input"
                    value={newNote}
                    onChange={handleNoteChange}
                    placeholder="Add a new note..."
                  />
                  <button className="submit-btn" type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        } />
        
        <Route path="/about" element={<About />} />
        <Route path="/social" element={<Social />} />
        
        {/* ADD 404 ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Footer />
    </div>
  )
}

export default App