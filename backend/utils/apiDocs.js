// API documentation helpers for Swagger generation. No business logic is present in this file.
/**
 * API Documentation Helper Utilities
 * Provides standardized documentation templates and schemas
 */

/**
 * Standard API response schema for Swagger documentation
 */
const responseSchemas = {
  Success: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Operation completed successfully'
      },
      data: {
        type: 'object',
        description: 'Response data'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  
  Error: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'An error occurred'
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  
  ValidationError: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        example: 'Validation Error'
      },
      errors: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['Field is required', 'Invalid email format']
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  },
  
  PaginatedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Data retrieved successfully'
      },
      data: {
        type: 'array',
        items: {
          type: 'object'
        }
      },
      pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1
          },
          limit: {
            type: 'integer',
            example: 10
          },
          total: {
            type: 'integer',
            example: 100
          },
          pages: {
            type: 'integer',
            example: 10
          }
        }
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    }
  }
};

/**
 * Common parameter schemas
 */
const parameterSchemas = {
  IdParam: {
    name: 'id',
    in: 'path',
    required: true,
    schema: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$'
    },
    description: 'MongoDB ObjectId'
  },
  
  PageQuery: {
    name: 'page',
    in: 'query',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1
    },
    description: 'Page number for pagination'
  },
  
  LimitQuery: {
    name: 'limit',
    in: 'query',
    required: false,
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 10
    },
    description: 'Number of items per page'
  },
  
  SearchQuery: {
    name: 'search',
    in: 'query',
    required: false,
    schema: {
      type: 'string'
    },
    description: 'Search term for filtering results'
  },
  
  SortQuery: {
    name: 'sort',
    in: 'query',
    required: false,
    schema: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'desc'
    },
    description: 'Sort order'
  }
};

/**
 * Security schemes for authentication
 */
const securitySchemes = {
  BearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token for authentication'
  },
  
  ApiKeyAuth: {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: 'API key for authentication'
  }
};

/**
 * Generate standard endpoint documentation
 * @param {Object} options - Documentation options
 * @returns {Object} Swagger endpoint documentation
 */
const generateEndpointDoc = (options) => {
  const {
    summary,
    description,
    tags = [],
    parameters = [],
    requestBody,
    responses = {},
    security = []
  } = options;
  
  const doc = {
    summary,
    description,
    tags,
    parameters,
    responses: {
      '500': {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      ...responses
    }
  };
  
  if (requestBody) {
    doc.requestBody = requestBody;
  }
  
  if (security.length > 0) {
    doc.security = security;
  }
  
  return doc;
};

/**
 * Generate CRUD operation documentation
 * @param {string} resource - Resource name (e.g., 'User', 'Table')
 * @param {Object} schema - Resource schema
 * @returns {Object} Complete CRUD documentation
 */
const generateCRUDDocs = (resource, schema) => {
  const resourceLower = resource.toLowerCase();
  const resourcePlural = `${resourceLower}s`;
  
  return {
    [`get${resourcePlural}`]: generateEndpointDoc({
      summary: `Get all ${resourcePlural}`,
      description: `Retrieve a paginated list of ${resourcePlural}`,
      tags: [resource],
      parameters: [
        parameterSchemas.PageQuery,
        parameterSchemas.LimitQuery,
        parameterSchemas.SearchQuery
      ],
      responses: {
        '200': {
          description: `${resourcePlural} retrieved successfully`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedResponse' }
            }
          }
        }
      },
      security: [{ BearerAuth: [] }]
    }),
    
    [`get${resource}ById`]: generateEndpointDoc({
      summary: `Get ${resourceLower} by ID`,
      description: `Retrieve a specific ${resourceLower} by its ID`,
      tags: [resource],
      parameters: [parameterSchemas.IdParam],
      responses: {
        '200': {
          description: `${resource} retrieved successfully`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        '404': {
          description: `${resource} not found`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      },
      security: [{ BearerAuth: [] }]
    }),
    
    [`create${resource}`]: generateEndpointDoc({
      summary: `Create new ${resourceLower}`,
      description: `Create a new ${resourceLower} in the system`,
      tags: [resource],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema
          }
        }
      },
      responses: {
        '201': {
          description: `${resource} created successfully`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        '400': {
          description: 'Validation Error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationError' }
            }
          }
        }
      },
      security: [{ BearerAuth: [] }]
    }),
    
    [`update${resource}`]: generateEndpointDoc({
      summary: `Update ${resourceLower}`,
      description: `Update an existing ${resourceLower}`,
      tags: [resource],
      parameters: [parameterSchemas.IdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema
          }
        }
      },
      responses: {
        '200': {
          description: `${resource} updated successfully`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        '404': {
          description: `${resource} not found`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      },
      security: [{ BearerAuth: [] }]
    }),
    
    [`delete${resource}`]: generateEndpointDoc({
      summary: `Delete ${resourceLower}`,
      description: `Delete a ${resourceLower} from the system`,
      tags: [resource],
      parameters: [parameterSchemas.IdParam],
      responses: {
        '200': {
          description: `${resource} deleted successfully`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Success' }
            }
          }
        },
        '404': {
          description: `${resource} not found`,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      },
      security: [{ BearerAuth: [] }]
    })
  };
};

module.exports = {
  responseSchemas,
  parameterSchemas,
  securitySchemes,
  generateEndpointDoc,
  generateCRUDDocs
};
