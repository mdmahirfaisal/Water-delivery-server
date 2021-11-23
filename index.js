const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


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
        const orderCollection = database.collection("order");

        // GET All service API 
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })


        // GET single service API
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            console.log('Load service', id);
            res.send(service)
        })



        // POST API create and insert
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        });


        // add order
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            console.log('newOrder', newOrder);
            orderCollection.insertOne(newOrder)
                .then(result => {
                    res.send(result.insertedCount > 0);
                })
        })

        // GET order 
        app.get('/order', async (req, res) => {
            const orderCursor = orderCollection.find({});
            const orders = await orderCursor.toArray();
            res.send(orders);
        })

        // UPDATE a single Order
        app.put('/order/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrders = req.body;
            const filter = { _Id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedOrders.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            res.json(result);
        })


        // DELETE Order user
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result)
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