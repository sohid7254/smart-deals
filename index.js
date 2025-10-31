const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;

const uri = "mongodb+srv://smart_dealer:L1pgasMBfXm6HRnJ@cluster0.fdcjmvl.mongodb.net/?appName=Cluster0";


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

    app.get('/products', async(req, res)=>{
        const cursor = productCollection.find().sort({ price_min: -1 });
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/products/:id', async(req, res)=> {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const result = await productCollection.findOne(query)
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
