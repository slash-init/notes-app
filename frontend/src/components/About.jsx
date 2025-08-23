const About = () => {
  return (
    <div className="about-page">
      <h2>About Notes App</h2>
      <div className="about-content">
        <p>
          This is a simple notes app that lets you create, view, edit, and delete notes. 
          It's built with a basic CRUD (Create, Read, Update, Delete) implementation so you 
          can quickly manage your ideas, reminders, and tasks without any extra complexity. 
          The goal was to make something fast, easy to use, and distraction free.
        </p>
        
        <p>
          The app is built using React and JavaScript on the frontend, with Node.js and 
          Express handling the backend. Notes are stored in a MongoDB database, and the 
          app communicates through RESTful APIs to keep everything running smoothly.
        </p>
        
        <p>
          It's not overloaded with features—just a clean, minimal tool to help you keep 
          track of what matters.
        </p>

        <div className="tech-stack">
          <h3>Tech Stack</h3>
          <ul>
            <li><strong>Frontend:</strong> React, JavaScript, CSS</li>
            <li><strong>Backend:</strong> Node.js, Express</li>
            <li><strong>Database:</strong> MongoDB</li>
            <li><strong>HTTP Client:</strong> Axios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default About