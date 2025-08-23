import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa'

const Social = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/slash-init', 
      icon: <FaGithub />,
      description: 'Check out my code and projects',
      color: '#333'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/gauravxverma', 
      icon: <FaLinkedin />,
      description: 'Connect with me professionally',
      color: '#0077b5'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/slash.init', 
      icon: <FaInstagram />,
      description: 'Follow my daily updates',
      color: '#e4405f'
    }
  ]

  return (
    <div className="social-page">
      <h2>Connect With Me</h2>
      <p className="social-intro">
        Thanks for checking out my notes app! Feel free to connect with me on these platforms:
      </p>
      
      <div className="social-links-grid">
        {socialLinks.map((link, index) => (
          <a 
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link-card"
            style={{'--social-color': link.color}}
          >
            <div className="social-icon">
              {link.icon}
            </div>
            <div className="social-content">
              <h3>{link.name}</h3>
              <p>{link.description}</p>
            </div>
            <div className="external-icon">↗</div>
          </a>
        ))}
      </div>
      
      <div className="contact-note">
        <p>
          <strong>Want to collaborate?</strong> Drop me a message on any of these platforms. 
          I'm always interested in discussing new projects and opportunities!
        </p>
      </div>
    </div>
  )
}

export default Social