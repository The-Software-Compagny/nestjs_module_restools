import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { IVerifyOptions, Strategy } from 'passport-local'
import { Request } from 'express'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  public constructor() {
    super({
      passReqToCallback: true,
    })
  }

  public async validate(
    _: Request,
    username: string,
    password: string,
    done: (error: any, user?: any, options?: IVerifyOptions) => void,
  ): Promise<void> {
    if (username !== 'test' || password !== 'test') {
      return done(new UnauthorizedException(), false)
    }
    return done(null, { username })
  }
}
