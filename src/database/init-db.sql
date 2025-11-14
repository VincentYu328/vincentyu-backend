PRAGMA foreign_keys = ON;

---------------------------------------------------------
-- USERS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- BLOG TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT DEFAULT '',
  pillar TEXT NOT NULL,
  date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- PROJECT TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  thumbnail TEXT DEFAULT '',
  date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---------------------------------------------------------
-- INDEXES
---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog (slug);
CREATE INDEX IF NOT EXISTS idx_project_slug ON project (slug);
CREATE INDEX IF NOT EXISTS idx_user_email ON user (email);

---------------------------------------------------------
-- TRIGGERS (auto-update updated_at)
---------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS update_blog_timestamp 
AFTER UPDATE ON blog
BEGIN
  UPDATE blog SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_project_timestamp 
AFTER UPDATE ON project
BEGIN
  UPDATE project SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
AFTER UPDATE ON user
BEGIN
  UPDATE user SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

---------------------------------------------------------
-- MESSAGES TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,   
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
