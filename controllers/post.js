import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

export const getPosts = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json("Not logged in!");
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    const q = `SELECT posts.*,b.username,b.user_color FROM posts 
    join users b on b.id = posts.userId
        join connection e on e.user_id = posts.userId
        WHERE e.family_id = ? ORDER BY posts.created_date DESC`;
    db.query(q, [userInfo.family_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = "INSERT INTO posts (descr, img, userId, created_date) VALUES (?)";

    const values = [
      req.body.descr,
      req.body.img,
      userInfo.id,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
    ];
    db.query(q, [values], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json("Post has been created");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    let q = "DELETE FROM posts WHERE id=? AND userId = ?";
    let values = [req.params.id, userInfo.id];

    //администраторите могат да изтриват публикациите на всички
    if (userInfo.is_parent) {
      values = [req.params.id, userInfo.family_id];
      q =
        "DELETE FROM posts WHERE posts.id = ? AND userId IN (SELECT connection.user_id FROM connection WHERE connection.family_id = ?  )";
    }

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Post has been deleted");
      return res.status(404).json("You can delete only your post.");
    });
  });
};
