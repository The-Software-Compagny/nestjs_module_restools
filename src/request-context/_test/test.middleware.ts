import { Injectable, NestMiddleware } from '@nestjs/common'
import { TestRequest } from './test-context'

@Injectable()
export class TestMiddleware implements NestMiddleware<TestRequest> {
  private count = 0

  public use(req: TestRequest, res: any, next: () => void): void {
    req.requestId = this.count
    this.count++
    next()
  }
}
