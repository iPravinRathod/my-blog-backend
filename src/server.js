import fs from "fs";
import admin from "firebase-admin";
import express from "express";
import { db, connectToDb } from "./db.js";

const credentials = JSON.parse(fs.readFileSync("./credentials.json"));
admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

//creates express app
const app = express();
const port = 8000;

// for parsing application/json
app.use(express.json());

//get route to fetch article
app.get("/api/articles/:name", async function (req, res) {
    const { name } = req.params;
    const article = await db.collection("articles").findOne({ name });
    if (article) {
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

//put route for upvoting articles
app.put("/api/articles/:name/upvote", async (req, res) => {
    const { name } = req.params;

    await db.collection("articles").updateOne(
        { name },
        {
            $inc: { upvotes: 1 },
        }
    );
    const article = await db.collection("articles").findOne({ name });
    if (article) {
        res.json(article);
    } else {
        res.send(`That article doesn\'t exist`);
    }
});

//route for commenting articles
app.post("/api/articles/:name/comments", async (req, res) => {
    const { postedBy, text } = req.body;
    const { name } = req.params;

    await db.collection("articles").updateOne(
        { name },
        {
            $push: { comments: { postedBy, text } },
        }
    );
    const article = await db.collection("articles").findOne({ name });
    if (article) {
        res.json(article);
    } else {
        res.send(`That article doesn\'t exist`);
    }
});

connectToDb(() => {
    console.log("successfully connected to database");
    //listening app on port
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
});
