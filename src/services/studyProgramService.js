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
   * @returns {Promise<Object>} Paginated study program list
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      isActive,
      idJenjang,
      idFakultas,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { namaProdi: { contains: search, mode: 'insensitive' } },
        { idProdi: { contains: search, mode: 'insensitive' } },
        { namaFakultas: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (idJenjang) {
      where.idJenjang = idJenjang;
    }

    if (idFakultas) {
      where.idFakultas = idFakultas;
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
   * Get study program by idProdi
   * @param {string} idProdi - Study program prodi ID
   * @returns {Promise<Object|null>} Study program record or null
   */
  async findByIdProdi(idProdi) {
    const studyProgram = await prisma.studyProgram.findUnique({
      where: { idProdi },
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
   * Check if idProdi exists
   * @param {string} idProdi - Study program prodi ID
   * @param {string} excludeId - ID to exclude (for updates)
   * @returns {Promise<boolean>} True if exists
   */
  async idProdiExists(idProdi, excludeId = null) {
    const where = excludeId
      ? { idProdi, NOT: { id: excludeId } }
      : { idProdi };

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
      orderBy: { namaProdi: 'asc' },
      select: {
        id: true,
        idProdi: true,
        namaProdi: true,
        idJenjang: true,
        namaJenjang: true,
        idFakultas: true,
        namaFakultas: true,
      },
    });

    return studyPrograms;
  }

  /**
   * Bulk create/update study programs (for sync from external API)
   * @param {Array} programs - Array of study programs
   * @returns {Promise<Object>} Result summary
   */
  async syncFromExternal(programs) {
    let created = 0;
    let updated = 0;
    let errors = [];

    for (const program of programs) {
      try {
        const existing = await prisma.studyProgram.findUnique({
          where: { idProdi: program.idProdi || program.id_prodi }
        });

        const data = {
          idProdi: program.idProdi || program.id_prodi,
          namaProdi: program.namaProdi || program.nama_prodi,
          idJenjang: program.idJenjang || program.id_jenjang,
          namaJenjang: program.namaJenjang || program.nama_jenjang,
          idFakultas: program.idFakultas || program.id_fakultas,
          namaFakultas: program.namaFakultas || program.nama_fakultas,
          isActive: true,
        };

        if (existing) {
          await prisma.studyProgram.update({
            where: { idProdi: data.idProdi },
            data,
          });
          updated++;
        } else {
          await prisma.studyProgram.create({
            data: { id: uuidv4(), ...data },
          });
          created++;
        }
      } catch (error) {
        errors.push({ idProdi: program.idProdi || program.id_prodi, error: error.message });
      }
    }

    return { created, updated, errors };
  }
}

export default new StudyProgramService();
