const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middle ware 
app.use(cors());
app.use(express.json());


// connect the database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwoya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db("water_delivery");
        const serviceCollection = database.collection("service");

        // GET All service API 
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })


        // POST API create and insert
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await serviceCollection.insertOne(service);
            // console.log(result);
            res.json(result);

        })


    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running My Water delivery CRUD Server');
})

app.listen(port, () => {
    console.log('Running water delivery server on port', port);
})