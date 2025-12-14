import { apiKeyService } from '../services/index.js';

/**
 * API Key Controller
 * Handles HTTP requests for API key management
 */
class ApiKeyController {
  /**
   * POST /api-keys
   * Generate a new API key
   */
  async create(req, res, next) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Name is required.',
        });
      }

      const apiKey = await apiKeyService.create(name);

      res.status(201).json({
        success: true,
        message: 'API key created successfully.',
        data: apiKey,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api-keys
   * List all API keys
   */
  async findAll(req, res, next) {
    try {
      const keys = await apiKeyService.findAll();

      res.status(200).json({
        success: true,
        message: 'API keys retrieved successfully.',
        data: keys,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api-keys/:id
   * Get API key by ID
   */
  async findById(req, res, next) {
    try {
      const { id } = req.params;
      const key = await apiKeyService.findById(id);

      if (!key) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'API key not found.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'API key retrieved successfully.',
        data: key,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api-keys/:id/disable
   * Disable an API key
   */
  async disable(req, res, next) {
    try {
      const { id } = req.params;

      const existingKey = await apiKeyService.findById(id);
      if (!existingKey) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'API key not found.',
        });
      }

      const key = await apiKeyService.disable(id);

      res.status(200).json({
        success: true,
        message: 'API key disabled successfully.',
        data: key,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api-keys/:id/enable
   * Enable an API key
   */
  async enable(req, res, next) {
    try {
      const { id } = req.params;

      const existingKey = await apiKeyService.findById(id);
      if (!existingKey) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'API key not found.',
        });
      }

      const key = await apiKeyService.enable(id);

      res.status(200).json({
        success: true,
        message: 'API key enabled successfully.',
        data: key,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api-keys/:id
   * Delete an API key
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existingKey = await apiKeyService.findById(id);
      if (!existingKey) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'API key not found.',
        });
      }

      await apiKeyService.delete(id);

      res.status(200).json({
        success: true,
        message: 'API key deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ApiKeyController();
