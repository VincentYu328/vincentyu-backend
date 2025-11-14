import db from '../database/db.js';

// Get all posts
export async function getAllPosts() {
  return db.all(`
    SELECT * FROM blog ORDER BY date DESC
  `);
}

// Get post by slug
export async function getPostBySlug(slug) {
  return db.get(`
    SELECT * FROM blog WHERE slug = ?
  `, [slug]);
}

// Create post
export async function createPost(post) {
  const { slug, title, summary, content, pillar, date } = post;
  
  // Check for duplicate slug
  const existing = await getPostBySlug(slug);
  if (existing) {
    throw new Error(`Blog post with slug '${slug}' already exists`);
  }
  
  const result = await db.run(`
    INSERT INTO blog (slug, title, summary, content, pillar, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [slug, title, summary, content, pillar, date]);
  
  return {
    id: result.lastID,
    slug,
    title,
    summary,
    content,
    pillar,
    date
  };
}

// Update post
export async function updatePost(slug, post) {
  const { title, summary, content, pillar, date } = post;
  
  const result = await db.run(`
    UPDATE blog
    SET title=?, summary=?, content=?, pillar=?, date=?,
        updated_at=CURRENT_TIMESTAMP
    WHERE slug=?
  `, [title, summary, content, pillar, date, slug]);
  
  if (result.changes === 0) {
    throw new Error(`Blog post with slug '${slug}' not found`);
  }
  
  return { slug, title, summary, content, pillar, date };
}

// Delete post
export async function deletePost(slug) {
  const result = await db.run(`
    DELETE FROM blog WHERE slug=?
  `, [slug]);
  
  if (result.changes === 0) {
    throw new Error(`Blog post with slug '${slug}' not found`);
  }
  
  return { deleted: true, slug };
}