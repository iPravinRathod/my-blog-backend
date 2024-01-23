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

//middleware
app.use(async (req, res, next) => {
    const { authtoken } = req.headers;
    if (authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        } catch (error) {
            res.sendStatus(400);
        }
    }
    next();
});

//get route to fetch article
app.get("/api/articles/:name", async function (req, res) {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection("articles").findOne({ name });
    if (article) {
        const upvoteIds = article.upvoteIds || [];
        article.canUpvote = uid && !upvoteIds.includes(uid);
        res.json(article);
    } else {
        res.sendStatus(404);
    }
});

app.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
});

//put route for upvoting articles
app.put("/api/articles/:name/upvote", async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    const article = await db.collection("articles").findOne({ name });
    if (article) {
        const upvoteIds = article.upvoteIds || [];
        const canUpvote = uid && !upvoteIds.includes(uid);
        if (canUpvote) {
            await db.collection("articles").updateOne(
                { name },
                {
                    $inc: { upvotes: 1 },
                    $push: { upvoteIds: uid },
                }
            );
        }

        const updatedArticle = await db
            .collection("articles")
            .findOne({ name });

        res.json(updatedArticle);
    } else {
        res.send(`That article doesn\'t exist`);
    }
});

//route for commenting articles
app.post("/api/articles/:name/comments", async (req, res) => {
    const { text } = req.body;
    const { name } = req.params;
    const { email } = req.user;

    await db.collection("articles").updateOne(
        { name },
        {
            $push: { comments: { postedBy: email, text } },
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
