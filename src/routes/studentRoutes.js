import { Router } from 'express';
import { studentController } from '../controllers/index.js';
import { validateApiKey } from '../middlewares/index.js';

const router = Router();

// Apply API Key validation to all student routes
router.use(validateApiKey);

/**
 * @route   POST /students
 * @desc    Create/receive student data (already converted from student)
 * @access  Protected (API Key required)
 */
router.post('/', (req, res, next) => studentController.create(req, res, next));

/**
 * @route   GET /students
 * @desc    List all students with pagination and search
 * @access  Protected (API Key required)
 */
router.get('/', (req, res, next) => studentController.findAll(req, res, next));

/**
 * @route   GET /students/:id
 * @desc    Get student by ID
 * @access  Protected (API Key required)
 */
router.get('/:id', (req, res, next) => studentController.findById(req, res, next));

/**
 * @route   POST /students/sync
 * @desc    Bulk sync students from external system
 * @access  Protected (API Key required)
 */
router.post('/sync', (req, res, next) => studentController.sync(req, res, next));

export default router;
