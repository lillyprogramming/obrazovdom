import { db } from "../connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { serialize } from "cookie";
dotenv.config();

export const register = (req, res) => {
  const q = `SELECT * FROM users WHERE email = ?`;

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    //Паролата се солира за по-добра сигурност
    const {
      username,
      email,
      is_parent,
      family_name,
      family_secret_code,
      user_color,
    } = req.body;

    if (!family_name && !family_secret_code) {
      return res
        .status(400)
        .json("Either family_name or family_secret_code must be provided.");
    }
    if (family_name) {
      //функция за генериране на случаен домакински ключ
      const generateSecretCode = () => {
        const charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?/";
        let secret_code = `family?${family_name}?user?${
          email.split("@")[0]
        }code?`;
        for (let i = 0; i < 5; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          secret_code += charset[randomIndex];
        }
        return secret_code;
      };

      const familyQuery = `INSERT INTO families (family_name, family_secret_code) VALUES (?, ?)`;
      db.query(
        familyQuery,
        [family_name, generateSecretCode()],
        (err, familyData) => {
          if (err) return res.status(500).json(err);
          const familyId = familyData.insertId;
          insertUserAndConnection(
            username,
            email,
            hashedPassword,
            is_parent,
            familyId,
            user_color
          );
        }
      );
    } else {
      const secretCodeQuery = `SELECT * FROM families WHERE family_secret_code = ?`;
      db.query(secretCodeQuery, [family_secret_code], (err, familyData) => {
        if (err) return res.status(500).json(err);
        if (!familyData.length)
          return res
            .status(404)
            .json("Family not found with the provided secret code.");

        const familyId = familyData[0].family_id;
        insertUserAndConnection(
          username,
          email,
          hashedPassword,
          is_parent,
          familyId,
          user_color
        );
      });
    }
  });
  function insertUserAndConnection(
    username,
    email,
    hashedPassword,
    is_parent,
    familyId,
    user_color
  ) {
    const userQuery = `INSERT INTO users (username, email, password, is_parent, user_color) VALUES (?, ?, ?, ?, ?)`;
    const userValues = [username, email, hashedPassword, is_parent, user_color];

    db.query(userQuery, userValues, (err, userData) => {
      if (err) return res.status(500).json(err);

      const userId = userData.insertId;

      const connectionQuery = `INSERT INTO connection (user_id, family_id) VALUES (?, ?)`;
      const connectionValues = [userId, familyId];

      db.query(connectionQuery, connectionValues, (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User and connection have been created.");
      });
    });
  }
};

export const logIn = (req, res) => {
  const q = `SELECT users.*, e.family_id FROM users 
  join connection e on e.user_id = users.id
  where users.email = ?`;

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found");

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!checkPassword) return res.status(400).json("Wrong password for email");

    //стойностите, които са ми най-важни, ги пазя в httpOnly бисквита
    const payload = {
      id: data[0].id,
      family_id: data[0].family_id,
      is_parent: data[0].is_parent,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY);

    const { password, ...others } = data[0];

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      // path: "/api",
    };
    const serializedToken = serialize("accessToken", token, cookieOptions);
      console.log("Setting accessToken cookie...");

    res.setHeader("Set-Cookie", serializedToken);
    res.status(200).json(others);
  });
};

export const logOut = (req, res) => {
  // Clear the access token cookie
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0), // Set the expiration date in the past to delete the cookie
    partitioned: true,
  };

  const serializedToken = serialize("accessToken", "", cookieOptions);

  res.setHeader("Set-Cookie", serializedToken);
  res.status(200).json("Logout successful");
};
