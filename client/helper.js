// Handle displaying error messages to the user
const handleError = (message) => {
  const errorEl = document.getElementById('errorMessage');
  if (errorEl) {
    errorEl.textContent = message;
    document.getElementById('animeMessage').classList.remove('hidden');
  }
};

// Send POST requests to the server using fetch
const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  const messageEl = document.getElementById('animeMessage');
  if (messageEl) {
    messageEl.classList.add('hidden');
  }

  if (result.redirect) {
    window.location = result.redirect;
  }

  if (result.error) {
    handleError(result.error);
  }

  if (handler && typeof handler === 'function') {
    handler(result);
  }
};

// Hide error message
const hideError = () => {
  const messageEl = document.getElementById('animeMessage');
  if (messageEl) {
    messageEl.classList.add('hidden');
  }
};

module.exports = {
  handleError,
  sendPost,
  hideError,
};

