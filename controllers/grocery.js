import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getToBuys = (req, res) => {
  const token = req.cookies.accessToken;
  // const token =
  //   req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json("Not logged in!");
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    const q = `SELECT grocery.* FROM grocery 
    join connection e on e.user_id = grocery.grocery_userId
    WHERE e.family_id = ?;`;
    db.query(q, [userInfo.family_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const addToBuy = (req, res) => {
  const token = req.cookies.accessToken;
  // const token =
  //   req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = "INSERT INTO grocery (to_buy, grocery_userId) VALUES (?)";

    const values = [req.body.toBuy, userInfo.id];
    db.query(q, [values], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json("Grocery has been created");
    });
  });
};

export const deleteToBuy = (req, res) => {
  const token = req.cookies.accessToken;
  // const token =
  //   req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    const q = "DELETE FROM grocery WHERE id=?";

    db.query(q, [req.params.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Grocery has been deleted");
    });
  });
};
