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
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import cookieParser from "cookie-parser";

const s3 = new S3Client();

// const org = "https://obrazovdom.com";
const org = "http://localhost:3000";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json());
app.use(cors({ credentials: true, origin:  org  }));
//credentials: true - много важно!
app.use(cookieParser());

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { originalname, buffer } = req.file;



  const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
      AllowedOrigins: ['http://localhost:3000'], // Change this to your specific frontend domain
      ExposeHeaders: [],
    },
  ],
};
  const params = {
    Bucket: 'cyclic-tiny-ruby-bunny-wear-eu-central-1',
    Key: `${Date.now()}-${originalname}`,
    Body: buffer,
    ContentType: 'image/jpeg',
      CORSConfiguration: corsConfiguration,
  };

s3.putBucketCors(params, (err, data) => {
  if (err) {
    console.error('Error updating CORS configuration:', err);
  } else {
    console.log('CORS configuration updated successfully:', data);
  }
});
  
  try {
    // Use AWS SDK v3 to upload to S3
    const command = new PutObjectCommand(params);
    await s3.send(command);

    console.log(`https://${params.Bucket}.s3.amazonaws.com/${params.Key}`);

    // Save image metadata to the database (posts table)
    // await pool.execute('INSERT INTO posts (filename, url) VALUES (?, ?)', [
    //   params.Key,
    //   `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`,
    // ]);

    // res.json({ message: `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`});
      res.status(200).json(`https://${params.Bucket}.s3.amazonaws.com/${params.Key}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
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
