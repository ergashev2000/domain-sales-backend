import dotenv from 'dotenv';

dotenv.config(); 

const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const CLIENT_REDIRECT_URL = 'http://localhost:3000';
const CLIENT_ERROR_URL = 'http://localhost:3000';

const SWAGGER_URL = 'http://localhost:3000/api-docs';

const ALLOWED_REDIRECT_URIS = [
  'http://localhost:3000/login/success',
  'http://127.0.0.1:3000/login/success',
  'http://localhost:5500/login/success',
  'http://127.0.0.1:5500/login/success',
  CLIENT_REDIRECT_URL
].filter(Boolean);

function validateRedirectUri(uri) {
  return ALLOWED_REDIRECT_URIS.some(allowedUri => 
    uri.startsWith(allowedUri)
  );
}

export { 
    ACCESS_SECRET_KEY, 
    REFRESH_SECRET_KEY,
    SECRET_KEY, 
    GOOGLE_CLIENT_ID, 
    GOOGLE_CLIENT_SECRET,
    CLIENT_REDIRECT_URL,
    CLIENT_ERROR_URL,
    SWAGGER_URL,
    ALLOWED_REDIRECT_URIS,
    validateRedirectUri
};