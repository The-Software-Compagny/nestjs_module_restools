import { BadRequestException, HttpStatus, ValidationPipe, ValidationError, Logger, Injectable, Scope, Inject } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'

interface ValidationRecursive {
  [key: string]: string
}

@Injectable({ scope: Scope.REQUEST })
export class DtoValidationPipe extends ValidationPipe {
  public constructor(@Inject(REQUEST) protected readonly request: Request) {
    super({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        let validations: ValidationRecursive = {}
        for (const error of errors) {
          validations = { ...validations, ...this.validationRecursive(error) }
        }

        const debug = {}
        const message = `Erreur de validation : ${Object.keys(validations).join(', ')}`.trim()
        Logger.debug(`${message} (${JSON.stringify(validations)})`, DtoValidationPipe.name)

        if (process.env.NODE_ENV !== 'production' && request.query['debug']) {
          debug['_errors'] = errors.map((error) => {
            delete error['target']
            return error
          })
        }

        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message,
          validations,
          ...debug,
        })
      },
    })
  }

  public validationRecursive(error: ValidationError, prefix = ''): ValidationRecursive {
    let validations = {}
    if (error.constraints) {
      validations[`${prefix + error.property}`] = Object.values(error.constraints)[0]
    }
    if (error.children.length > 0) {
      for (const errorChild of error.children) {
        if (errorChild.constraints) {
          validations[`${prefix + error.property}.${errorChild.property}`] = Object.values(errorChild.constraints)[0]
        }
        if (errorChild.children.length > 0) {
          validations = { ...validations, ...this.validationRecursive(errorChild, `${prefix + error.property}.${errorChild.property}.`) }
        }
      }
    }
    return validations
  }
}
