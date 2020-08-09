import express, { Request, Response, NextFunction } from "express";
import core from "./core";

const app = express();
export default app;

app.use(express.json());

app.use(core);

app.use("/sse", core.sse());
