const {config} = require("dotenv");
config()

const {createClient} = require("redis");
const client = createClient({
    
    url: process.env.REDIS_URL
});

async function x(){
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
}

x()

function getDb(){
    if(client){
        return client;
    }
}

module.exports = getDb;


