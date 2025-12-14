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
      const requiredFields = [
        'noReg', 'namaLengkap', 'jalur', 'jurusan', 'email', 'phone',
        'tahunLulus', 'gender', 'asalSekolah', 'jurusanSekolah', 'ranking',
        'namaOrangTua', 'hpOrangTua', 'agama', 'provinsi', 'kotaKabupaten',
        'kelurahan', 'kecamatan', 'kodePos', 'alamatRumah',
      ];

      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Check if registration number already exists
      const existingStudent = await studentService.noRegExists(data.noReg);
      if (existingStudent) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: `Student with registration number ${data.noReg} already exists.`,
        });
      }

      // Set default values for optional boolean fields
      if (typeof data.butaWarna !== 'boolean') {
        data.butaWarna = false;
      }
      if (typeof data.loaPublished !== 'boolean') {
        data.loaPublished = false;
      }

      // Convert tanggalLoa string to Date if provided
      if (data.tanggalLoa && typeof data.tanggalLoa === 'string') {
        data.tanggalLoa = new Date(data.tanggalLoa);
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
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const result = await studentService.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
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

      // Check if new registration number conflicts with another student
      if (data.noReg && data.noReg !== existingStudent.noReg) {
        const noRegExists = await studentService.noRegExists(data.noReg, id);
        if (noRegExists) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `Student with registration number ${data.noReg} already exists.`,
          });
        }
      }

      // Convert tanggalLoa string to Date if provided
      if (data.tanggalLoa && typeof data.tanggalLoa === 'string') {
        data.tanggalLoa = new Date(data.tanggalLoa);
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
   * Delete a student
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
}

export default new StudentController();
