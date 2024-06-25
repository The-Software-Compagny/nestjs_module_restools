import { Abstract, ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpExceptionBodyMessage, HttpStatus, Logger, Type } from '@nestjs/common'
import { Request, Response } from 'express'

let Error
(async () => {
  try {
    const mongooseModule = await import('mongoose')
    Error = mongooseModule.Error
  } catch (error) {
    Logger.debug(`Mongoose module not found`, MongooseValidationFilter.name)
  }
})()

type MongooseError = {
  message: string
  errors?: Record<string, { message: string; constraints?: Record<string, string>; property?: string }>
  path?: string
}

export function MongooseValidationFilter<T = Type<any> | Abstract<any>>(exceptions?: Array<Type<any> | Abstract<any>>) {
  @Catch(...exceptions)
  class MongooseValidationFilter implements ExceptionFilter {
    public catch(exception: T & MongooseError, host: ArgumentsHost) {
      Logger.debug(exception['message'], MongooseValidationFilter.name)

      const ctx = host.switchToHttp()
      const request = ctx.getRequest<Request>()
      const response = ctx.getResponse<Response>()

      const debug = {}
      if (process.env.NODE_ENV !== 'production' && request.query['debug']) {
        debug['_exception'] = exception
      }

      response.status(HttpStatus.NOT_ACCEPTABLE).json(
        HttpException.createBody(
          {
            statusCode: HttpStatus.NOT_ACCEPTABLE,
            message: exception['message'],
            validations: this.getValidationErrors(exception),
            ...debug,
          } as unknown as HttpExceptionBodyMessage,
          exception.constructor.name,
          HttpStatus.NOT_ACCEPTABLE,
        ),
      )
    }

    public getValidationErrors(err: MongooseError): Record<string, any> {
      const validations = {}

      if (err instanceof Error.ValidationError) {
        for (const key in err.errors) {
          if (err.errors[key]['constraints']) {
            Object.keys(err.errors[key]['constraints']).forEach((ckey) => {
              const property = err.errors[key]['property']
              validations[`${key}.${property}`] = err.errors[key]['constraints'][ckey]
            })

            continue
          }

          validations[key] = err.errors[key].message
        }
      } else if (err instanceof Error.CastError) {
        validations[err.path] = err.message
      }

      return validations
    }
  }

  return MongooseValidationFilter
}
