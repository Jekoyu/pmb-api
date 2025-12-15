import { studyProgramService } from '../services/index.js';

/**
 * Study Program Controller
 * Handles HTTP requests for study program management
 */
class StudyProgramController {
  /**
   * POST /study-programs
   * Create a new study program
   */
  async create(req, res, next) {
    try {
      const data = req.body;

      // Validate required fields
      const requiredFields = ['code', 'name', 'nimFormat'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Validate code length (max 4 characters)
      if (data.code.length > 4) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Code must be maximum 4 characters.',
        });
      }

      // Check if code already exists
      const codeExists = await studyProgramService.codeExists(data.code);
      if (codeExists) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Study program with code ${data.code} already exists.`,
        });
      }

      // Set default value for isActive
      if (typeof data.isActive !== 'boolean') {
        data.isActive = true;
      }

      const studyProgram = await studyProgramService.create(data);

      res.status(201).json({
        success: true,
        message: 'Study program created successfully.',
        data: studyProgram,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /study-programs
   * List study programs with pagination and search
   */
  async findAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Parse isActive query param
      let activeFilter;
      if (isActive === 'true') activeFilter = true;
      else if (isActive === 'false') activeFilter = false;

      const result = await studyProgramService.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        isActive: activeFilter,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: 'Study programs retrieved successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /study-programs/active
   * Get all active study programs (for dropdowns)
   */
  async findAllActive(req, res, next) {
    try {
      const studyPrograms = await studyProgramService.findAllActive();

      res.status(200).json({
        success: true,
        message: 'Active study programs retrieved successfully.',
        data: studyPrograms,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /study-programs/:id
   * Get study program by ID
   */
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const studyProgram = await studyProgramService.findById(id);

      if (!studyProgram) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Study program not found.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Study program retrieved successfully.',
        data: studyProgram,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /study-programs/:id
   * Update study program data
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if study program exists
      const existingProgram = await studyProgramService.findById(id);
      if (!existingProgram) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Study program not found.',
        });
      }

      // Validate code length if provided
      if (data.code && data.code.length > 4) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Code must be maximum 4 characters.',
        });
      }

      // Check if new code conflicts with another study program
      if (data.code && data.code !== existingProgram.code) {
        const codeExists = await studyProgramService.codeExists(data.code, id);
        if (codeExists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `Study program with code ${data.code} already exists.`,
          });
        }
      }

      const studyProgram = await studyProgramService.update(id, data);

      res.status(200).json({
        success: true,
        message: 'Study program updated successfully.',
        data: studyProgram,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /study-programs/:id
   * Delete a study program
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Check if study program exists
      const existingProgram = await studyProgramService.findById(id);
      if (!existingProgram) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Study program not found.',
        });
      }

      await studyProgramService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Study program deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudyProgramController();
