import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class ResponseValidationInterceptor<T extends object>
implements NestInterceptor<any, T | T[]> {
  private readonly logger = new Logger();

  constructor (private readonly dto: new () => T) {}

  intercept (context: ExecutionContext, next: CallHandler): Observable<T | T[]> {
      return next.handle().pipe(
          switchMap(async (data) => {
              const isArray = Array.isArray(data);
              const transformedData = isArray
                  ? data.map((item) => plainToInstance(this.dto, instanceToPlain(item)))
                  : plainToInstance(this.dto, instanceToPlain(data));

              if (isArray && data.length === 0) {
                  return data;
              }

              const errors = isArray
                  ? await validate(transformedData[0])
                  : await validate(transformedData);

              if (errors.length > 0) {
                  errors.forEach((error) => {
                      if (error.children && error.children.length) {
                          error.children.forEach((childError) => {
                              Object.values(childError.constraints).forEach((constraint) => {
                                  this.logger.error(constraint);
                              });
                          });
                      } else {
                          Object.values(error.constraints).forEach((constraint) => {
                              this.logger.error(constraint);
                          });
                      }
                  });
              }

              return transformedData;
          }),
      );
  }
}
