// Reusable Spinner component with configurable text prop (P3, P6)
function Spinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner">
        <div className="spinner-ring"></div>
      </div>
      <p className="spinner-text">{text}</p>
    </div>
  )
}

export default Spinner
