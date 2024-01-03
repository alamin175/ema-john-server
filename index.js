const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { json } = require("express");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("data are coming perfectly");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ids2q5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const productCollection = client.db("ema-john").collection("john-data");

    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      // console.log(page, size);
      const query = {};
      const cursor = productCollection.find(query);
      let products;
      if (page || size) {
        // 0---> skip 0 get : 0-10(10);
        // 1---> skip 1*10 get : 11-20(10);
        // 2---> skip 2*10 get : 21-30(10);
        products = await cursor.skip(size * page).limit(size).toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });

    app.post("/productsbyKeys", async (req, res) => {
      const keys = req.body;
      const ids = keys.map(id => new ObjectId(id))
      const query = { _id: { $in: ids } }
      const cursor = productCollection.find(query)
      const products = await cursor.toArray();
      // console.log(keys);
      res.send(products)
    })

    app.get("/productscount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening port is ", port);
});
