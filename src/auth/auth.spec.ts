import { Test } from '@nestjs/testing'
import request from 'supertest'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestModule } from './_test/test.module'

describe('auth', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = (
      await Test.createTestingModule({
        imports: [TestModule],
      }).compile()
    ).createNestApplication()
    await app.init()
  })

  it('check if guard block unauthenticated requests', async () => {
    await request(app.getHttpServer()).post('/with-auth').expect(HttpStatus.UNAUTHORIZED)
  })

  it('use correct test ids and check response', async () => {
    await request(app.getHttpServer())
      .post('/with-auth')
      .send({ username: 'test', password: 'test' })
      .expect(HttpStatus.CREATED)
  })

  it('use bad password and test if unauthorized response', async () => {
    await request(app.getHttpServer())
      .post('/with-auth')
      .send({
        username: 'test',
        password: 'bad password',
      })
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('test with bad guard and verify server error', async () => {
    await request(app.getHttpServer()).get('/public/public').expect(HttpStatus.OK)
  })

  it('test with bad guard and verify server error', async () => {
    await request(app.getHttpServer()).post('/public/private').expect(HttpStatus.UNAUTHORIZED)
  })

  it('test with bad guard and verify server error', async () => {
    await request(app.getHttpServer())
      .post('/public/private')
      .send({
        username: 'test',
        password: 'test',
      })
      .expect(HttpStatus.CREATED)
  })
})
