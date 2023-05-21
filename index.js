const express = require('express')
const app = express()
var jwt = require('jsonwebtoken');
var cors = require('cors')
require('dotenv').config()
const port =process.env.PORT ||  3000

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion ,ObjectId} = require('mongodb');
const uri =`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-mvazqsy-shard-00-00.hpy6sqt.mongodb.net:27017,ac-mvazqsy-shard-00-01.hpy6sqt.mongodb.net:27017,ac-mvazqsy-shard-00-02.hpy6sqt.mongodb.net:27017/?ssl=true&replicaSet=atlas-vll8ae-shard-0&authSource=admin&retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req,res,next) =>{
  console.log('hitting verify JWT')
  console.log("athor",req.headers.athorization);
  const athorization = req.headers.athorization;
  if(!athorization){
   return res.status(401).send({error:true, messege:'unathorized access'})
  }
 
  const token = athorization.split(' ')[1];
  console.log('token inside verify JWT//',token)
  jwt.verify(token,process.env.AC_TOKEN_SECRETE, (error,decoded) =>{
      if(error){
       return res.status(403).send({error:true, messege:'unathorized access'})
      }
      req.decoded=decoded;
      next()
  })
 }
 

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
  //for all toys
  const database = client.db("AlltoysDB");
  const alltoysCollection = database.collection("alltoys");
  //---------------

  //ADD TOY---------------------
  const databas = client.db("AddtoysDB");
  const addtoysCollection = databas.collection("addtoys");
//   ------------------
  //JWT
  app.post('/jwt',(req,res)=>{
    
    const user = req.body;
    console.log("ss",user)
    var token = jwt.sign(user,process.env.AC_TOKEN_SECRETE,{expiresIn: '2h' })
    console.log(token)
    res.send({token})
  })
    //JWT

//   all toys-----------------------------------------
  app.get("/alltoys/:text", async(req,res)=>{
    console.log(req.params.text)
    
    if(req.params.text === "lowto"){
      const cursor = alltoysCollection.find({}).sort({ price: 1 })
      const result = await cursor.toArray()
      return res.send(result)

    }
    else if(req.params.text === "highto"){
      const cursor = alltoysCollection.find({}).sort({ price: -1 })
      const result = await cursor.toArray()
      return res.send(result)

    }
   
   else{
    const cursor = alltoysCollection.find({}).limit(20);
    const result = await cursor.toArray()
    res.send(result)
   }
   
  })

  // low to high sort
  app.get('/alltoyslowtohigh', async(req,res)=>{
   
  })
  // --------


  app.get('/alltoys/:id', async(req,res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await alltoysCollection.findOne(query)
  res.send(result)
  })
//   ----------------------------------

// Add toys---------------------
app.post('/addtoys', async(req,res)=>{
    const newtoys =  req.body;
    console.log(newtoys)
    
    const result = await addtoysCollection.insertOne(newtoys);
    res.send(result)
})

app.get(`/addtoys/:email`,verifyJWT, async(req,res)=>{
  console.log('para',req.params.email)
console.log("nnnn",req.query.email)
console.log("OOOO",req.decoded.email)
const decoded = req.decoded
console.log("Came back after verify",decoded);
if(decoded.email !== req.params.email){
  return res.status(403).send({error:1, message:"forbidden"})
}
const email = req.params.email
const query = { email: email};
  const cursor = addtoysCollection.find(query);
  const result = await cursor.toArray()
  res.send(result)
})
app.get('/addtoys/:id',async(req,res)=>{
  const id = req.params.id
  const query = { _id: new ObjectId(id)};
  const result = await addtoysCollection.findOne(query);
  res.send(result)
  })

app.delete('/addtoys/:id',async(req,res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)};
  const result = await addtoysCollection.deleteOne(query);
  res.send(result);
   })

   app.put('/update/:id', async(req,res) =>{
    const id = req.params.id;
    const updateToys = req.body
    console.log(updateToys )
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const update = {
        $set: {
          Name:updateToys.Name,
          Sellername:updateToys.Sellername,
          Selleremail:updateToys. Selleremail,
          subcategory:updateToys.subcategory,
          price:updateToys.price,
          rating:updateToys.rating,
          quantity:updateToys.quantity,
          area:updateToys.area,
          photo:updateToys.photo
        },
      };
      const result = await addtoysCollection.updateOne(filter, update, options);
      res.send(result)
 })

// ---------------------
// all TOYS SEARCH

// ----------------------




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!000000000000')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})