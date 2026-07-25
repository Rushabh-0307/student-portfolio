function Footer({ email }) {
  return (
    <footer className="footer">
      <p>Contact: {email}</p>
      <p>&copy; {new Date().getFullYear()} Student Portfolio</p>
    </footer>
  )
}

export default Footer
