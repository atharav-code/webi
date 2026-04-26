document.addEventListener('DOMContentLoaded', () => {
  const chatList = document.getElementById('chat-list');
  const chatForm = document.getElementById('chat-form');
  const status = document.getElementById('chat-status');
  const apiPaths = ['/api/messages', 'http://127.0.0.1:3000/api/messages'];

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.style.color = isError ? '#a22020' : '#5f7d94';
  }

  function createMessageItem(message) {
    const item = document.createElement('li');
    item.className = 'chat-message';

    const author = document.createElement('strong');
    author.textContent = message.author || 'Anonymous';
    item.appendChild(author);

    const text = document.createElement('p');
    text.textContent = message.text;
    item.appendChild(text);

    const time = document.createElement('span');
    time.textContent = new Date(message.createdAt).toLocaleString();
    item.appendChild(time);

    return item;
  }

  async function fetchMessages(urls) {
    for (const url of urls) {
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) continue;
        const messages = await response.json();
        return { messages, base: url.replace('/api/messages', '') };
      } catch (error) {
        continue;
      }
    }
    throw new Error('Unable to fetch messages.');
  }

  async function loadChat() {
    try {
      const { messages } = await fetchMessages(apiPaths);
      chatList.innerHTML = '';

      if (!messages.length) {
        chatList.innerHTML = '<li class="chat-message"><strong>Welcome!</strong><p>No messages yet. Start the conversation.</p></li>';
        return;
      }

      messages.forEach((message) => {
        chatList.appendChild(createMessageItem(message));
      });
    } catch (error) {
      chatList.innerHTML = '<li class="chat-message"><strong>Error</strong><p>Unable to load chat messages right now.</p></li>';
      setStatus('Unable to connect to the server. Refresh the page.', true);
    }
  }

  async function sendMessage(payload) {
    for (const url of apiPaths) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) continue;
        return await response.json();
      } catch (error) {
        continue;
      }
    }
    throw new Error('Unable to send message.');
  }

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = document.getElementById('message').value.trim();

    if (!message) {
      setStatus('Please type a message before sending.', true);
      return;
    }

    setStatus('Sending message...');

    try {
      await sendMessage({ text: message });
      document.getElementById('message').value = '';
      setStatus('Message sent.');
      loadChat();
    } catch (error) {
      setStatus('Unable to send message. Please refresh and try again.', true);
    }
  });

  loadChat();
});
