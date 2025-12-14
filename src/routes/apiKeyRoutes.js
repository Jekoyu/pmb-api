import { Router } from 'express';
import { apiKeyController } from '../controllers/index.js';

const router = Router();

/**
 * @route   POST /api-keys
 * @desc    Generate a new API key
 * @access  Public (in production, this should be protected)
 */
router.post('/', (req, res, next) => apiKeyController.create(req, res, next));

/**
 * @route   GET /api-keys
 * @desc    List all API keys
 * @access  Public (in production, this should be protected)
 */
router.get('/', (req, res, next) => apiKeyController.findAll(req, res, next));

/**
 * @route   GET /api-keys/:id
 * @desc    Get API key by ID
 * @access  Public (in production, this should be protected)
 */
router.get('/:id', (req, res, next) => apiKeyController.findById(req, res, next));

/**
 * @route   PUT /api-keys/:id/disable
 * @desc    Disable an API key
 * @access  Public (in production, this should be protected)
 */
router.put('/:id/disable', (req, res, next) => apiKeyController.disable(req, res, next));

/**
 * @route   PUT /api-keys/:id/enable
 * @desc    Enable an API key
 * @access  Public (in production, this should be protected)
 */
router.put('/:id/enable', (req, res, next) => apiKeyController.enable(req, res, next));

/**
 * @route   DELETE /api-keys/:id
 * @desc    Delete an API key
 * @access  Public (in production, this should be protected)
 */
router.delete('/:id', (req, res, next) => apiKeyController.delete(req, res, next));

export default router;
