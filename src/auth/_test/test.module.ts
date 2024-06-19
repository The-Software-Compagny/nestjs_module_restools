import { Module } from '@nestjs/common'
import { TestController } from './test.controller'
import { LocalStrategy } from './_strategies/local.strategy'
import { PassportModule } from '@nestjs/passport'
import { TestPublicController } from './test-public.controller'

@Module({
  imports: [PassportModule],
  controllers: [
    TestController,
    TestPublicController,
  ],
  providers: [
    LocalStrategy,
  ],
})
export class TestModule {
}
