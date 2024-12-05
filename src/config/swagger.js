export const swaggerConfig = {
    swagger: {
      info: {
        title: 'API Documentation',
        description: 'API documentation with authentication and authorization',
        version: '1.0.0'
      },
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  };