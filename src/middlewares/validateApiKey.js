import prisma from '../prisma/client.js';

/**
 * API Key Validation Middleware
 * Validates the x-api-key header against the database
 */
export const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    // Check if API key is provided
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'API key is required. Please provide x-api-key header.',
      });
    }

    // Validate API key against database
    const keyRecord = await prisma.apiKey.findUnique({
      where: { apiKey },
    });

    // Check if key exists
    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid API key.',
      });
    }

    // Check if key is active
    if (!keyRecord.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'API key has been disabled.',
      });
    }

    // Attach key info to request for potential logging/auditing
    req.apiKeyInfo = {
      id: keyRecord.id,
      name: keyRecord.name,
    };

    next();
  } catch (error) {
    console.error('API Key validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to validate API key.',
    });
  }
};

export default validateApiKey;
