const { MongoClient, ObjectId} = require('mongodb');
const express = require('express'); 
const bcrypt = require('bcrypt');
const path = require('path');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

const connection_String = "mongodb+srv://tanoo:ptkgSEvaPlh2fZfN@4byte.23ovkup.mongodb.net/";
const database_name = "AppCup";
const db_client = mongo_db_init();
var total = 0;
var return_array = [];

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic home route for the API
app.get('/', (_req, res) => {
    console.log("Hello");
    res.send('Auth API.\nPlease use POST /auth & POST /verify for authentication')
})


app.get('/fetch_item_count', (req, res) => {
    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('items'); //change this to your collection name
        resolve(collection);
    }); 
    
    Promise.all([connect_db]).then(async function(response){
        
        const query = { };   //empty to query everything
        const cursor = await collection.find(query);
        total = await cursor.count();

        for await (const doc of cursor) {
            create_json(doc);
        }
        
        res.status(200).json({ count: total, list: return_array });

    })
})

app.post('/register_doc_interest', (req, res) => {
    const { doc_id, doc_name, doc_experience, doc_age, doc_hospital, doc_accreditation } = req.body;

    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('doc_interest'); //change this to your collection name
        resolve(collection);
    }); 

    Promise.all([connect_db]).then(async function(response){
        
        const query = { doc_id: doc_id, doc_name: doc_name, doc_experience: doc_experience, doc_age: doc_age, doc_hospital: doc_hospital, doc_accreditation: doc_accreditation };   //empty to query everything
        const cursor = await collection.insertOne(query);

        console.log(cursor);
        
        res.status(200).json({ "message": "success" });

    })



    res.json({ "result": "received" , "doc_id": doc_id, "doc_name": doc_name, "doc_experience": doc_experience, "doc_age": doc_age, "doc__hospital": doc_hospital, "doc_accreditation": doc_accreditation }).status(200);
})

app.post('/edit_patient_profile', (req, res) => {
    const { user_id, name, city, state, bio } = req.body;

    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('patients'); //change this to your collection name
        resolve(collection);
    }); 

    Promise.all([connect_db]).then(async function(response){
        
        const filter = { user_id: user_id };        
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                user_id: user_id,
                name: name,
                city: city,
                state: state,
                bio: bio
            },
        };

        const result = await collection.updateOne(filter, updateDoc, options);

        console.log(result);
        if(result.acknowledged == true){
            res.status(200).json({"message": "insert_success"});
        }
        else{
            res.status(200).json({"message": "insert_failed"})
        }
        
    })
})

app.post('/get_patient', (req, res)=>{
    const { user_id } = req.body;

    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('patients'); //change this to your collection name
        resolve(collection);
    }); 

    Promise.all([connect_db]).then(async function(response){
        
        const query = { user_id: user_id };
        const options = {
            projection: { user_id: 1, profile_completed: 1, name: 1 },
        };

        const result = await collection.findOne(query, options);
        console.log(result);

        res.status(200).json({ "profile_completed": result.profile_completed, "name": result.name});
    })
})

app.post('/save_voice', (req, res) => {
    const { user_id, audio_path } = req.body;

    console.log(audio_path);

    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('voice_recordings'); //change this to your collection name
        resolve(collection);
    }); 

    Promise.all([connect_db]).then(async function(response){
        
        const query = { user_id: user_id };
        
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                user_id: user_id,
                audio_path: audio_path
            },
        };

        const result = await collection.updateOne(updateDoc, options);
        console.log(result);

        res.status(200).json({ "message": "success" });
    })


})

app.get('/get_doctors', (req, res) => {
    const connect_db = new Promise(async function(resolve, reject){
        await db_client.connect();
        const database = db_client.db(database_name);   
        collection = database.collection('doctors'); //change this to your collection name
        resolve(collection);
    }); 

    Promise.all([connect_db]).then(async function(response){
        const query = { doctor_name: "Tanoo" };

        const result = await collection.findOne(query);
        
        res.status(200).json({ "doc_name": result.doctor_name });

    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Our app is running on port ${ PORT }");
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
