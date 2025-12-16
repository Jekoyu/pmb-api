import { Router } from 'express';
import { applicantController } from '../controllers/index.js';
import { validateApiKey } from '../middlewares/index.js';

const router = Router();

// Apply API Key validation to all applicant routes
router.use(validateApiKey);

/**
 * @route   POST /applicants
 * @desc    Create/receive student data (already converted from applicant)
 * @access  Protected (API Key required)
 */
router.post('/', (req, res, next) => applicantController.create(req, res, next));

/**
 * @route   GET /applicants
 * @desc    List all students with pagination and search
 * @access  Protected (API Key required)
 */
router.get('/', (req, res, next) => applicantController.findAll(req, res, next));

/**
 * @route   GET /applicants/:id
 * @desc    Get student by ID
 * @access  Protected (API Key required)
 */
router.get('/:id', (req, res, next) => applicantController.findById(req, res, next));

/**
 * @route   POST /applicants/sync
 * @desc    Bulk sync students from external system
 * @access  Protected (API Key required)
 */
router.post('/sync', (req, res, next) => applicantController.sync(req, res, next));

export default router;
