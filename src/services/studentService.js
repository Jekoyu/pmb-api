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
   * Get all students with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated student list
   */
  async findAll(options = {}) {
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
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nim: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (admissionPath) {
      where.admissionPath = admissionPath;
    }

    if (majorChoice1) {
      where.majorChoice1 = majorChoice1;
    }

    if (typeof loaPublished === 'boolean') {
      where.loaPublished = loaPublished;
    }

    if (hasNim === true) {
      where.nim = { not: null };
    } else if (hasNim === false) {
      where.nim = null;
    }

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
   * @param {string} registrationNumber - Registration number
   * @returns {Promise<Object|null>} Student record or null
   */
  async findByRegistrationNumber(registrationNumber) {
    const student = await prisma.student.findUnique({
      where: { registrationNumber },
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
   * Delete an student
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
   * Check if registration number exists
   * @param {string} registrationNumber - Registration number
   * @param {string} excludeId - ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async registrationNumberExists(registrationNumber, excludeId = null) {
    const where = excludeId
      ? { registrationNumber, NOT: { id: excludeId } }
      : { registrationNumber };

    const count = await prisma.student.count({ where });
    return count > 0;
  }

  /**
   * Check if NIM exists
   * @param {string} nim - NIM
   * @param {string} excludeId - ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async nimExists(nim, excludeId = null) {
    if (!nim) return false;
    
    const where = excludeId
      ? { nim, NOT: { id: excludeId } }
      : { nim };

    const count = await prisma.student.count({ where });
    return count > 0;
  }

  /**
   * Convert student to student (assign NIM)
   * @param {string} id - Student ID
   * @param {string} nim - NIM to assign
   * @returns {Promise<Object>} Updated student record
   */
  async convertToStudent(id, nim) {
    const student = await prisma.student.update({
      where: { id },
      data: {
        nim,
        convertedAt: new Date(),
      },
    });

    return student;
  }

  /**
   * Publish LOA for an student
   * @param {string} id - Student ID
   * @returns {Promise<Object>} Updated student record
   */
  async publishLoa(id) {
    const student = await prisma.student.update({
      where: { id },
      data: {
        loaPublished: true,
        loaDate: new Date(),
      },
    });

    return student;
  }

  /**
   * Bulk create students (for sync from external API)
   * @param {Array} students - Array of students
   * @returns {Promise<Object>} Result summary
   */
  async syncFromExternal(students) {
    let created = 0;
    let updated = 0;
    let errors = [];

    for (const student of students) {
      try {
        // Map snake_case to camelCase if needed
        const data = {
          registrationNumber: student.registrationNumber || student.registration_number,
          fullName: student.fullName || student.full_name,
          admissionPath: student.admissionPath || student.admission_path,
          majorChoice1: student.majorChoice1 || student.major_choice_1,
          email: student.email,
          phone: student.phone,
          graduationYear: student.graduationYear || student.graduation_year,
          gender: student.gender,
          schoolOrigin: student.schoolOrigin || student.school_origin,
          schoolMajor: student.schoolMajor || student.school_major,
          ranking: student.ranking,
          parentName: student.parentName || student.parent_name,
          parentPhone: student.parentPhone || student.parent_phone,
          religion: student.religion,
          colorBlind: student.colorBlind || student.color_blind || false,
          province: student.province,
          city: student.city,
          village: student.village,
          district: student.district,
          postalCode: student.postalCode || student.postal_code,
          homeAddress: student.homeAddress || student.home_address,
          majorChoice2: student.majorChoice2 || student.major_choice_2,
          majorChoice3: student.majorChoice3 || student.major_choice_3,
          majorChoice4: student.majorChoice4 || student.major_choice_4,
          agent: student.agent,
          loaPublished: student.loaPublished || student.loa_published || false,
          loaDate: student.loaDate || student.loa_date,
          nim: student.nim,
          convertedAt: student.convertedAt || student.converted_at,
        };

        const existing = await prisma.student.findUnique({
          where: { registrationNumber: data.registrationNumber }
        });

        if (existing) {
          await prisma.student.update({
            where: { registrationNumber: data.registrationNumber },
            data,
          });
          updated++;
        } else {
          await prisma.student.create({
            data: { id: uuidv4(), ...data },
          });
          created++;
        }
      } catch (error) {
        errors.push({ 
          registrationNumber: student.registrationNumber || student.registration_number, 
          error: error.message 
        });
      }
    }

    return { created, updated, errors };
  }
}

export default new StudentService();
