function Header({ title, name, themeColor }) {
  return (
    <header className="header">
      <h1 style={{ color: themeColor }}>{title}</h1>
      <p className="subtitle">Welcome, I am {name}.</p>
    </header>
  )
}

export default Header
