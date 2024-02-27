import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const getTodos = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json("Not logged in!");
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = `SELECT todo.*
    FROM todo
    JOIN connection ON todo.todo_userId = connection.user_id
    WHERE (
       todo.todo_userId = ? AND (todo.task_status = 'unfinished' OR todo.task_status = 'taken')
    )
    OR (
       connection.family_id = ?
       AND (
          (todo.is_fam_task = 1 OR todo.is_group_task = 1)
       )
    );`;

    db.query(q, [userInfo.id, userInfo.family_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const getCalTodos = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json("Not logged in!");
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    let values = [userInfo.id, userInfo.family_id];

    let q = `SELECT todo.*
    FROM todo
    JOIN connection ON todo.todo_userId = connection.user_id
    WHERE (todo.todo_userId = ? AND (todo.task_status = 'unfinished' OR todo.task_status = 'taken')) OR (todo.is_group_task = 1 AND connection.family_id = ?) AND todo.start_date IS NOT NULL`;

    if (userInfo.is_parent) {
      q = `SELECT todo.*, users.user_color, users.username FROM todo 
        JOIN users on users.id = todo.todo_userId AND (todo.task_status = 'unfinished' OR todo.task_status = 'taken') AND todo.start_date IS NOT NULL where todo_userId in 
        ( select connection.user_id from connection where connection.family_id = ?)  
        group by id`;
      values.shift();
    }

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const getParentTodos = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json("Not logged in!");
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    if (!userInfo.is_parent)
      return res.status(404).json("You must be a parent to view this");

    let q = `SELECT todo.*, users.user_color, users.username FROM todo 
    JOIN users on users.id = todo.todo_userId
    where (todo_userId in ( select connection.user_id from connection where connection.family_id = ?) AND (todo.task_status = 'done' OR todo.task_status = 'taken'))
    group by id;`;

    db.query(q, [userInfo.family_id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

//имам три различни get функции, се нуждая от различни данни за различните страници

export const addTodo = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    let values = [
      req.body.task,
      userInfo.id,
      req.body.is_fam_task,
      req.body.start_date,
      req.body.end_date,
      req.body.is_group_task,
      "unfinished",
    ];
    let q =
      "INSERT INTO todo (task, todo_userId, is_fam_task, start_date, end_date, is_group_task, task_status) VALUES (?)";

    db.query(q, [values], (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json("Task has been created");
    });
  });
};

export const deleteTodo = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    const q = "DELETE FROM todo WHERE id=?";
    db.query(q, [req.params.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Task has been deleted");
    });
  });
};

export const updateTodo = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = `UPDATE todo 
      SET 
        todo_userId = ?, 
        is_fam_task = ?, 
        task_status = CASE 
                        WHEN task_status = 'taken' THEN 'done' 
                        ELSE 'taken' 
                      END
      WHERE id = ?;`;

    //в случай че заданието е прието вече, при изпълнението на тази функция, то става "готово"
    db.query(q, [userInfo.id, 0, req.params.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Task has been updated");
    });
  });
};

export const updateCalTodo = (req, res) => {
  // const token = req.cookies.accessToken;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");
    const q = "UPDATE todo SET start_date = ?, end_date = ? WHERE id = ?";
    db.query(
      q,
      [req.body.start_date, req.body.end_date, req.params.id],
      (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Task has been updated");
      }
    );
  });
};
