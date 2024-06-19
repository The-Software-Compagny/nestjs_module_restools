import { Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth.guard'
import { Public } from '../public.decorator'

@Controller('public')
@UseGuards(AuthGuard('local'))
export class TestPublicController {
  @Public()
  @Get('public')
  public publicInpublicWay(): object {
    return {
      statusCode: HttpStatus.OK,
    }
  }

  @Post('private')
  public privateInPublicWay(): object {
    return {
      statusCode: HttpStatus.OK,
    }
  }
}
