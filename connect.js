import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql.createPool({
  connectionLimit: 10,
  acquireTimeout: 10000,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  insecureAuth: true,
});


//променливите се намират в .env за повече сигурност
