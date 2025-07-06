import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoute from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoute from "./routes/userRoutes.js";

const app = express();
dotenv.config();

//dataBase config
connectDB();

//middleWare
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("combined"));

app.use("/api/product", productRoutes);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
