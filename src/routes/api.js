import express from 'express';

import blogRoutes from './blogRoutes.js';
import projectRoutes from './projectRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';

import contactRoutes from './contactRoutes.js';
import messagesRoutes from './messagesRoutes.js';

const router = express.Router();

// -------------------------------------------------------
// API Version Info
// -------------------------------------------------------
router.get('/', (req, res) => {
  res.json({
    name: 'Vincent Yu API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/blog',
      '/api/projects',
      '/api/contact',
      '/api/messages',
      '/api/users'
    ]
  });
});

// Public
router.use('/auth', authRoutes);
router.use('/blog', blogRoutes);
router.use('/projects', projectRoutes);
router.use('/contact', contactRoutes);

// Admin protected
router.use('/messages', messagesRoutes);
router.use('/users', userRoutes);

export default router;
