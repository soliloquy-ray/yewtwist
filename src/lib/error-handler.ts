/* eslint-disable @typescript-eslint/no-explicit-any */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleCastError = (err: any) => {
  let message = `Invalid ${err.path}: ${err.value}`;
  console.error(JSON.stringify(message));
  if (err.value && typeof err.value === 'object') {
    message = `Invalid format for ${err.path}. Expected string, got object`;
  }
  return new AppError(message, 400);
};

export const handleMongooseError = (err: any) => {
  if (err.name === 'CastError') return handleCastError(err);
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return new AppError(`Duplicate field value: ${value}`, 400);
  }
  return new AppError('Something went wrong', 500);
};
