const { MongoClient, ObjectId} = require('mongodb');
const express = require('express'); 
const bcrypt = require('bcrypt');
const path = require('path');
var bodyParser = require('body-parser')//add this
var cors = require('cors')
const jwt = require("jsonwebtoken")
const saltRounds = 10;


const app = express();
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

const jwtSecretKey = 'dsfdsfsdfdsvcsvdfgefg';
const connection_String = "mongodb+srv://tanoo:ptkgSEvaPlh2fZfN@4byte.23ovkup.mongodb.net/";
const database_name = "MDXHackathon";
const db_client = mongo_db_init();
var total = 0;
var return_array = [];


// Set up CORS and JSON middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic home route for the API
app.get('/', (_req, res) => {
    res.send('Auth API.\nPlease use POST /auth & POST /verify for authentication')
})

app.post("/auth", (req, res) => {
    
    const { user_type, email, password } = req.body;

    console.log(user_type);

    if(user_type == "buyer"){
         // Look up the user entry in the database
        const connect_db = new Promise(async function(resolve, reject){
            await db_client.connect();
            const database = db_client.db(database_name);   
            collection = database.collection('users');
            resolve(collection);
        }); 
        
        Promise.all([connect_db]).then(async function(response){
            
            const query = { email: email };
            const result = await collection.findOne(query);
        
            console.log(result);
            if(result){
                if(result.email == email){ //if user found
                console.log("Password from DB:" + result.password);
                
                bcrypt.compare(password, result.password, function (_err, response) {
                    if (!response) {
                        return res.status(401).json({ message: "Invalid password" });
                    } else {
                        let loginData = {
                            email,
                            signInTime: Date.now(),
                        };
        
                        const token = jwt.sign(loginData, jwtSecretKey);
                        res.status(200).json({ "userID": result._id, message: "success", "token": token });
                    }
                });
            }
        }
            else{  //user not found
                console.log("Creating new user..");
                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(password, salt, function (_err, hash) {
                        console.log({ email, password: hash })
                        
                        const connect_db = new Promise(async function(resolve, reject){
                            await db_client.connect();
                            const database = db_client.db(database_name);   
                            collection = database.collection('users');
                            resolve(collection);
                        }); 
                        
                        Promise.all([connect_db]).then(async function(response){
                            
                            const query = { email: email, password: hash };
                            const result = await collection.insertOne(query);

                            console.log(result);

                            let loginData = {
                                email,
                                signInTime: Date.now(),
                            };
                
                            const token = jwt.sign(loginData, jwtSecretKey);
                            res.status(200).json({ message: "success", token });
                        });
                    });
                });
            }
        });
    }
    else if(user_type == "seller"){
         // Look up the user entry in the database
         const connect_db = new Promise(async function(resolve, reject){
            await db_client.connect();
            const database = db_client.db(database_name);   
            collection = database.collection('sellers');
            resolve(collection);
        }); 
        
        Promise.all([connect_db]).then(async function(response){
            
            const query = { email: email };
            const result = await collection.findOne(query);
        
            console.log(result);
            if(result){
                if(result.email == email){ //if user found
                console.log("Password from DB:" + result.password);
                
                bcrypt.compare(password, result.password, function (_err, response) {
                    if (!response) {
                        return res.status(401).json({ message: "Invalid password" });
                    } else {
                        let loginData = {
                            email,
                            signInTime: Date.now(),
                        };
        
                        const token = jwt.sign(loginData, jwtSecretKey);
                        res.status(200).json({ "userID": result._id, message: "success", "token": token });
                    }
                });
            }
        }
            else{  //user not found
                console.log("Creating new user..");
                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(password, salt, function (_err, hash) {
                        console.log({ email, password: hash })
                        
                        const connect_db = new Promise(async function(resolve, reject){
                            await db_client.connect();
                            const database = db_client.db(database_name);   
                            collection = database.collection('sellers');
                            resolve(collection);
                        }); 
                        
                        Promise.all([connect_db]).then(async function(response){
                            
                            const query = { email: email, password: hash };
                            const result = await collection.insertOne(query);

                            console.log(result);

                            let loginData = {
                                email,
                                signInTime: Date.now(),
                            };
                
                            const token = jwt.sign(loginData, jwtSecretKey);
                            res.status(200).json({ "userID": result._id, message: "success", "token": token });
                        });
                    });
                });
            }
        });
    }
   
})

app.post('/verify', (req, res) => {
    const tokenHeaderKey = "jwt-token";
    const { token } = req.body;
    try {
      const verified = jwt.verify(token, jwtSecretKey);
      if (verified) {
        return res
          .status(200)
          .json({ status: "logged in", message: "success" });
      } else {
        // Access Denied
        return res.status(401).json({ status: "invalid auth", message: "error" });
      }
    } catch (error) {
      // Access Denied
      return res.status(401).json({ status: "invalid auth", message: "error" });
    }

})

app.get('/fetch_item_count', (req, res) => {
    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('items');
        resolve(collection);
    }); 
    
    Promise.all([connect_db]).then(async function(response){
        
        const query = { };
        const cursor = await collection.find(query);
        total = await cursor.count();

        for await (const doc of cursor) {
            create_json(doc);
        }

        console.log(return_array);
        
        res.status(200).json({ count: total, list: return_array });

    })
})

app.post('/add_to_cart',(req, res) => {
    const { id, number } = req.body;
    console.log(id)

    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('cart');
        resolve(collection);
    }); 
    
    Promise.all([connect_db]).then(async function(response){
        
        const insert = { item_id: id, number: number };
        const result = await collection.insertOne(insert);

        console.log(result);
        return res.status(200).json({ status: "added", message: "success" });

    });

})

app.post('/get_cart_items', (req, res) => {
    const { id } = req.body;
    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('cart');
        resolve(collection);
    }); 
    
    Promise.all([connect_db]).then(async function(response){
        
        const query = { userID: id };
        const cursor = await collection.find(query);
        total = await cursor.count();

        for await (const doc of cursor) {
            create_json(doc);
        }

        res.status(200).json({ list: return_array });

    })
})

app.post('/get_item_details', (req, res) => {
    const { id } = req.body;
    // console.log(id)
    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('items');
        resolve(collection);
    }); 

    Promise.all([connect_db]).then(async function(response){
        mongo_id = new ObjectId(id);
        const query = { _id: mongo_id};
        const item = await collection.findOne(query);
        console.log(item);
        // total = await cursor.count();

        res.status(200).json({ 
            "item_name": item.item_name,
            "item_price": item.item_price,
            "item_seller": item.item_seller,
            "item_image": item.item_image,
            "item_description": item.item_description
            // "item_quantity": item.number
        });
    })
})

app.post('/create_item', (req, res) => {
    const { item_name, item_price, item_seller, item_description, item_image } = req.body;

    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('items');
        resolve(collection);
    }); 
    
    Promise.all([connect_db]).then(async function(response){
        
        const insert = { item_name: item_name, item_price: item_price, item_seller: item_seller, item_description: item_description, item_image: item_image };
        const result = await collection.insertOne(insert);

        console.log(result);
        return res.status(200).json({ status: "added", message: "success" });

    });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(Our app is running on port ${ PORT });
});

function mongo_db_init(){
    const uri = connection_String;
    const db_client = new MongoClient(uri);

    return db_client;
}

function create_json(item){
    // console.log(item)
    return_array.push({
        "id": item._id,
        "item_name": item.item_name,
        "item_price": item.item_price,
        "item_seller": item.item_seller,
        "item_image": item.item_image,
        "item_description": item.item_description
    })
}
