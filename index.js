const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// this is midlewier
app.use(cors());
app.use(express.json());

// This code from mongodb database start
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o3ybbvx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    console.log("Database connected");

    /*-----------------------------------------------------------------------------
                                   ALL COLLECTION CODE
      ----------------------------------------------------------------------------*/
    const userCollection = client.db("store-admin").collection("users");
    const productCollection = client.db("store-admin").collection("products");
    const orderCollection = client.db("store-admin").collection("orders");
    const reviewCollection = client.db("store-admin").collection("reviews");
    const paymentCollection = client.db("store-admin").collection("payments");
    const contactCollection = client.db("store-admin").collection("contacts");
    const subcribeCollection = client.db("store-admin").collection("subcribes");

    /*-----------------------------------------------------------------------------
                       CREATE USER AND STORE IN DATABASE CODE
      ----------------------------------------------------------------------------*/
    //get all user
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // this is for user collection
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      res.send(result);
    });

    // this is make admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // get all admin and super admin
    app.get("/alladmin", async (req, res) => {
      const query = { role: "admin" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    //get specific user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    // limit dashboard access
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // get all products from database
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });
    //find one using id from database
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // add a new products
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // for all order
    app.get("/orders", async (req, res) => {
      const query = {};
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    // add a new order
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // get all the oder form database using email query
    app.get("/order", async (req, res) => {
      const email = req.query.user;
      const query = { user: email };
      const orders = await orderCollection.find(query).toArray();
      return res.send(orders);
    });
    // this is for payment
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
    });

    //update quantity after a order
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updatedDoc = {
        $set: {
          available_quantity: updatedQuantity.newQuantity,
        },
      };
      const result = await productCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // this is for delete order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });
    //this is for delete tool
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(filter);
      res.send(result);
    });

    //this is for payment
    app.post("/payment", async (req, res) => {
      const paymentData = req.body;
      const result = await paymentCollection.insertOne(paymentData);
      res.send(result);
    });
    //get id based payment
    app.get("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await paymentCollection.findOne(filter);
      res.send(result);
    });
    //get based on email
    app.get("/payments/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { userEmail: email };
      const productPayment = await paymentCollection.find(filter).toArray();
      const result = productPayment.reverse();
      res.send(result);
    });
    //this is for review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });
    //get all reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find().toArray();
      const reverseReviews = reviews.reverse();
      res.send(reverseReviews);
    });
    //manage reviews
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(filter);
      res.send(result);
    });

    //this is for review
    app.post("/contact", async (req, res) => {
      const contactData = req.body;
      const result = await contactCollection.insertOne(contactData);
      res.send(result);
    });

    //get all contact
    app.get("/contact", async (req, res) => {
      const result = await contactCollection.find().toArray();
      res.send(result);
    });
    //this is for review
    app.post("/subcribe", async (req, res) => {
      const subcribeData = req.body;
      const result = await subcribeCollection.insertOne(subcribeData);
      res.send(result);
    });

    //get all contact
    app.get("/subcribe", async (req, res) => {
      const result = await subcribeCollection.find().toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
// This code from mongodb database end

// basic setup code
app.get("/", (req, res) => {
  res.send("Hello from Wholesale store!");
});

app.listen(port, () => {
  console.log(`Wholesale store listening on port ${port}`);
});
