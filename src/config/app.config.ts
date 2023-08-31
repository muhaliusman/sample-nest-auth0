import { registerAs } from '@nestjs/config';

const config = {
  port: process.env.PORT || 3000,
};

export default registerAs('app', () => config);
