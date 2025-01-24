import dotenv from 'dotenv';

dotenv.config(); 

const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

export { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, SECRET_KEY };