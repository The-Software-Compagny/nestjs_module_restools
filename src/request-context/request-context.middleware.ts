import { Injectable, NestMiddleware } from '@nestjs/common'
import { RequestContextStorage } from './request-context.storage'

@Injectable()
export class RequestContextMiddleware<Request = any, Response = any> implements NestMiddleware<Request, Response> {
  use(req: Request, res: Response, next: () => void): void {
    RequestContextStorage.storage.run(new RequestContextStorage(req, res), next)
  }
}
