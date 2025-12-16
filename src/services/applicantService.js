import prisma from '../prisma/client.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Applicant Service
 * Handles all business logic for applicant management
 */
class ApplicantService {
  /**
   * Create a new applicant
   * @param {Object} data - Applicant data
   * @returns {Promise<Object>} Created applicant record
   */
  async create(data) {
    const applicant = await prisma.applicant.create({
      data: {
        id: uuidv4(),
        ...data,
      },
    });

    return applicant;
  }

  /**
   * Get all applicants with optional filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated applicant list
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
    const total = await prisma.applicant.count({ where });

    // Get applicants
    const applicants = await prisma.applicant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data: applicants,
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
   * Get applicant by ID
   * @param {string} id - Applicant ID
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findById(id) {
    const applicant = await prisma.applicant.findUnique({
      where: { id },
    });

    return applicant;
  }

  /**
   * Get applicant by registration number
   * @param {string} registrationNumber - Registration number
   * @returns {Promise<Object|null>} Applicant record or null
   */
  async findByRegistrationNumber(registrationNumber) {
    const applicant = await prisma.applicant.findUnique({
      where: { registrationNumber },
    });

    return applicant;
  }

  /**
   * Update applicant data
   * @param {string} id - Applicant ID
   * @param {Object} data - Updated applicant data
   * @returns {Promise<Object>} Updated applicant record
   */
  async update(id, data) {
    const applicant = await prisma.applicant.update({
      where: { id },
      data,
    });

    return applicant;
  }

  /**
   * Delete an applicant
   * @param {string} id - Applicant ID
   * @returns {Promise<Object>} Deleted applicant record
   */
  async delete(id) {
    const applicant = await prisma.applicant.delete({
      where: { id },
    });

    return applicant;
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

    const count = await prisma.applicant.count({ where });
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

    const count = await prisma.applicant.count({ where });
    return count > 0;
  }

  /**
   * Convert applicant to student (assign NIM)
   * @param {string} id - Applicant ID
   * @param {string} nim - NIM to assign
   * @returns {Promise<Object>} Updated applicant record
   */
  async convertToStudent(id, nim) {
    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        nim,
        convertedAt: new Date(),
      },
    });

    return applicant;
  }

  /**
   * Publish LOA for an applicant
   * @param {string} id - Applicant ID
   * @returns {Promise<Object>} Updated applicant record
   */
  async publishLoa(id) {
    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        loaPublished: true,
        loaDate: new Date(),
      },
    });

    return applicant;
  }

  /**
   * Bulk create applicants (for sync from external API)
   * @param {Array} applicants - Array of applicants
   * @returns {Promise<Object>} Result summary
   */
  async syncFromExternal(applicants) {
    let created = 0;
    let updated = 0;
    let errors = [];

    for (const applicant of applicants) {
      try {
        // Map snake_case to camelCase if needed
        const data = {
          registrationNumber: applicant.registrationNumber || applicant.registration_number,
          fullName: applicant.fullName || applicant.full_name,
          admissionPath: applicant.admissionPath || applicant.admission_path,
          majorChoice1: applicant.majorChoice1 || applicant.major_choice_1,
          email: applicant.email,
          phone: applicant.phone,
          graduationYear: applicant.graduationYear || applicant.graduation_year,
          gender: applicant.gender,
          schoolOrigin: applicant.schoolOrigin || applicant.school_origin,
          schoolMajor: applicant.schoolMajor || applicant.school_major,
          ranking: applicant.ranking,
          parentName: applicant.parentName || applicant.parent_name,
          parentPhone: applicant.parentPhone || applicant.parent_phone,
          religion: applicant.religion,
          colorBlind: applicant.colorBlind || applicant.color_blind || false,
          province: applicant.province,
          city: applicant.city,
          village: applicant.village,
          district: applicant.district,
          postalCode: applicant.postalCode || applicant.postal_code,
          homeAddress: applicant.homeAddress || applicant.home_address,
          majorChoice2: applicant.majorChoice2 || applicant.major_choice_2,
          majorChoice3: applicant.majorChoice3 || applicant.major_choice_3,
          majorChoice4: applicant.majorChoice4 || applicant.major_choice_4,
          agent: applicant.agent,
          loaPublished: applicant.loaPublished || applicant.loa_published || false,
          loaDate: applicant.loaDate || applicant.loa_date,
          nim: applicant.nim,
          convertedAt: applicant.convertedAt || applicant.converted_at,
        };

        const existing = await prisma.applicant.findUnique({
          where: { registrationNumber: data.registrationNumber }
        });

        if (existing) {
          await prisma.applicant.update({
            where: { registrationNumber: data.registrationNumber },
            data,
          });
          updated++;
        } else {
          await prisma.applicant.create({
            data: { id: uuidv4(), ...data },
          });
          created++;
        }
      } catch (error) {
        errors.push({ 
          registrationNumber: applicant.registrationNumber || applicant.registration_number, 
          error: error.message 
        });
      }
    }

    return { created, updated, errors };
  }
}

export default new ApplicantService();
