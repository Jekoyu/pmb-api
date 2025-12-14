import prisma from '../prisma/client.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * API Key Service
 * Handles all business logic for API key management
 */
class ApiKeyService {
  /**
   * Generate a new API key
   * @param {string} name - Name/description for the API key
   * @returns {Promise<Object>} Created API key record
   */
  async create(name) {
    const apiKey = `pmb_${uuidv4().replace(/-/g, '')}`;
    
    const newKey = await prisma.apiKey.create({
      data: {
        id: uuidv4(),
        name,
        apiKey,
        isActive: true,
      },
    });

    return newKey;
  }

  /**
   * Get all API keys
   * @returns {Promise<Array>} List of API keys
   */
  async findAll() {
    const keys = await prisma.apiKey.findMany({
      select: {
        id: true,
        name: true,
        apiKey: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys;
  }

  /**
   * Get API key by ID
   * @param {string} id - API key ID
   * @returns {Promise<Object|null>} API key record or null
   */
  async findById(id) {
    const key = await prisma.apiKey.findUnique({
      where: { id },
    });

    return key;
  }

  /**
   * Disable an API key
   * @param {string} id - API key ID
   * @returns {Promise<Object>} Updated API key record
   */
  async disable(id) {
    const key = await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return key;
  }

  /**
   * Enable an API key
   * @param {string} id - API key ID
   * @returns {Promise<Object>} Updated API key record
   */
  async enable(id) {
    const key = await prisma.apiKey.update({
      where: { id },
      data: { isActive: true },
    });

    return key;
  }

  /**
   * Delete an API key
   * @param {string} id - API key ID
   * @returns {Promise<Object>} Deleted API key record
   */
  async delete(id) {
    const key = await prisma.apiKey.delete({
      where: { id },
    });

    return key;
  }
}

export default new ApiKeyService();
