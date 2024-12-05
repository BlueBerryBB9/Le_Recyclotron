import SUser from "../models/User.js";

export const handleError = (error: unknown, reply: { status: any; send?: ((arg0: { token: any; user: { id: number; email: string; first_name: string; last_name: string; roles: any; }; }) => any) | ((arg0: SUser) => any); }) => {
    console.error('Error:', error);
  
    if (isHttpError(error)) {
      return reply.status(error.statusCode).send({
        error: error.error,
        message: error.message
      });
    }
  
    if ((error as any).name === 'ValidationError') {
      return reply.status(400).send({
        error: 'Validation Error',
        details: (error as any).errors
      });
    }
  
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    };
  
  function isHttpError(error: any): error is { statusCode: number; error: string; message: string } {
    return error && typeof error.statusCode === 'number' && typeof error.error === 'string' && typeof error.message === 'string';
  }