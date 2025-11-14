import express from 'express';
import * as projectDao from '../data/project-dao.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// -------------------------------------------------------
// GET /api/projects - Get all projects (public)
// -------------------------------------------------------
router.get('/', asyncHandler(async (req, res) => {
  const projects = await projectDao.getAllProjects();
  res.json({
    count: projects.length,
    projects
  });
}));

// -------------------------------------------------------
// GET /api/projects/:slug - Get project by slug (public)
// -------------------------------------------------------
router.get('/:slug', asyncHandler(async (req, res) => {
  const project = await projectDao.getProjectBySlug(req.params.slug);
  
  if (!project) {
    return res.status(404).json({ 
      error: `Project with slug '${req.params.slug}' not found` 
    });
  }
  
  res.json(project);
}));

// -------------------------------------------------------
// POST /api/projects - Create project (admin only)
// -------------------------------------------------------
router.post('/', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { slug, title, summary, content, tags, thumbnail, date } = req.body;
  
  // Validation
  if (!slug || !title || !summary || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields: slug, title, summary, date' 
    });
  }
  
  // Validate tags is an array
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ 
      error: 'Tags must be an array' 
    });
  }
  
  // Create project (will throw if slug exists)
  const newProject = await projectDao.createProject({
    ...req.body,
    tags: tags || []  // Default to empty array
  });
  
  res.status(201).json({
    message: 'Project created successfully',
    project: newProject
  });
}));

// -------------------------------------------------------
// PUT /api/projects/:slug - Update project (admin only)
// -------------------------------------------------------
router.put('/:slug', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { title, summary, content, tags, thumbnail, date } = req.body;
  
  // Validation
  if (!title && !summary && !content && !tags && !thumbnail && !date) {
    return res.status(400).json({ 
      error: 'At least one field must be provided for update' 
    });
  }
  
  // Validate tags if provided
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ 
      error: 'Tags must be an array' 
    });
  }
  
  // Update project (will throw if slug not found)
  const updatedProject = await projectDao.updateProject(req.params.slug, req.body);
  
  res.json({
    message: 'Project updated successfully',
    project: updatedProject
  });
}));

// -------------------------------------------------------
// DELETE /api/projects/:slug - Delete project (admin only)
// -------------------------------------------------------
router.delete('/:slug', authRequired, adminRequired, asyncHandler(async (req, res) => {
  // Delete project (will throw if slug not found)
  await projectDao.deleteProject(req.params.slug);
  
  res.json({ 
    message: 'Project deleted successfully',
    slug: req.params.slug
  });
}));

export default router;