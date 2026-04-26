document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  const status = document.getElementById('upload-status');
  const mediaInput = document.getElementById('media');
  const primaryEndpoint = '/api/upload';
  const fallbackEndpoint = 'http://127.0.0.1:3000/api/upload';

  function setStatus(message, type = 'info') {
    status.textContent = message;
    status.style.color = type === 'error' ? '#a22020' : '#0f4e78';
  }

  async function sendForm(formData, url) {
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const media = mediaInput.files[0];

    if (!title && !description && !media) {
      setStatus('Please add a title, a description, or choose a file before uploading.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (media) {
      formData.append('media', media);
    }

    setStatus('Uploading your post...');

    try {
      let response = await sendForm(formData, primaryEndpoint);
      if (!response.ok && window.location.origin !== 'http://127.0.0.1:3000') {
        response = await sendForm(formData, fallbackEndpoint);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        setStatus(errorData?.error || `Upload failed (${response.status}).`, 'error');
        return;
      }

      setStatus('Upload successful! Redirecting to gallery...');
      setTimeout(() => {
        window.location.href = 'turnaround.html';
      }, 1400);
    } catch (error) {
      setStatus('Upload failed. Please use the server at http://127.0.0.1:3000 and refresh the page.', 'error');
    }
  });
});
