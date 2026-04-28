// ──────────────────────────────────────────────
// Validation Middleware — uses Joi
// ──────────────────────────────────────────────

/**
 * Express middleware factory.
 * Validates req.body against a Joi schema.
 * On failure, returns 400 with structured error list.
 *
 * @param {import("joi").Schema} schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove fields not defined in the schema
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    // Replace body with validated data
    req.body = value;
    next();
  };
};

/**
 * Validate req.query instead of req.body.
 *
 * @param {import("joi").Schema} schema
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.query = value;
    next();
  };
};