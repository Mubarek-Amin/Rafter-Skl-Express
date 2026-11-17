const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8080;
const client = new MongoClient(process.env.MONGODB_URI);
let db;


app.use(express.json());
//CORS Function which adds permission headers
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    next();
});

app.use((req,res,next)=>{
    const start = Date.now();
    res.on('finish', ()=>{
        const time = Date.now() - start;
        console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${time}ms`);
    });
    next();
})

app.get('/lessons',async(req,res)=>{
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
});



client.connect().then(()=>{
    db = client.db('afterschool');
    app.listen(PORT,() => console.log(`Server running on Port ${PORT}`));
});