import { applyDecorators, SetMetadata } from '@nestjs/common'

export const META_UNPROTECTED = 'unprotected'

export const Public = () => applyDecorators(SetMetadata(META_UNPROTECTED, true))
