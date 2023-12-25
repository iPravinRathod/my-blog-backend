import express from "express";
//creates express app
const app = express();
const port = 8000;

console.log("hey");

app.use(express.json()); // for parsing application/json

//this is fake data
const articlesInfo = [
    { name: "learn-react", upvotes: 0, comments: [] },
    { name: "learn-node", upvotes: 0, comments: [] },
    { name: "learn-mongodb", upvotes: 0, comments: [] },
];

//route for upvoting articles
app.put("/api/articles/:name/upvote", (req, res) => {
    const { name } = req.params;
    console.log(name);
    const article = articlesInfo.find((article) => article.name === name);
    if (article) {
        article.upvotes += 1;
        res.send(
            `The ${article.name} article has ${article.upvotes} upvotes now`
        );
    } else {
        res.send(`That article doesn\'t exist`);
    }
});

//route for commenting articles
app.post("/api/articles/:name/comments", (req, res) => {
    const { postedBy, text } = req.body;
    const { name } = req.params;
    console.log(name);
    const article = articlesInfo.find((article) => article.name === name);
    if (article) {
        article.comments.push({ postedBy, text });
        res.send(article.comments);
    } else {
        res.send(`That article doesn\'t exist`);
    }
});

//listening app on port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
