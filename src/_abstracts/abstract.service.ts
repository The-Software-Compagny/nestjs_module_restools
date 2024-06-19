import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request } from 'express';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// import { RequestContext } from 'nestjs-request-context';

export interface AbstractServiceContext {
  [key: string | number]: any

  moduleRef?: ModuleRef
  req?: Request & { user?: any }
  // eventEmitter?: EventEmitter2
}

@Injectable()
export abstract class AbstractService {
  protected moduleRef?: ModuleRef
  private readonly _req?: Request & { user?: any }
  // protected eventEmitter?: EventEmitter2

  protected logger: Logger

  protected constructor(context?: AbstractServiceContext) {
    this.moduleRef = context?.moduleRef;
    this._req = context?.req;
    this.logger = new Logger(this.serviceName);
  }

  protected get request():
    | (Request & {
      user?: any
    })
    | null {
    return this._req/*  || RequestContext.currentContext?.req */;
  }

  public get moduleName(): string {
    //TODO: change modulename from module ref ?
    if (!this.request) throw new Error('Request is not defined in ' + this.constructor.name);
    const moduleName = this.request.path.split('/').slice(1).shift();
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  }

  public get serviceName(): string {
    return this.constructor.name.replace(/Service$/, '');
  }
}
