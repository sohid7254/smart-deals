const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require('cors')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;
console.log(process.env)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdcjmvl.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
   try{
    await client.connect();

    const db = client.db('smart_db')
    const productCollection = db.collection('products');
    const bidsCollection = db.collection('bids')
    const userCollection = db.collection('users')

    // users api
    app.post('/users', async(req, res) => {
        const newUser = req.body;

        const email = req.body.email;
        const query = {email: email}
        const existingUser = await userCollection.findOne(query)

        if(existingUser){
            res.send('user already loged in do not need to sign in')
        }else {
            const result = await userCollection.insertOne(newUser);
        res.send(result)
        }
        
    })
    // products api
    app.get('/products', async(req, res)=>{
        // const projectsField = {_id: 0 , title: 1}
        // const cursor = productCollection.find().sort({ price_min: -1 }).skip(5).limit(5).project(projectsField);
        console.log(req.query)
        const email = req.query.email;
        const query = {}
        if(email) {
            query.email = email;
        }

        const cursor = productCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/leatest-products', async(req, res) => {
        const cursor = productCollection.find().sort({created_at: -1}).limit(6);
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/products/:id', async(req, res)=> {
        const id = req.params.id;
        
        // const query = { _id: new ObjectId(id)}
        const result = await productCollection.findOne({_id:id})
        
        res.send(result)
    })

    app.get('/products/bids/:productId', async(req, res) => {
        const productId = req.params.productId;
        const query = {product: productId};
        const cursor = bidsCollection.find(query).sort({bid_price: -1})
        const result = await cursor.toArray();
        res.send(result)
    })


    app.post('/products', async (req,res) => {
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct)
        res.send(result)

    })
    app.patch('/products/:id', async(req, res)=>{
        const id = req.params.id;
        const updatedProducts = req.body;
        const query = { _id: new ObjectId(id)};
        const update = {
            $set: {
                name: updatedProducts.name,
                price: updatedProducts.price
            }
        }
        const result = await productCollection.updateOne(query, update)
        res.send(result)
    })

    app.delete('/products/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productCollection.deleteOne(query)
        res.send(result)
        

    })
    // bids related api
    app.get('/bids', async(req, res) => {
        
        const query = {}
        if(query.email){
            query.buyer_email = email;
        }
        const cursor = bidsCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })
    
    app.post('/bids', async(req, res) => {
        const newBid = req.body;
        
        const result = await bidsCollection.insertOne(newBid);
        res.send(result)

    })
    app.get("/bids/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bidsCollection.findOne(query);
        res.send(result);
    });
    app.delete("/bids/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await bidsCollection.deleteOne(query);
         res.send(result);
    });



    await client.db("admin").command({ping: 1})
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
   }
   finally{

   }
}

run().catch(console.dir)

// midlewear
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Smart Deals running here')
})

app.listen(port, () => {
    console.log(`Smart Deals Runs Througn this port ${port}`)
})
