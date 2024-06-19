import { CanActivate, ExecutionContext, Injectable, Type, mixin } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard as AuthGuardInternal, IAuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'
import { META_UNPROTECTED } from './public.decorator'
import { memoize } from '../_utils/memoize.util'

export const AuthGuard: (type?: string | string[]) => Type<IAuthGuard> = memoize(createAuthGuard)

function createAuthGuard(type?: string | string[]): Type<IAuthGuard> {
  const AuthGuard = AuthGuardInternal(Array.isArray(type) ? type : [type])

  @Injectable()
  class MixinAuthGuard extends AuthGuard implements CanActivate {
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

  const guard = mixin(MixinAuthGuard)
  return guard as Type<IAuthGuard>
}
