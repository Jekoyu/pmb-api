import { applicantService } from '../services/index.js';

/**
 * Applicant Controller
 * Handles HTTP requests for applicant management
 */
class ApplicantController {
  /**
   * POST /applicants
   * Create a new applicant
   */
  async create(req, res, next) {
    try {
      const data = req.body;

      // Validate required fields
      const requiredFields = ['registrationNumber', 'fullName', 'majorChoice1', 'nim'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Check if registrationNumber already exists
      const exists = await applicantService.registrationNumberExists(data.registrationNumber);
      if (exists) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Applicant with registration number ${data.registrationNumber} already exists.`,
        });
      }

      // Check if NIM already exists (if provided)
      if (data.nim) {
        const nimExists = await applicantService.nimExists(data.nim);
        if (nimExists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `NIM ${data.nim} already exists.`,
          });
        }
      }

      const applicant = await applicantService.create(data);

      res.status(201).json({
        success: true,
        message: 'Applicant created successfully.',
        data: applicant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /applicants
   * List applicants with pagination and search
   */
  async findAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        admissionPath,
        majorChoice1,
        loaPublished,
        hasNim,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Parse boolean query params
      let loaPublishedFilter;
      if (loaPublished === 'true') loaPublishedFilter = true;
      else if (loaPublished === 'false') loaPublishedFilter = false;

      let hasNimFilter;
      if (hasNim === 'true') hasNimFilter = true;
      else if (hasNim === 'false') hasNimFilter = false;

      const result = await applicantService.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        admissionPath,
        majorChoice1,
        loaPublished: loaPublishedFilter,
        hasNim: hasNimFilter,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        message: 'Applicants retrieved successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /applicants/:id
   * Get applicant by ID
   */
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const applicant = await applicantService.findById(id);

      if (!applicant) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Applicant not found.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Applicant retrieved successfully.',
        data: applicant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /applicants/:id
   * Update applicant data
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if applicant exists
      const existingApplicant = await applicantService.findById(id);
      if (!existingApplicant) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Applicant not found.',
        });
      }

      // Check if new registrationNumber conflicts
      if (data.registrationNumber && data.registrationNumber !== existingApplicant.registrationNumber) {
        const exists = await applicantService.registrationNumberExists(data.registrationNumber, id);
        if (exists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `Registration number ${data.registrationNumber} already exists.`,
          });
        }
      }

      // Check if new NIM conflicts
      if (data.nim && data.nim !== existingApplicant.nim) {
        const nimExists = await applicantService.nimExists(data.nim, id);
        if (nimExists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `NIM ${data.nim} already exists.`,
          });
        }
      }

      const applicant = await applicantService.update(id, data);

      res.status(200).json({
        success: true,
        message: 'Applicant updated successfully.',
        data: applicant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /applicants/:id
   * Delete an applicant
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Check if applicant exists
      const existingApplicant = await applicantService.findById(id);
      if (!existingApplicant) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Applicant not found.',
        });
      }

      await applicantService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Applicant deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /applicants/:id/convert
   * Convert applicant to student (assign NIM)
   */
  async convertToStudent(req, res, next) {
    try {
      const { id } = req.params;
      const { nim } = req.body;

      if (!nim) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'NIM is required.',
        });
      }

      // Check if applicant exists
      const existingApplicant = await applicantService.findById(id);
      if (!existingApplicant) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Applicant not found.',
        });
      }

      // Check if already converted
      if (existingApplicant.nim) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Applicant already converted to student.',
        });
      }

      // Check if NIM exists
      const nimExists = await applicantService.nimExists(nim);
      if (nimExists) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `NIM ${nim} already exists.`,
        });
      }

      const applicant = await applicantService.convertToStudent(id, nim);

      res.status(200).json({
        success: true,
        message: 'Applicant converted to student successfully.',
        data: applicant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /applicants/:id/publish-loa
   * Publish LOA for an applicant
   */
  async publishLoa(req, res, next) {
    try {
      const { id } = req.params;

      // Check if applicant exists
      const existingApplicant = await applicantService.findById(id);
      if (!existingApplicant) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Applicant not found.',
        });
      }

      // Check if LOA already published
      if (existingApplicant.loaPublished) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'LOA already published for this applicant.',
        });
      }

      const applicant = await applicantService.publishLoa(id);

      res.status(200).json({
        success: true,
        message: 'LOA published successfully.',
        data: applicant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /applicants/sync
   * Sync applicants from external API data
   */
  async sync(req, res, next) {
    try {
      const { data } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Request body must contain a "data" array of applicants.',
        });
      }

      const result = await applicantService.syncFromExternal(data);

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

export default new ApplicantController();
