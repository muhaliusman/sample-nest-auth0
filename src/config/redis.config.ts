import { registerAs } from '@nestjs/config';

const config = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

export default registerAs('redis', () => config);
