import { Router } from 'express';
import { studentController } from '../controllers/index.js';
import { validateApiKey } from '../middlewares/index.js';

const router = Router();

// Apply API Key validation to all student routes
router.use(validateApiKey);

/**
 * @route   POST /students
 * @desc    Create a new student
 * @access  Protected (API Key required)
 */
router.post('/', (req, res, next) => studentController.create(req, res, next));

/**
 * @route   GET /students
 * @desc    List students with pagination and search
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
 * @route   PUT /students/:id
 * @desc    Update student data
 * @access  Protected (API Key required)
 */
router.put('/:id', (req, res, next) => studentController.update(req, res, next));

/**
 * @route   DELETE /students/:id
 * @desc    Delete a student
 * @access  Protected (API Key required)
 */
router.delete('/:id', (req, res, next) => studentController.delete(req, res, next));

export default router;
