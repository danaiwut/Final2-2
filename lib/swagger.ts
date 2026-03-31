import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Persona API',
      version: '1.0.0',
      description: 'API documentation for Smart Persona platform. All endpoints require a valid Supabase JWT Bearer token unless stated otherwise.',
    },
    tags: [
      { name: 'Admin', description: 'Admin-only endpoints (requires admin role)' },
      { name: 'Chat', description: 'Chat and messaging endpoints' },
      { name: 'Community', description: 'Community posts, comments, likes, and shares' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        // SuccessResponse: {
        //   type: 'object',
        //   properties: { success: { type: 'boolean', example: true } }
        // },
        // ErrorResponse: {
        //   type: 'object',
        //   properties: { error: { type: 'string', example: 'Unauthorized' } }
        // }
      }
    },
    security: [{ bearerAuth: [] }],
    paths: {

      // ─── COMMUNITY ──────────────────────────────────────────────

      '/api/community/posts': {
        post: {
          summary: 'Create a community post',
          description: 'Creates a new post. Will be pending moderation (is_published: false) until approved by admin.',
          tags: ['Community'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'title', 'content', 'postType'],
                  properties: {
                    userId: { type: 'string', format: 'uuid', description: 'Must match the authenticated user ID' },
                    title: { type: 'string', example: 'My first post' },
                    content: { type: 'string', example: 'Hello community!' },
                    postType: { type: 'string', example: 'general' },
                    personaId: { type: 'string', format: 'uuid', nullable: true },
                    tags: { type: 'array', items: { type: 'string' }, example: ['ai', 'persona'] },
                    imageUrl: { type: 'string', format: 'uri', nullable: true },
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Created post object' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — userId does not match auth user' },
            500: { description: 'Internal server error' }
          }
        }
      },

      '/api/community/posts/{id}': {
        delete: {
          summary: 'Delete a community post',
          description: 'Only the original author can delete their own post.',
          tags: ['Community'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Post deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — not the post owner' },
            404: { description: 'Post not found' },
            500: { description: 'Internal server error' }
          }
        }
      },

      '/api/community/comment': {
        post: {
          summary: 'Add a comment to a post',
          description: 'Adds a comment or reply. Comment count updated via DB trigger.',
          tags: ['Community'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['postId', 'content'],
                  properties: {
                    postId: { type: 'string', format: 'uuid' },
                    content: { type: 'string', example: 'Great post!' },
                    parentId: { type: 'string', format: 'uuid', nullable: true },
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Comment created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized' },
            500: { description: 'Failed to post comment' }
          }
        }
      },

      '/api/community/like': {
        post: {
          summary: 'Toggle like on a post',
          description: 'Likes if not already liked, unlikes if already liked (toggle).',
          tags: ['Community'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['postId'],
                  properties: { postId: { type: 'string', format: 'uuid' } }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Like toggled',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      liked: { type: 'boolean', description: 'true = liked, false = unliked' }
                    }
                  }
                }
              }
            },
            401: { description: 'Unauthorized' },
            500: { description: 'Internal server error' }
          }
        }
      },

      '/api/community/share': {
        post: {
          summary: 'Share a post',
          tags: ['Community'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['postId'],
                  properties: { postId: { type: 'string', format: 'uuid' } }
                }
              }
            }
          },
          responses: {
            200: { description: 'Shared', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized' },
            500: { description: 'Failed to share post' }
          }
        },
        delete: {
          summary: 'Unshare a post',
          tags: ['Community'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['postId'],
                  properties: { postId: { type: 'string', format: 'uuid' } }
                }
              }
            }
          },
          responses: {
            200: { description: 'Unshared', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized' },
            500: { description: 'Failed to unshare post' }
          }
        }
      },

      // ─── CHAT ────────────────────────────────────────────────────

      '/api/chat/start': {
        post: {
          summary: 'Start or get a conversation',
          description: 'Creates a 1-on-1 conversation. Returns existing if one already exists.',
          tags: ['Chat'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['participantId'],
                  properties: {
                    participantId: { type: 'string', format: 'uuid', description: 'User ID of the other participant' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Conversation ID',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { conversationId: { type: 'string', format: 'uuid' } }
                  }
                }
              }
            },
            401: { description: 'Unauthorized' },
            500: { description: 'Failed to start chat' }
          }
        }
      },

      '/api/chat/send': {
        post: {
          summary: 'Send a chat message',
          description: 'Sends a message to a recipient. Optionally provide conversationId to update last_message_at.',
          tags: ['Chat'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['receiverId', 'message'],
                  properties: {
                    receiverId: { type: 'string', format: 'uuid' },
                    message: { type: 'string', example: 'Hello there!' },
                    conversationId: { type: 'string', format: 'uuid', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Message sent' },
            400: { description: 'Message and receiver required' },
            401: { description: 'Unauthorized' },
            500: { description: 'Failed to send message' }
          }
        }
      },

      // ─── ADMIN ───────────────────────────────────────────────────

      '/api/admin/ads': {
        post: {
          summary: 'Create an advertisement (Admin)',
          description: 'Creates a new ad. Requires admin role.',
          tags: ['Admin'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content'],
                  properties: {
                    title: { type: 'string', example: 'Summer Sale' },
                    content: { type: 'string', example: 'Get 20% off' },
                    image_url: { type: 'string', format: 'uri', nullable: true },
                    link_url: { type: 'string', format: 'uri', nullable: true },
                    is_active: { type: 'boolean', default: true }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Ad created' },
            401: { description: 'Unauthorized or not admin' },
            500: { description: 'Failed to create ad' }
          }
        }
      },

      '/api/admin/ads/{id}': {
        put: {
          summary: 'Update an advertisement (Admin)',
          tags: ['Admin'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    image_url: { type: 'string', format: 'uri', nullable: true },
                    link_url: { type: 'string', format: 'uri', nullable: true },
                    is_active: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Ad updated' },
            401: { description: 'Unauthorized or not admin' },
            500: { description: 'Failed to update ad' }
          }
        },
        delete: {
          summary: 'Delete an advertisement (Admin)',
          tags: ['Admin'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Ad deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized or not admin' },
            500: { description: 'Failed to delete ad' }
          }
        }
      },

      '/api/admin/posts/{id}': {
        delete: {
          summary: 'Force-delete a community post (Admin)',
          description: 'Admin can delete any post regardless of ownership.',
          tags: ['Admin'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          responses: {
            200: { description: 'Post deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized or not admin' },
            500: { description: 'Failed to delete post' }
          }
        }
      },

      '/api/admin/posts/{id}/moderate': {
        post: {
          summary: 'Moderate a community post (Admin)',
          description: 'Approves or rejects a post. Requires admin or super_admin role.',
          tags: ['Admin'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['approve', 'reject'] },
                    reason: { type: 'string', example: 'Violates community guidelines', description: 'Required when action is reject' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Post moderated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Invalid action or missing rejection reason' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — not admin or super_admin' },
            500: { description: 'Internal server error' }
          }
        }
      },

      '/api/admin/set-role': {
        post: {
          summary: 'Set a user role (Admin)',
          description: 'Updates role of a user. Valid roles: "admin", "user".',
          tags: ['Admin'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'role'],
                  properties: {
                    userId: { type: 'string', format: 'uuid' },
                    role: { type: 'string', enum: ['admin', 'user'], example: 'admin' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Role updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string', example: 'Role updated successfully' }
                    }
                  }
                }
              }
            },
            400: { description: 'Missing userId/role or invalid role' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — not admin' },
            500: { description: 'Internal server error' }
          }
        }
      },

      '/api/admin/update-user-name': {
        post: {
          summary: "Update a user's display name (Admin)",
          description: 'Updates full_name of any user in the profiles table.',
          tags: ['Admin'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'fullName'],
                  properties: {
                    userId: { type: 'string', format: 'uuid' },
                    fullName: { type: 'string', example: 'John Doe' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Name updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Missing required fields' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden — not admin' },
            500: { description: 'Internal server error' }
          }
        }
      },

    }
  },
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)