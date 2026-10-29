import { useState } from 'react'

function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  // Second useState toggling visibility — help tooltip (P2 assignment)
  const [showHelp, setShowHelp] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
      setTimeout(() => setSubmitted(false), 3000)
    }, 1000)
  }

  const contactInfo = [
    { icon: '✉️', label: 'rushabh.student@example.com' },
    { icon: '👤', label: 'Rushabh' },
  ]

  const socialLinks = [
    { icon: '📷', platform: 'Instagram', handle: '@rushabh_dev', url: '#' },
    { icon: '💼', platform: 'LinkedIn', handle: '@rushabh-dev', url: '#' },
    { icon: '🐙', platform: 'GitHub', handle: '@Rushabh-0307', url: 'https://github.com/Rushabh-0307' },
  ]

  return (
    <section className="contact-section" id="contact">
      <div className="container">
        <h2 className="section-heading">Contact Me</h2>

        <div className="contact-layout">
          <div className="contact-info-side">
            <div className="contact-info-block">
              <h3 className="contact-subtitle">Contact Info</h3>
              {contactInfo.map((item) => (
                <div key={item.label} className="contact-item">
                  <span className="contact-item-icon">{item.icon}</span>
                  <span className="contact-item-text">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="social-block">
              <h3 className="contact-subtitle">Social Handles</h3>
              {socialLinks.map((link) => (
                <a key={link.platform} href={link.url} className="social-link" target="_blank" rel="noreferrer">
                  <span className="social-icon">{link.icon}</span>
                  <span className="social-handle">{link.handle}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="contact-form-side">
            {/* Help tooltip toggle button (P2 assignment — second useState) */}
            <button
              type="button"
              className="btn btn-outline help-toggle-btn"
              onClick={() => setShowHelp((prev) => !prev)}
            >
              {showHelp ? 'Hide Help' : '❓ Help'}
            </button>
            {showHelp && (
              <div className="help-tooltip">
                <p>Fill in all three fields below. Your name helps us address you properly,
                   and a valid email lets us respond. Describe your query in the message box.</p>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="contact-input"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="contact-input"
                required
              />
              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                className="contact-input contact-textarea"
                rows={6}
                required
              />
              {/* Live character count under the message input (P2 assignment) */}
              <p className="char-count">{formData.message.length} characters</p>
              <button type="submit" className="send-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : submitted ? '✓ Sent!' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
