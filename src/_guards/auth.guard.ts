import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard as AuthGuardInternal } from '@nestjs/passport'
import { Observable } from 'rxjs'
import { META_UNPROTECTED } from '../_decorators/public.decorator'

export function AuthGuard(type?: string | string[]) {
  const AuthGuard = AuthGuardInternal(Array.isArray(type) ? type : [type])

  @Injectable()
  class CustomAuthGuard extends AuthGuard implements CanActivate {
    public constructor(public readonly reflector: Reflector) {
      super()
    }

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const isUnprotected = this.reflector.getAllAndOverride<boolean>(META_UNPROTECTED, [
        context.getClass(),
        context.getHandler(),
      ])
      return isUnprotected || super.canActivate(context)
    }
  }

  return CustomAuthGuard
}
