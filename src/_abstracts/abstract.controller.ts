import { Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'

export interface AbstractControllerContext {
  [key: string | number]: any

  moduleRef?: ModuleRef
}

export abstract class AbstractController {
  protected moduleRef?: ModuleRef

  protected logger: Logger

  public constructor(context?: AbstractControllerContext) {
    this.logger = new Logger(this.controllerName)
    this.moduleRef = context?.moduleRef
  }

  public get controllerName(): string {
    return this.constructor.name.replace(/Controller$/, '')
  }
}
