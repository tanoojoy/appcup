const { MongoClient, ObjectId} = require('mongodb');
const express = require('express'); 
const bcrypt = require('bcrypt');
const path = require('path');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

const connection_String = "mongodb+srv://{{username}}:{{password}}@4byte.23ovkup.mongodb.net/";
const database_name = "{{database_name}}";
const db_client = mongo_db_init();
var total = 0;
var return_array = [];

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic home route for the API
app.get('/', (_req, res) => {
    res.send('Auth API.\nPlease use POST /auth & POST /verify for authentication')
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
