function ErrorMessage({ message }) {
  return (
    <p className="error-message" role="alert">
      {message}
    </p>
  )
}

export default ErrorMessage
