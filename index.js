const express = require('express')
const app = express()
const cors = require('cors')
const admin = require('firebase-admin')
const fcm = require('fcm-node')
var cred = require('./config/push.json')
const path = admin.credential.cert(cred)
var FCM = new fcm(path)
const host = '0.0.0.0'
const port = 3000
// const NodeGeocoder = require('node-geocoder');
// const options = {
//     provider: 'google',
//     apiKey: 'AIzaSyATtrsiAlzHem4K7vJt_Y3yGv7sUY8fl8k', 
//     formatter: null 
// };
// const geocoder = NodeGeocoder(options);
var destination = { latitude: 44.464985952017166, longitude: 26.068382554630922 }

// geocoder.reverse({ lat: destination.latitude, lon: destination.longitude }).then(x=>{
//     console.log(x)
// })
const sendNotfication = (value)=>{
    var message = {
        to : value,
        data : {},
        notification:{
            title : "Alert",
            body : "You Have Hit your point"
        }
        
    }
    console.log(message)
    FCM.send(message,(err,res)=>{
        if(err){
            console.log("Something is wrong")
        }
        else{
            console.log("success")
            destination = []
        }
    })
}


app.use(express.json())
app.use(cors({origin : '*'}))
var data={}
app.get("/health",(req,res)=>{
    console.log("hit")
    res.send({msg : "up and running"})
})
app.get('/getDestination',(req,res)=>{
    console.log(destination)
    res.send(destination).status(200)
})
app.post('/changeDestination',(req,res)=>{
    if(req.body.latitude & req.body.longitude){
        destination = req.body
        res.sendStatus(201)
        return ;
    }
    res.sendStatus(403)
})
app.get('/clear',(req,res)=>{
    data = {}
    res.sendStatus(200)
})
app.post('/location',(req,res)=>{
    const resp = req.body
    if(resp != {}){
        data[Object.keys(resp)[0]] = resp[Object.keys(resp)[0]]
    }
    const latdiff = Math.abs(resp[Object.keys(resp)[0]].latitude - destination.latitude)
    const longdif = Math.abs(resp[Object.keys(resp)[0]].longitude - destination.longitude)
    console.log(latdiff,longdif)
    if(latdiff < 0.000021 || longdif < 0.000021){
        sendNotfication(Object.keys(resp)[0])
    }
    res.sendStatus(200)
})

app.listen(port,host,()=>{
    console.log("Server is running ")
})