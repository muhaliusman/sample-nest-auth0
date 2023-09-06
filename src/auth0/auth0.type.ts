export type GetTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type Auth0User = {
  user_id: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  nickname: string;
  created_at: string;
  updated_at: string;
  password?: string;
};

export type Auth0AccessTokenDecoded = {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
};
