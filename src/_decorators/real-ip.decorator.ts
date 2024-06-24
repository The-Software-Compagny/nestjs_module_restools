import { getClientIp } from 'request-ip'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

let getClientIp: (request: any) => string | null

(async () => {
  try {
    const requestIpModule = await import('request-ip')
    getClientIp = requestIpModule.getClientIp
  } catch (error) {
    getClientIp = (_: any): string | null => {
      console.error("Le package 'request-ip' n'est pas installé. Veuillez l'installer pour utiliser le décorateur RealIp.")
      return null
    }
  }
})()

export const RealIp = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return getClientIp(request)
})
