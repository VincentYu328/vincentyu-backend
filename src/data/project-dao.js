import db from '../database/db.js';

// Get all projects
export async function getAllProjects() {
  const projects = await db.all(`
    SELECT * FROM project ORDER BY date DESC
  `);
  return projects.map(p => ({
    ...p,
    tags: JSON.parse(p.tags)
  }));
}

// Get project by slug
export async function getProjectBySlug(slug) {
  const project = await db.get(`
    SELECT * FROM project WHERE slug = ?
  `, [slug]);
  
  if (!project) return null;
  
  return {
    ...project,
    tags: JSON.parse(project.tags)
  };
}

// Create project
export async function createProject(project) {
  const { slug, title, summary, content, tags, thumbnail, date } = project;
  
  // Check for duplicate slug
  const existing = await getProjectBySlug(slug);
  if (existing) {
    throw new Error(`Project with slug '${slug}' already exists`);
  }
  
  const result = await db.run(`
    INSERT INTO project (slug, title, summary, content, tags, thumbnail, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    slug,
    title,
    summary,
    content,
    JSON.stringify(tags),
    thumbnail,
    date
  ]);
  
  return { 
    id: result.lastID, 
    slug, 
    title, 
    summary, 
    content, 
    tags,  // Already parsed
    thumbnail, 
    date 
  };
}

// Update project
export async function updateProject(slug, project) {
  const { title, summary, content, tags, thumbnail, date } = project;
  
  const result = await db.run(`
    UPDATE project
    SET title=?, summary=?, content=?, tags=?, thumbnail=?, date=?,
        updated_at=CURRENT_TIMESTAMP
    WHERE slug=?
  `, [
    title,
    summary,
    content,
    JSON.stringify(tags),
    thumbnail,
    date,
    slug
  ]);
  
  if (result.changes === 0) {
    throw new Error(`Project with slug '${slug}' not found`);
  }
  
  return { slug, title, summary, content, tags, thumbnail, date };
}

// Delete project
export async function deleteProject(slug) {
  const result = await db.run(`
    DELETE FROM project WHERE slug=?
  `, [slug]);
  
  if (result.changes === 0) {
    throw new Error(`Project with slug '${slug}' not found`);
  }
  
  return { deleted: true, slug };
}