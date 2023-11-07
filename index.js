const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufduuil.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const userCollection = client.db('discover-jobs').collection('user');
    const jobsCollection = client.db('discover-jobs').collection('jobs');

    app.post('/api/saveuser', async (req, res) => {
      try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error(error);
        
      }
    });

    app.get('/api/saveuser', async (req, res) => {
      try {
        const userEmail = req.query.userEmail; // Get the user's email from the query parameter
        const cursor = userCollection.find({ email: userEmail }); // Filter job listings by user email
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching user-specific job listings.' });
      }
    });

    // jobs
    app.get('/api/jobs', async (req, res) => {
      try {
        const cursor = jobsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching job listings.' });
      }
    });
    app.get('/api/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    
    app.get('/api/myjobs', async (req, res) => {
      try {
        const userEmail = req.query.userEmail; // Get the user's email from the query parameter
        const cursor = jobsCollection.find({ email: userEmail }); // Filter job listings by user email
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching user-specific job listings.' });
      }
    });

    app.post('/api/jobs', async (req, res) => {
      try {
        const job = req.body;
        const result = await jobsCollection.insertOne(job);
        res.send(result)
      } catch (error) {
        console.error(error);
        
      }
    });

    app.put('/api/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedJob = req.body;
        const filter = { _id: new ObjectId(id) };
        const result = await jobsCollection.updateOne(filter, { $set: updatedJob });
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the job.' });
      }
    });
    
    
    // Delete a job
    app.delete('/api/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobsCollection.deleteOne(query);
        res.send(result)
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the job.' });
      }
    });

    
  

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('discover jobs server');
});

app.listen(port, () => {
  console.log(`discover jobs server running on ${port}`);
});
