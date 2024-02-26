const app = express();
import express from "express";
import familyRoutes from "./routes/family.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import todoRoutes from "./routes/todos.js";
import groceryRoutes from "./routes/grocery.js";
import cors from "cors";
import multer from "multer";
//multer е за качване и запазване на изображението в базата данни. Нужно е да се конфигурира и в бакенда
import cookieParser from "cookie-parser";

const org = "https://obrazovdom.com";
// const org = "http://localhost:3000";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(cors({ credentials: true, origin:  org  }));
//credentials: true - много важно!
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/comments", commentRoutes);

app.listen(8800, () => {
  console.log("Your server is running.");
});
