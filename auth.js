async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

async function getCurrentUser() {
  try {
    return await fetchJson('/api/auth/me', { credentials: 'same-origin' });
  } catch (error) {
    return { username: null };
  }
}

async function updateAuthLinks(user) {
  const authLinks = document.querySelectorAll('.auth-link');
  authLinks.forEach((link) => {
    if (user?.username) {
      link.href = '#';
      link.textContent = 'Logout';
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        await fetchJson('/api/auth/logout', {
          method: 'POST',
          credentials: 'same-origin'
        });
        window.location.href = 'login.html';
      });
    } else {
      link.href = 'login.html';
      link.textContent = 'Log in';
    }
  });
}

async function initializeAuth() {
  const user = await getCurrentUser();
  await updateAuthLinks(user);

  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay && user?.username) {
    usernameDisplay.textContent = user.username;
  }

  if (document.body.dataset.protected === 'true' && !user?.username) {
    window.location.href = 'login.html';
    return null;
  }

  const authStatus = document.getElementById('auth-status');
  if (authStatus) {
    authStatus.textContent = user?.username ? `Signed in as ${user.username}` : 'Please sign in to continue.';
  }

  if (window.location.pathname.endsWith('login.html') && user?.username) {
    window.location.href = 'index.html';
  }

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const status = document.getElementById('auth-status');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
      if (!username || !password) {
        status.textContent = 'Username and password are required.';
        status.style.color = '#a22020';
        return;
      }
      try {
        await fetchJson('/api/auth/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        window.location.href = 'index.html';
      } catch (error) {
        status.textContent = error.message;
        status.style.color = '#a22020';
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const username = document.getElementById('signup-username').value.trim();
      const password = document.getElementById('signup-password').value.trim();
      if (!username || !password) {
        status.textContent = 'Username and password are required.';
        status.style.color = '#a22020';
        return;
      }
      try {
        await fetchJson('/api/auth/signup', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        window.location.href = 'index.html';
      } catch (error) {
        status.textContent = error.message;
        status.style.color = '#a22020';
      }
    });
  }

  return user;
}

initializeAuth();
