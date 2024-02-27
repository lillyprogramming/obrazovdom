import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getFamily = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (!userInfo.is_parent)
      return res.status(404).json("You must be a parent to view this");
    if (err) return res.status(403).json("Token not valid!");
    const q =
      "SELECT  families.family_name, families.family_secret_code FROM families WHERE family_id = ?";
    db.query(q, [userInfo.family_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

//отделна функция от getFamily за улеснение при фронт-енда
export const getFamilyMembers = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    if (!userInfo.is_parent)
      return res.status(404).json("You must be a parent to view this");
    const q =
      "SELECT users.id, users.username, users.email, users.is_parent, users.user_color FROM users where users.id in ( select user_id from connection where family_id = ?) GROUP BY users.username order by id;";
    db.query(q, [userInfo.family_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const deleteFamMember = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    if (!userInfo.is_parent)
      return res.status(404).json("You must be a parent to view this");
    const q = "DELETE FROM users WHERE id=?";
    db.query(q, [req.params.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been deleted");
    });
  });
};

export const updateFamily = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    if (!userInfo.is_parent)
      return res.status(404).json("You must be a parent to view this");
    const q = "UPDATE users SET username = ? WHERE id = ?";
    db.query(q, [req.body.username, req.params.id], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json("User has been updated");
    });
  });
};

export const giveStardom = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    if (!userInfo.is_parent)
      return res.status(404).json("You must be a parent to view this");

    const q1 = "UPDATE users SET is_parent = 0 WHERE id = ?";
    const q2 = "UPDATE users SET is_parent = 1 WHERE id = ?";

    db.query(q1, [userInfo.id], (err1, data1) => {
      if (err1) {
        return res.status(500).json(err1);
      }

      db.query(q2, [req.params.id], (err2, data2) => {
        if (err2) {
          db.query(
            "UPDATE users SET is_parent = 1 WHERE id = ?",
            [userInfo.id],
            (rollbackErr) => {
              if (rollbackErr) {
                console.error("Rollback error:", rollbackErr);
                //изписва грешката в случай, че не се успее да сбъдне второто query
              }
              return res.status(500).json(err2);
            }
          );
        }

        return res.status(200).json("Users have been updated");
      });
    });
  });
};
