import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError, EntityNotFoundError, InvalidCredentialsError, TokenExpiredError, DuplicateEmailError, DuplicateDocumentError, UnauthorizedAccessError } from '../../domain/errors';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.UNPROCESSABLE_ENTITY;

    if (exception instanceof EntityNotFoundError) status = HttpStatus.NOT_FOUND;
    else if (exception instanceof InvalidCredentialsError) status = HttpStatus.UNAUTHORIZED;
    else if (exception instanceof TokenExpiredError) status = HttpStatus.UNAUTHORIZED;
    else if (exception instanceof UnauthorizedAccessError) status = HttpStatus.FORBIDDEN;
    else if (exception instanceof DuplicateEmailError) status = HttpStatus.CONFLICT;
    else if (exception instanceof DuplicateDocumentError) status = HttpStatus.CONFLICT;

    response.status(status).json({
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
