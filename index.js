const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Database
const uri = `mongodb+srv://${process.env.DB__USER}:${process.env.DB__PASS}@cluster0.ddl1jzo.mongodb.net/?retryWrites=true&w=majority`;

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
    // database and collection
    const productCollection = client
      .db("brandShopDB")
      .collection("productCollection");
    const brandCollection = client
      .db("brandShopDB")
      .collection("brandCollection");
    const cartCollection = client
      .db("brandShopDB")
      .collection("cartCollection");

    /// API for Brands
    // get api - for all the brands
    app.get("/brands", async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // post api - for a brand
    app.post("/brands", async (req, res) => {
      const receivedBrandInfo = req.body;
      const result = await brandCollection.insertOne(receivedBrandInfo);
      res.send(result);
    });

    // API for Products
    // get api - for all the products
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get api - for a product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // post api - for a single product
    app.post("/products", async (req, res) => {
      const receivedProductInfo = req.body;
      const result = await productCollection.insertOne(receivedProductInfo);
      res.send(result);
    });

    // post api - for a product id for the cart
    app.post("/carts", async (req, res) => {
      const receivedProductId = req.body;
      const idAsResult = await cartCollection.insertOne(receivedProductId);
      res.send(idAsResult);
    });

    // put api - for a single product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateRequest = req.body;
      const updatedInfo = {
        $set: {
          name: updateRequest.name,
          brandName: updateRequest.brandName,
          image: updateRequest.image,
          price: updateRequest.price,
          rating: updateRequest.rating,
          type: updateRequest.type,
          shortDescription: updateRequest.shortDescription,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedInfo,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
