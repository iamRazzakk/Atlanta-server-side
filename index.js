const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// for mongodb

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.pkfik7i.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const blogCollection = client.db("AtlantaDB").collection("blogs");
    // const usersCollection = client.db("AtlantaDB").collection("users");
    const commentCollection = client.db("AtlantaDB").collection("comments");

    // user auth related api
    app.post("/jwt", async (req, res) => {
      const loginUser = req.body;
      const token = jwt.sign(loginUser, process.env.JWT_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // for user
    app.post("/user", (req, res) => {
      const userData = req.body;

      const db = client.db("AtlantaDB");
      const collection = db.collection("users");

      collection.insertOne(userData, (error, result) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
        }

        res
          .status(201)
          .json({
            success: true,
            message: "User registered successfully",
            data: result.ops[0],
          });
      });
    });

    // Get all users
    app.get("/user", (req, res) => {
      const db = client.db("AtlantaDB");
      const collection = db.collection("users");

      collection.find().toArray((error, result) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
        }

        res.status(200).json({ success: true, data: result });
      });
    });

    // For Post Data
    app.post("/blogs", async (req, res) => {
      const blogsData = req.body;
      const result = await blogCollection.insertOne(blogsData);
      res.send(result);
    });
    // For get Blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogCollection.find().toArray();
      res.send(result);
    });
    // for single one
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      // console.log(filter);
      const result = await blogCollection.findOne(filter);
      res.send(result);
    });
    // for single one delete
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      res.send(result);
    });
    // for update
    app.put("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBlogs = req.body;
      const updateDoc = {
        $set: {
          name: updateBlogs.name,
          Category: updateBlogs.Category,
          details: updateBlogs.details,
          data: updateBlogs.data,
        },
      };
      const result = await blogCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // for comment
    app.post("/comments", async (req, res) => {
      const commentData = req.body;
      const result = await commentCollection.insertOne(commentData);
      res.send(result);
    });
    app.get("/comments", async (req, res) => {
      const result = await commentCollection.find().toArray();
      res.send(result);
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Atlanta app listening on port ${port}`);
});
