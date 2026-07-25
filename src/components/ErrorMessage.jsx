function ErrorMessage({ message }) {
  return (
    <p className="error-message" role="alert">
      Unable to load repositories: {message}
    </p>
  )
}

export default ErrorMessage
