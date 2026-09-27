import { useState } from 'react'

function Contact() {
  const [message, setMessage] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  return (
    <section className="portfolio-section contact-section">
      <h2>Contact</h2>
      <p className="contact-intro">Share your message to connect with me.</p>

      <label htmlFor="message-input" className="input-label">
        Message
      </label>
      <textarea
        id="message-input"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type your message here..."
        className="contact-input"
        rows={5}
      />

      <p className="live-preview">Live message: {message || 'No message yet.'}</p>
      <p className="character-count">Character count: {message.length}</p>

      <button
        type="button"
        className="help-toggle"
        onClick={() => setShowHelp((prevState) => !prevState)}
      >
        {showHelp ? 'Hide Help' : 'Show Help'}
      </button>

      {showHelp ? (
        <p className="help-text">Write a short introduction, your purpose, and contact details.</p>
      ) : null}
    </section>
  )
}

export default Contact
