import express from "express";

const router = express.Router();

router.get("/", (_, res) => {
    res.send("Server is running!!");
});

export default router;
