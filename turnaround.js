document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const emptyState = document.getElementById('empty-state');
  const apiPaths = ['/api/posts'];

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';

    const title = document.createElement('h4');
    title.textContent = post.title || 'Community post';
    card.appendChild(title);

    if (post.kind === 'image') {
      const image = document.createElement('img');
      image.src = post.fileUrl;
      image.alt = post.title || 'Uploaded image';
      card.appendChild(image);
    }

    if (post.kind === 'video') {
      const video = document.createElement('video');
      video.src = post.fileUrl;
      video.controls = true;
      card.appendChild(video);
    }

    if (post.text) {
      const text = document.createElement('p');
      text.textContent = post.text;
      card.appendChild(text);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Posted on ${formatDate(post.createdAt)}`;
    card.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'post-actions';

    if (post.fileUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.className = 'download-btn';
      downloadLink.href = post.fileUrl;
      downloadLink.download = post.originalName || '';
      downloadLink.textContent = 'Download';
      actions.appendChild(downloadLink);
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this post?')) {
        return;
      }

      try {
        const deleteEndpoint = post.apiBase ? `${post.apiBase}/api/posts/${post.id}` : `/api/posts/${post.id}`;
        const response = await fetch(deleteEndpoint, { method: 'DELETE', credentials: 'same-origin' });
        if (!response.ok) {
          alert('Unable to delete the post.');
          return;
        }
        loadPosts();
      } catch (error) {
        alert('Network error while deleting the post.');
      }
    });

    actions.appendChild(deleteButton);
    card.appendChild(actions);

    return card;
  }

  async function fetchPosts(urls) {
    for (const url of urls) {
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) continue;
        const posts = await response.json();
        return { posts, base: url.replace('/api/posts', '') };
      } catch (error) {
        continue;
      }
    }
    throw new Error('Unable to fetch posts.');
  }

  async function loadPosts() {
    try {
      const { posts, base } = await fetchPosts(apiPaths);
      gallery.innerHTML = '';

      if (!posts.length) {
        emptyState.classList.remove('hidden');
        return;
      }

      emptyState.classList.add('hidden');
      posts.forEach((post) => {
        post.apiBase = base;
        gallery.appendChild(createPostCard(post));
      });
    } catch (error) {
      gallery.innerHTML = '<p>Unable to load posts right now. Please refresh the page.</p>';
    }
  }

  loadPosts();
});
