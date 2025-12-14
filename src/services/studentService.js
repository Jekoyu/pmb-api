import prisma from '../prisma/client.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Student Service
 * Handles all business logic for student management
 */
class StudentService {
  /**
   * Create a new student
   * @param {Object} data - Student data
   * @returns {Promise<Object>} Created student record
   */
  async create(data) {
    const student = await prisma.student.create({
      data: {
        id: uuidv4(),
        ...data,
      },
    });

    return student;
  }

  /**
   * Get all students with pagination and search
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @param {string} options.search - Search term for nama_lengkap or no_reg
   * @param {string} options.sortBy - Field to sort by (default: createdAt)
   * @param {string} options.sortOrder - Sort order: asc or desc (default: desc)
   * @returns {Promise<Object>} Paginated student list
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { namaLengkap: { contains: search } },
            { noReg: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.student.count({ where });

    // Get students
    const students = await prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get student by ID
   * @param {string} id - Student ID
   * @returns {Promise<Object|null>} Student record or null
   */
  async findById(id) {
    const student = await prisma.student.findUnique({
      where: { id },
    });

    return student;
  }

  /**
   * Get student by registration number
   * @param {string} noReg - Registration number
   * @returns {Promise<Object|null>} Student record or null
   */
  async findByNoReg(noReg) {
    const student = await prisma.student.findUnique({
      where: { noReg },
    });

    return student;
  }

  /**
   * Update student data
   * @param {string} id - Student ID
   * @param {Object} data - Updated student data
   * @returns {Promise<Object>} Updated student record
   */
  async update(id, data) {
    const student = await prisma.student.update({
      where: { id },
      data,
    });

    return student;
  }

  /**
   * Delete a student
   * @param {string} id - Student ID
   * @returns {Promise<Object>} Deleted student record
   */
  async delete(id) {
    const student = await prisma.student.delete({
      where: { id },
    });

    return student;
  }

  /**
   * Check if student exists by ID
   * @param {string} id - Student ID
   * @returns {Promise<boolean>} True if exists
   */
  async exists(id) {
    const count = await prisma.student.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Check if registration number exists
   * @param {string} noReg - Registration number
   * @param {string} excludeId - ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async noRegExists(noReg, excludeId = null) {
    const where = excludeId
      ? { noReg, NOT: { id: excludeId } }
      : { noReg };

    const count = await prisma.student.count({ where });
    return count > 0;
  }
}

export default new StudentService();
