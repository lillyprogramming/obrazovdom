import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

export const getComments = (req, res) => {
  const q = `SELECT comments.*,e.username FROM comments 
        join users e on e.id = comments.comment_userId
        WHERE comments.postId = ? ORDER BY comments.created_date ASC`;

  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const token = req.cookies.accessToken;
  // const token =
  //   req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q =
      "INSERT INTO comments (descr,created_date, comment_userId, postId) VALUES (?)";

    //момент ми дава лесно да форматирам дати
    const values = [
      req.body.descr,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.postId,
    ];
    db.query(q, [values], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json("Comment has been created");
    });
  });
};

export const deleteComment = (req, res) => {
  const token = req.cookies.accessToken;
  // const token =
  //   req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    let q = "DELETE FROM comments WHERE id=? AND comment_userId = ?";
    let values = [req.params.id, userInfo.id];

    if (userInfo.is_parent) {
      values = [req.params.id, userInfo.family_id];
      q =
        "DELETE FROM comments WHERE comments.id = ? AND comment_userId IN (SELECT connection.user_id FROM connection WHERE connection.family_id = ?  )";
    }

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Comment has been deleted");
      return res.status(403).json("You can delete only your comment.");
    });
  });
};
