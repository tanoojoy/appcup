const { MongoClient, ObjectId} = require('mongodb');
const express = require('express'); 
const path = require('path');
var bodyParser = require('body-parser')//add this

const app = express();
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));


const connection_String = "mongodb+srv://tanoo:ptkgSEvaPlh2fZfN@4byte.23ovkup.mongodb.net/";
const database_name = "MDXHackathon";
const db_client = mongo_db_init();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/siva', (req, res) => {
   res.send("HEllo world").status(200);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

function mongo_db_init(){
    const uri = connection_String;
    const db_client = new MongoClient(uri);

    return db_client;
}
