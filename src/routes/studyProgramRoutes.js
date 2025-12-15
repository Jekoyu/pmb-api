import { Router } from 'express';
import { studyProgramController } from '../controllers/index.js';
import { validateApiKey } from '../middlewares/index.js';

const router = Router();

// Apply API Key validation to all study program routes
router.use(validateApiKey);

/**
 * @route   POST /study-programs
 * @desc    Create a new study program
 * @access  Protected (API Key required)
 */
router.post('/', (req, res, next) => studyProgramController.create(req, res, next));

/**
 * @route   GET /study-programs
 * @desc    List study programs with pagination and search
 * @access  Protected (API Key required)
 */
router.get('/', (req, res, next) => studyProgramController.findAll(req, res, next));

/**
 * @route   GET /study-programs/active
 * @desc    Get all active study programs (for dropdowns)
 * @access  Protected (API Key required)
 */
router.get('/active', (req, res, next) => studyProgramController.findAllActive(req, res, next));

/**
 * @route   GET /study-programs/:id
 * @desc    Get study program by ID
 * @access  Protected (API Key required)
 */
router.get('/:id', (req, res, next) => studyProgramController.findById(req, res, next));

/**
 * @route   PUT /study-programs/:id
 * @desc    Update study program data
 * @access  Protected (API Key required)
 */
router.put('/:id', (req, res, next) => studyProgramController.update(req, res, next));

/**
 * @route   DELETE /study-programs/:id
 * @desc    Delete a study program
 * @access  Protected (API Key required)
 */
router.delete('/:id', (req, res, next) => studyProgramController.delete(req, res, next));

export default router;
