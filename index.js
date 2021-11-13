// Requiring Important packages
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

//config dotenv
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Connect server with database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eyyvk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    // Create Database and Collections
    const database = client.db("Dronegenix");
    const droneLists = database.collection("drone-list");
    const reviews = database.collection("reviews");
    const orders = database.collection("orders");
    const users = database.collection("users");

    // Getting Drone list
    app.get("/dronelist", async (req, res) => {
      const cursor = droneLists.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // P|ost new drone in Drone list
    app.post("/dronelist", async (req, res) => {
      const info = req.body;
      const result = await droneLists.insertOne(info);
      res.json(result);
    });

    // Delete Drones from drone list
    app.delete("/dronelist/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await droneLists.deleteOne(query);
      res.json(result);
    });

    // Getting review list
    app.get("/reviews", async (req, res) => {
      const cursor = reviews.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // post a review
    app.post("/reviews", async (req, res) => {
      const info = req.body;
      const result = await reviews.insertOne(info);
      res.json(result);
    });

    // specific product
    app.get("/drone/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await droneLists.findOne(query);
      res.json(result);
    });

    // Post order
    app.post("/orders", async (req, res) => {
      const info = req.body;
      const result = await orders.insertOne(info);
      res.json(result);
    });

    // Getting Order list
    app.get("/orders", async (req, res) => {
      const cursor = orders.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // specific users product
    app.get("/order/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const findData = orders.find(query);
      const result = await findData.toArray();
      res.json(result);
    });

    // Delete Order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orders.deleteOne(query);
      res.json(result);
    });

    // Order status update
    app.put("/order/:id", async (req, res) => {
      let id = req.params.id;
      const body = req.body;
      const options = { upsert: true };
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: body.status,
        },
      };
      const result = await orders.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Add a user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.json(result);
    });

    // Get  admin user info
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await users.findOne(query);
      let isAdmin = false;
      if (user.role) {
        if (user.role === "admin") {
          isAdmin = true;
        } else {
          isAdmin = false;
        }
      }
      res.json({ admin: isAdmin });
    });

    // Upsert user for google sign in
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await users.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Admin role
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await users.updateOne(filter, updateDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Initial Page
app.get("/", async (req, res) => {
  res.send("Dronegenix is running");
});

// Listening port
app.listen(port, () => {
  console.log("Dronegenix is running on port", port);
});
