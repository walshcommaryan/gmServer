import express, { Application }  from "express"
import v1BakeryRouter from "./v1/routes/routes";

const app: Application = express();
const PORT: number = parseInt(process.env.PORT as string, 10) || 2000;

app.use(express.json());

app.use("/api/v1/bakery", v1BakeryRouter);

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});