import { ArgumentMetadata, BadRequestException, Injectable, Logger, PipeTransform } from '@nestjs/common'

let ObjectId: any
(async () => {
  try {
    const mongooseModule = await import('mongoose')
    ObjectId = mongooseModule.Types.ObjectId
  } catch (error) {
    Logger.debug(`Mongoose module not found`, ObjectIdValidationPipe.name)
  }
})()

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform<string, typeof ObjectId> {
  public transform(value: string | typeof ObjectId, _metadata: ArgumentMetadata): typeof ObjectId {
    if (!ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ObjectId <${value}>`)
    }
    return new ObjectId(value)
  }
}
