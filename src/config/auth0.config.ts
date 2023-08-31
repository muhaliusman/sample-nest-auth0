import { registerAs } from '@nestjs/config';

const config = {
  issuer: process.env.AUTH0_ISSUER_URL,
  audience: process.env.AUTH0_AUDIENCE,
};

export default registerAs('auth0', () => config);
