const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

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

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/images',(req,res)=>{
    res.status(404).json({error: 'Image not found' });
});

app.get('/lessons',async(req,res)=>{
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
});

app.post('/orders',async(req,res)=>{
    const order = req.body;
    if (!order.name || !order.phone || !Array.isArray(order.lessons)){
        return res.status(400).json({error: 'Name,Phone and Lessons are required'})
    };
    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({message: 'Order saved', id: result.insertedId});
});

app.get('/enrolment/:lessonid',async (req,res)=>{
    const lessonId = req.params.lessonid;
    const result = await db.collection('orders').aggregate([
        {$unwind: '$lessons'},
        {$match: {'lessons.lessonId':lessonId}},
        {$group: {_id: '$lessons.lessonId', enrolled: {$sum: '$lessons.spaces'}}}
    ]).toArray();
    
    const enrolled = result.length > 0 ? result[0].enrolled : 0;
    res.json({lessonId: lessonId, enrolled: enrolled});

});

app.put('/lessons/:id', async(req,res)=>{
    if (!ObjectId.isValid(req.params.id)){
        return res.status(400).json({error: 'Invalid lesson id'});
    }
    const result = await db.collection('lessons').updateOne(
    { _id: new ObjectId(req.params.id) }, { $set: req.body });
    
    if (result.matchedCount === 0){
        return res.status(404).json({error: 'Lesson not found'})
    }
    res.json({message: 'Lesson updated'});
});



client.connect().then(()=>{
    db = client.db('afterschool');
    app.listen(PORT,() => console.log(`Server running on Port ${PORT}`));
});