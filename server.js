const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8080;
const client = new MongoClient(process.env.MONGODB_URI);
let db;

app.use(express.json());
app.get('/lessons',async(req,res)=>{
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
});

client.connect().then(()=>{
    db = client.db('afterschool');
    app.listen(PORT,() => console.log('Server running on Port ${PORT}'));
});