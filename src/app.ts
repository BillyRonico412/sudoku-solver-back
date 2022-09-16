import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { SudokuInfoType, sudokuInfoYup } from "./interface";
import { solve } from "./logic/logic";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.URL_FRONT,
    })
);

app.use(morgan("dev"));
app.use(bodyParser.json());

app.post("/", async (req, res) => {
    const body = req.body;
    if (!(await sudokuInfoYup.isValid(body))) {
        return res.status(400).end();
    }
    const sudokuInfo = body as SudokuInfoType;
    const satRes = await solve(sudokuInfo);
    if (satRes === null) {
        return res.status(400).end()
    }
    return res.status(200).json(satRes)
});

app.listen(process.env.PORT, () => {
    console.log(`Listen to ${process.env.URL_BACK}:${process.env.PORT}`);
});
