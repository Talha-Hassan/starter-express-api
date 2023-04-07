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
function distanceCalculation(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
    }
}
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
    console.log(destination)
    if(req.body?.latitude && req.body?.longitude){
        destination = {
            latitude : Number(req.body.latitude),
            longitude : Number(req.body.longitude)
        }
        console.log("destination:" ,destination)
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
    const kilometers = distanceCalculation(destination.latitude,destination.longitude,resp[Object.keys(resp)[0]].latitude,resp[Object.keys(resp)[0]].longitude,'K')
    
    console.log("Kilometers",kilometers)
    if(kilometers < 0.003){
        sendNotfication(Object.keys(resp)[0])
    }
    res.sendStatus(200)
})

app.listen(port,host,()=>{
    console.log("Server is running ")
})