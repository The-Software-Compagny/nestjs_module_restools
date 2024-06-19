import { Controller, Get } from '@nestjs/common'
import { TestService } from './test.service'

@Controller()
export class TestController {
  public constructor(private readonly testService: TestService) { }

  @Get()
  public test(): object {
    return {
      initializationCount: TestService.initializationCount,
      requestId: this.testService.getRequestId(),
    }
  }
}
