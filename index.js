const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufduuil.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const userCollection = client.db("discover-jobs").collection("user");
    const jobsCollection = client.db("discover-jobs").collection("jobs");
    const bidjobsCollection = client.db("discover-jobs").collection("bidjobs");
 const bidrequestjobsCollection = client.db("discover-jobs").collection("requstbidjobs");



    app.post("/api/saveuser", async (req, res) => {
      try {
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error(error);
      }
    });

    app.get("/api/saveuser", async (req, res) => {
      try {
        const userEmail = req.query.userEmail;
        const cursor = userCollection.find({ email: userEmail });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            error:
              "An error occurred while fetching user-specific job listings.",
          });
      }
    });

  
    app.get("/api/jobs", async (req, res) => {
      try {
        const cursor = jobsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching job listings." });
      }
    });
    app.get("/api/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.get("/api/myjobs", async (req, res) => {
      try {
        const userEmail = req.query.userEmail;
        const cursor = jobsCollection.find({ email: userEmail });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            error:
              "An error occurred while fetching user-specific job listings.",
          });
      }
    });

  app.post("/api/jobs", async (req, res) => {
  try {
    const job = req.body;

    
    
    const result = await jobsCollection.insertOne(job);
    res.send(result);
  } catch (error) {
    console.error(error);
  }
});

    app.put("/api/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedJob = req.body;
        const filter = { _id: new ObjectId(id) };
        const result = await jobsCollection.updateOne(filter, {
          $set: updatedJob,
        });
        res.send(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred while updating the job." });
      }
    });

    // Delete a job
    app.delete("/api/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred while deleting the job." });
      }
    });

    // bidjobs
    app.get("/api/ConfirmedJobs", async (req, res) => {
      const userEmail = req.query.email;

      if (!userEmail) {
        return res.status(400).json({ error: "Email parameter is required" });
      }

      try {
        const query = { email: userEmail };
        const result = await bidjobsCollection.findOne(query);

        if (!result) {
          return res.status(404).json({ error: "No data found" });
        }

        res.json(result);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({
            error: "An error occurred while fetching confirmation data",
          });
      }
    });

   app.post("/api/getConfirmedJobs", async (req, res) => {
  try {
    const {
      jobId, 
      userEmail,
      additionalInfo,
      phoneNumber,
      address,
      jobRelatedInfo,
    } = req.body;

    const result = await bidjobsCollection.insertOne({
      jobId, 
      userEmail,
      additionalInfo,
      phoneNumber,
      address,
      jobRelatedInfo,
      bidDate: new Date(),
    });

    res.send(result);
  } catch (error) {
  }
});

    // getConfirmedJobs

app.get("/api/getConfirmedJobs", async (req, res) => {
  const userEmail = req.query.email;
  const jobId = req.query.jobId;

  if (!userEmail) {
    return res.status(400).json({ error: "Email parameter is required" });
  }

  try {
    let query;
    if (jobId) {
      
      query = { userEmail, jobId };
    } else {
      query = { userEmail };
    }

    const result = await bidjobsCollection.find(query).toArray();

    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No confirmed jobs found for the user" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    
  }
});


app.get("/api/bidRequests", async (req, res) => {
  try {
    const bidRequests = await bidrequestjobsCollection.find({ status: 'pending' }).toArray();
    res.send(bidRequests);
  } catch (error) {
    console.error(error);
    
  }
});

// Submit a bid request

// Get all pending bid requests
app.get("/api/bidRequests", async (req, res) => {
  try {
    const bidRequests = await bidrequestjobsCollection.find({ status: 'pending' }).toArray();
    res.send(bidRequests);
  } catch (error) {
    console.error(error);
  }
});

// Create a new bid request
app.post('/api/bidRequests', async (req, res) => {
  try {
    const bidData = req.body;
    bidData.status = 'pending';
    const result = await bidrequestjobsCollection.insertOne(bidData);
    res.send(result); 
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "An error occurred while submitting the bid request." });
  }
});

app.post('/api/acceptBid/:id', async (req, res) => {
  try {
    const bidId = req.params.id; // Extract the bid ID from the request parameters
    const query = { _id: new ObjectId(bidId) };

    // Update the bid's status to 'Accepted' in the database
    const updateResult = await bidrequestjobsCollection.updateOne(query, { $set: { status: 'Accepted' } });

    if (updateResult.matchedCount === 1) {
      res.status(200).json({ message: 'Bid accepted successfully' });
    } else {
      res.status(404).json({ error: 'Bid not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while accepting the bid' });
  }
});


app.post('/api/rejectBid/:id', async (req, res) => {
  try {
    const bidId = req.params.id;
    
    
    const query = { _id: new ObjectId(bidId) };
    const update = { $set: { status: 'Rejected' } };
    const result = await bidrequestjobsCollection.updateOne(query, update);
    
    if (result.modifiedCount === 1) {
      res.status(200).send({ message: 'Bid rejected successfully' });
    } else {
      res.status(404).send({ error: 'Bid not found or not updated' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while rejecting the bid' });
  }
});



    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("discover jobs server");
});

app.listen(port, () => {
  console.log(`discover jobs server running on ${port}`);
});
