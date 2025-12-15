import prisma from '../prisma/client.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Study Program Service
 * Handles all business logic for study program management
 */
class StudyProgramService {
  /**
   * Create a new study program
   * @param {Object} data - Study program data
   * @returns {Promise<Object>} Created study program record
   */
  async create(data) {
    const studyProgram = await prisma.studyProgram.create({
      data: {
        id: uuidv4(),
        ...data,
      },
    });

    return studyProgram;
  }

  /**
   * Get all study programs with optional filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @param {string} options.search - Search term for name or code
   * @param {boolean} options.isActive - Filter by active status
   * @param {string} options.sortBy - Field to sort by (default: createdAt)
   * @param {string} options.sortOrder - Sort order: asc or desc (default: desc)
   * @returns {Promise<Object>} Paginated study program list
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    // Get total count
    const total = await prisma.studyProgram.count({ where });

    // Get study programs
    const studyPrograms = await prisma.studyProgram.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data: studyPrograms,
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
   * Get study program by ID
   * @param {string} id - Study program ID
   * @returns {Promise<Object|null>} Study program record or null
   */
  async findById(id) {
    const studyProgram = await prisma.studyProgram.findUnique({
      where: { id },
    });

    return studyProgram;
  }

  /**
   * Get study program by code
   * @param {string} code - Study program code
   * @returns {Promise<Object|null>} Study program record or null
   */
  async findByCode(code) {
    const studyProgram = await prisma.studyProgram.findUnique({
      where: { code },
    });

    return studyProgram;
  }

  /**
   * Update study program data
   * @param {string} id - Study program ID
   * @param {Object} data - Updated study program data
   * @returns {Promise<Object>} Updated study program record
   */
  async update(id, data) {
    const studyProgram = await prisma.studyProgram.update({
      where: { id },
      data,
    });

    return studyProgram;
  }

  /**
   * Delete a study program
   * @param {string} id - Study program ID
   * @returns {Promise<Object>} Deleted study program record
   */
  async delete(id) {
    const studyProgram = await prisma.studyProgram.delete({
      where: { id },
    });

    return studyProgram;
  }

  /**
   * Check if code exists
   * @param {string} code - Study program code
   * @param {string} excludeId - ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async codeExists(code, excludeId = null) {
    const where = excludeId
      ? { code, NOT: { id: excludeId } }
      : { code };

    const count = await prisma.studyProgram.count({ where });
    return count > 0;
  }

  /**
   * Get all active study programs (for dropdowns)
   * @returns {Promise<Array>} List of active study programs
   */
  async findAllActive() {
    const studyPrograms = await prisma.studyProgram.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        nimFormat: true,
      },
    });

    return studyPrograms;
  }
}

export default new StudyProgramService();
