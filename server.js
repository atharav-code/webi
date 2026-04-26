const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'very-secret-key';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const POSTS_FILE = path.join(__dirname, 'posts.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const USERS_FILE = path.join(__dirname, 'users.json');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cors')({ origin: true, credentials: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax'
  }
}));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

async function readPosts() {
  try {
    const content = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function writePosts(posts) {
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

async function readMessages() {
  try {
    const content = await fs.readFile(MESSAGES_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function writeMessages(messages) {
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

async function readUsers() {
  try {
    const content = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const passwordHash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(passwordHash, 'hex'));
}

function requireLogin(req, res, next) {
  if (req.session?.user?.username) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required.' });
}

app.get('/api/auth/me', (req, res) => {
  if (req.session?.user?.username) {
    return res.json({ username: req.session.user.username });
  }
  res.json({ username: null });
});

app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const users = await readUsers();
  const existing = users.find((user) => user.username.toLowerCase() === trimmedUsername.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Username already exists. Please choose another.' });
  }

  const { salt, hash } = hashPassword(trimmedPassword);
  const user = { username: trimmedUsername, salt, hash };
  users.push(user);
  await writeUsers(users);
  req.session.user = { username: trimmedUsername };

  res.json({ username: trimmedUsername });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const users = await readUsers();
  const user = users.find((u) => u.username.toLowerCase() === trimmedUsername.toLowerCase());
  if (!user || !verifyPassword(trimmedPassword, user.salt, user.hash)) {
    return res.status(400).json({ error: 'Invalid username or password.' });
  }

  req.session.user = { username: user.username };
  res.json({ username: user.username });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/posts', async (req, res) => {
  const posts = await readPosts();
  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

app.get('/api/messages', async (req, res) => {
  const messages = await readMessages();
  messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json(messages);
});

app.post('/api/messages', requireLogin, async (req, res) => {
  const { text } = req.body;
  const trimmedText = text?.trim();
  const username = req.session.user.username;

  if (!trimmedText) {
    return res.status(400).json({ error: 'Message text cannot be empty.' });
  }

  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author: username,
    text: trimmedText,
    createdAt: new Date().toISOString()
  };

  const messages = await readMessages();
  messages.push(message);
  await writeMessages(messages);

  res.json(message);
});

app.post('/api/upload', requireLogin, upload.single('media'), async (req, res) => {
  const { title, description } = req.body;
  const text = description?.trim() || '';

  if (!text && !req.file) {
    return res.status(400).json({ error: 'Please provide text or select a file to upload.' });
  }

  let kind = 'text';
  let fileUrl = null;
  let fileName = null;
  let originalName = null;
  let mimeType = null;

  if (req.file) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (['.mp4', '.mov', '.webm', '.avi'].includes(ext)) {
      kind = 'video';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      kind = 'image';
    } else {
      kind = 'file';
    }

    fileUrl = `/uploads/${req.file.filename}`;
    fileName = req.file.filename;
    originalName = req.file.originalname;
    mimeType = req.file.mimetype;
  }

  const post = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    author: req.session.user.username,
    title: title?.trim() || (kind === 'text' ? 'Community note' : 'Media post'),
    text,
    kind,
    fileUrl,
    fileName,
    originalName,
    mimeType,
    createdAt: new Date().toISOString()
  };

  const posts = await readPosts();
  posts.push(post);
  await writePosts(posts);

  res.json(post);
});

app.delete('/api/posts/:id', requireLogin, async (req, res) => {
  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const [deletedPost] = posts.splice(index, 1);
  if (deletedPost.author !== req.session.user.username) {
    return res.status(403).json({ error: 'You are not allowed to delete this post.' });
  }

  if (deletedPost.fileName) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, deletedPost.fileName));
    } catch (error) {
      // ignore missing files
    }
  }

  await writePosts(posts);
  res.json({ success: true });
});

app.get('/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOAD_DIR, filename);
  res.download(filePath, filename, (error) => {
    if (error) {
      res.status(404).send('File not found.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
