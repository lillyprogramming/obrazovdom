const app = express();
import express from "express";
import familyRoutes from "./routes/family.js";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import todoRoutes from "./routes/todos.js";
import groceryRoutes from "./routes/grocery.js";
import cors from "cors";
// import multer from "multer";
//multer е за качване и запазване на изображението в базата данни. Нужно е да се конфигурира и в бакенда
import cookieParser from "cookie-parser";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());

// const org = "https://obrazovdom.com";
const org = "http://localhost:3000";

app.use(cors({ credentials: true, origin: org}));
//credentials: true - много важно!
app.use(cookieParser());

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post('/posts', upload.single('image'), async (req, res) => {
//     try {
//         const { descr, img } = req.body;
        
//         // Assuming img is a base64-encoded string
//         const base64Image = img.split(';base64,').pop();

//         // Insert the data into your MySQL database
//         const sql = 'INSERT INTO images (description, base64data) VALUES (?, ?)';
//         connection.query(sql, [descr, base64Image], (err, result) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).send('Internal Server Error');
//             }
//             res.status(200).send('Image uploaded successfully');
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/comments", commentRoutes);

app.listen(8800, () => {
  console.log("Your server is running.");
});
