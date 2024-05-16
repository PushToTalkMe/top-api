import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from '../src/auth/dto/auth.dto';
import {
  USER_NOT_FOUND_ERROR,
  WRONG_PASSWORD_ERROR,
} from '../src/auth/auth.constants';

const loginDto: AuthDto = {
  login: 'aa@a.ru',
  password: '12345',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) = success', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        let token = body.access_token;
        expect(token).toBeDefined();
        return;
      });
  });

  it('/auth/login (POST) = fail, wrong password', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, password: '2' })
      .expect(401, {
        message: WRONG_PASSWORD_ERROR,
        error: 'Unauthorized',
        statusCode: 401,
      });
  });

  it('/auth/login (POST) = fail, wrong email', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, login: 'r@r.ru' })
      .expect(401, {
        statusCode: 401,
        error: 'Unauthorized',
        message: USER_NOT_FOUND_ERROR,
      });
  });

  afterAll(() => {
    disconnect();
  });
});
