import { studentService } from '../services/index.js';

/**
 * Student Controller
 * Handles HTTP requests for student management
 */
class StudentController {
  /**
   * POST /students
   * Create a new student
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
      const exists = await studentService.registrationNumberExists(data.registrationNumber);
      if (exists) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Student with registration number ${data.registrationNumber} already exists.`,
        });
      }

      // Check if NIM already exists (if provided)
      if (data.nim) {
        const nimExists = await studentService.nimExists(data.nim);
        if (nimExists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `NIM ${data.nim} already exists.`,
          });
        }
      }

      const student = await studentService.create(data);

      res.status(201).json({
        success: true,
        message: 'Student created successfully.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /students
   * List students with pagination and search
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

      const result = await studentService.findAll({
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
        message: 'Students retrieved successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /students/:id
   * Get student by ID
   */
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await studentService.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Student not found.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /students/:id
   * Update student data
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if student exists
      const existingStudent = await studentService.findById(id);
      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Student not found.',
        });
      }

      // Check if new registrationNumber conflicts
      if (data.registrationNumber && data.registrationNumber !== existingStudent.registrationNumber) {
        const exists = await studentService.registrationNumberExists(data.registrationNumber, id);
        if (exists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `Registration number ${data.registrationNumber} already exists.`,
          });
        }
      }

      // Check if new NIM conflicts
      if (data.nim && data.nim !== existingStudent.nim) {
        const nimExists = await studentService.nimExists(data.nim, id);
        if (nimExists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `NIM ${data.nim} already exists.`,
          });
        }
      }

      const student = await studentService.update(id, data);

      res.status(200).json({
        success: true,
        message: 'Student updated successfully.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /students/:id
   * Delete an student
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Check if student exists
      const existingStudent = await studentService.findById(id);
      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Student not found.',
        });
      }

      await studentService.delete(id);

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /students/:id/convert
   * Convert student to student (assign NIM)
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

      // Check if student exists
      const existingStudent = await studentService.findById(id);
      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Student not found.',
        });
      }

      // Check if already converted
      if (existingStudent.nim) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Student already converted to student.',
        });
      }

      // Check if NIM exists
      const nimExists = await studentService.nimExists(nim);
      if (nimExists) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `NIM ${nim} already exists.`,
        });
      }

      const student = await studentService.convertToStudent(id, nim);

      res.status(200).json({
        success: true,
        message: 'Student converted to student successfully.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /students/:id/publish-loa
   * Publish LOA for an student
   */
  async publishLoa(req, res, next) {
    try {
      const { id } = req.params;

      // Check if student exists
      const existingStudent = await studentService.findById(id);
      if (!existingStudent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Student not found.',
        });
      }

      // Check if LOA already published
      if (existingStudent.loaPublished) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'LOA already published for this student.',
        });
      }

      const student = await studentService.publishLoa(id);

      res.status(200).json({
        success: true,
        message: 'LOA published successfully.',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /students/sync
   * Sync students from external API data
   */
  async sync(req, res, next) {
    try {
      const { data } = req.body;

      if (!data || !Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Request body must contain a "data" array of students.',
        });
      }

      const result = await studentService.syncFromExternal(data);

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

export default new StudentController();
