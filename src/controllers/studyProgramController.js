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
      const requiredFields = ['idProdi', 'namaProdi', 'idJenjang', 'namaJenjang', 'idFakultas', 'namaFakultas'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Check if idProdi already exists
      const exists = await studyProgramService.idProdiExists(data.idProdi);
      if (exists) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Study program with idProdi ${data.idProdi} already exists.`,
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
        idJenjang,
        idFakultas,
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
        idJenjang,
        idFakultas,
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

      // Check if new idProdi conflicts with another study program
      if (data.idProdi && data.idProdi !== existingProgram.idProdi) {
        const exists = await studyProgramService.idProdiExists(data.idProdi, id);
        if (exists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `Study program with idProdi ${data.idProdi} already exists.`,
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

  /**
   * POST /study-programs/sync
   * Sync study programs from external API data
   */
  async sync(req, res, next) {
    try {
      const { data } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Request body must contain a "data" array of study programs.',
        });
      }

      const result = await studyProgramService.syncFromExternal(data);

      res.status(200).json({
        success: true,
        message: `Sync completed. Created: ${result.created}, Updated: ${result.updated}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudyProgramController();
