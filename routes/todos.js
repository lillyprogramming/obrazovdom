import express from "express";
import {
  getTodos,
  getCalTodos,
  getParentTodos,
  addTodo,
  deleteTodo,
  updateTodo,
  updateCalTodo,
} from "../controllers/todo.js";

const router = express.Router();

router.get("/", getTodos);
router.post("/", addTodo);
router.get("/calendar", getCalTodos);
router.put("/calendar/:id", updateCalTodo);
router.get("/star", getParentTodos);
router.delete("/:id", deleteTodo);
router.put("/:id", updateTodo);

export default router;
