import express from 'express';
import * as blogDao from '../data/blog-dao.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// -------------------------------------------------------
// GET /api/blogs - Get all posts (public)
// -------------------------------------------------------
router.get('/', asyncHandler(async (req, res) => {
  const posts = await blogDao.getAllPosts();
  res.json({
    count: posts.length,
    posts
  });
}));

// -------------------------------------------------------
// GET /api/blogs/:slug - Get post by slug (public)
// -------------------------------------------------------
router.get('/:slug', asyncHandler(async (req, res) => {
  const post = await blogDao.getPostBySlug(req.params.slug);
  
  if (!post) {
    return res.status(404).json({ 
      error: `Blog post with slug '${req.params.slug}' not found` 
    });
  }
  
  res.json({ post });  // 原来是 res.json(post);
}));

// -------------------------------------------------------
// POST /api/blogs - Create post (admin only)
// -------------------------------------------------------
router.post('/', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { slug, title, summary, content, pillar, date } = req.body;
  
  // Validation
  if (!slug || !title || !summary || !pillar || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields: slug, title, summary, pillar, date' 
    });
  }
  
  // Create post (will throw if slug exists)
  const newPost = await blogDao.createPost(req.body);
  
  res.status(201).json({
    message: 'Blog post created successfully',
    post: newPost
  });
}));

// -------------------------------------------------------
// PUT /api/blogs/:slug - Update post (admin only)
// -------------------------------------------------------
router.put('/:slug', authRequired, adminRequired, asyncHandler(async (req, res) => {
  const { title, summary, content, pillar, date } = req.body;
  
  // Validation
  if (!title && !summary && !content && !pillar && !date) {
    return res.status(400).json({ 
      error: 'At least one field must be provided for update' 
    });
  }
  
  // Update post (will throw if slug not found)
  const updatedPost = await blogDao.updatePost(req.params.slug, req.body);
  
  res.json({
    message: 'Blog post updated successfully',
    post: updatedPost
  });
}));

// -------------------------------------------------------
// DELETE /api/blogs/:slug - Delete post (admin only)
// -------------------------------------------------------
router.delete('/:slug', authRequired, adminRequired, asyncHandler(async (req, res) => {
  // Delete post (will throw if slug not found)
  await blogDao.deletePost(req.params.slug);
  
  res.json({ 
    message: 'Blog post deleted successfully',
    slug: req.params.slug
  });
}));

export default router;