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
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();

const org = "https://obrazovdom.com";
// const org = "http://localhost:3000";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());

const corsOptions = {
  origin: org,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
//credentials: true - много важно!
app.use(cookieParser());

const PORT = process.env.PORT || 8800;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { join } from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use path.join to resolve the correct path
    cb(null, join(__dirname, "../client/public/upload"));
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

app.listen(PORT, () => {
  console.log("Your server is running.");
});
