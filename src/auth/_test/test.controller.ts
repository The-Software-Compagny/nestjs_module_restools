import { Controller, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth.guard'

@Controller()
export class TestController {
  @Post('with-auth')
  @UseGuards(AuthGuard('local'))
  public withAuth(): object {
    return {
      statusCode: HttpStatus.OK,
    }
  }
}
