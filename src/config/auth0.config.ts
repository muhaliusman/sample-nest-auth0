import { registerAs } from '@nestjs/config';

const config = {
  issuer: process.env.AUTH0_ISSUER_URL,
  audience: process.env.AUTH0_AUDIENCE,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
};

export default registerAs('auth0', () => config);
