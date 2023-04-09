const port=8000;
//var WebSocketServer = require('ws').Server;
const express =require('express')
const path=require('path');
//const express = require('express')
const app = express()
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8886 });
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const uuid = require('uuid');


var connmap=new Map();

wss.on('listening',function(){
    console.log("Server started...");
});


//============================================================database======================================================================


main().catch(err => console.log(err)
);
async function main() {
  mongoose.set('strictQuery', true);
  await mongoose.connect('mongodb://localhost:27017/rtc-prac-2',{
    useUnifiedTopology: true
  });
  console.log("connected to DB [///]");
  
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
var db=mongoose.connection;
db.once('open',function(){
  console.log("connected to databse...\\_(-_-)_/...........;;");
})

//---------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------



var sessionsschema = new mongoose.Schema({
    name: String,
    userid:String,

  });
  
  var sessionsmodel = mongoose.model('session',sessionsschema);


var connectionsschema = new mongoose.Schema({
    name: String,
    status:String,
   
  });
  
  var connectionsmodel = mongoose.model('connection',connectionsschema);
















//=========db===========================db===================================db=========================db====================db====================



wss.on('connection',function(connection){
    console.log("connected")
    connection.on('message',async function(message){

        var data=JSON.parse(message)
        console.log(data);

        switch(data.type){
            case "login":
                connmap.set(data.user,connection)
                console.log("setted")
                return;

            case "replace":
                var reqdata=await sessionsmodel.find({userid:data.from},{name:1})
                var sender=reqdata[0].name;
                connmap.forEach(async (val,key,connmap)=>{
                    console.log(key)
                    val.send(JSON.stringify({type:'update_userlist',item:sender}));
                 })
                connmap.set(sender,connection);
                await connectionsmodel.updateOne({name:sender},{ $set: { status:"online" } });
                
                return;

            case "message":
                var tt=await sessionsmodel.find({userid:data.from},{name:1})
                var sender=tt[0].name;
                var user2conn=connmap.get(data.to);
                user2conn.send(JSON.stringify({type:"message",from:sender}))
                return;

            case "offer":
                var tt=await sessionsmodel.find({userid:data.from},{name:1})
                var sender=tt[0].name;
                var user2conn = connmap.get(data.to);
                user2conn.send(JSON.stringify({type:"offer",offer:data.offer,from:sender,to:data.to,k:data.k}))
                return;

            case "candidate":
                var user2conn=connmap.get(data.to);
                if(user2conn==undefined){
                  var tt=await sessionsmodel.find({userid:data.to},{name:1})
                  var ttt=tt[0].name;
                  user2conn=connmap.get(ttt);
                }
                user2conn.send(JSON.stringify({type:"candidate",candidate:data.candidate,from:data.from,to:data.to}));
                return;

            case "answer":
                console.log("answer is==>",data)
                var user2conn=connmap.get(data.to);
                if(user2conn==undefined){
                  var tx=await sessionsmodel.find({userid:data.to},{name:1})
                  var ttxx=tx[0].name;

                  user2conn=connmap.get(ttxx);
                }
                var myname=data.from;
                user2conn.send(JSON.stringify({type:"answer",answer:data.answer,from:data.from,to:data.to}))
                return;

            case "declined":
                var user2conn=connmap.get(data.to);
                if(user2conn==undefined){
                    var tx=await sessionsmodel.find({userid:data.to},{name:1})
                    var ttxx=tx[0].name;
  
                    user2conn=connmap.get(ttxx);
                  }
                  user2conn.send(JSON.stringify({type:"declined",from:data.from}));
                  return;
            case "room_close":
                var user2_conn=connmap.get(data.to);
                if(user2_conn){
                user2_conn.send(JSON.stringify({type:"room_close"}))}
                return;
                
            case "viedio_call_close":
                var user2_conn=connmap.get(data.to);
                if(user2_conn){
                user2_conn.send(JSON.stringify({type:"viedio_call_close"}))}
                return;

        }
       

    })

    connection.on('close',function(){
        console.log("closng")
        connmap.forEach(async (val,key,connmap)=>{
            if(connmap.get(key)==connection){
                console.log("==||==",key)
                connmap.delete(key)
                console.log("======\\====>i",key)
                await connectionsmodel.updateOne({name:key},{ $set: { status:"offline" } });
                var tx=await connectionsmodel.find({name:key},{name:1});
                    console.log("==>",tx)
            }
        })
    });


})
app.use('/static',express.static('static'))
app.set('static', path.join(__dirname, 'static'))

app.set('view engine', 'pug') // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')) // Set the views directory


const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: {maxAge: oneDay },
    resave: false 
}));



app.get('/',(req,res)=>{

    var uuidx=uuid.v4()

    req.session.userid = uuidx;
    req.session.cookie.userid=req.session.userid;

    const now = new Date()
    const expiresAt = new Date(+now + 120 * 1000)
    res.cookie("session_token", uuidx, { expires: expiresAt })


    res.render('login.pug');
})



app.use(express.json());
app.use(express.urlencoded());
app.post('/home',async (req,res)=>{
    console.log("app.post")
    var name=req.body.usernamename;
    var password=req.body.password;

    console.log(req.session)

    var obj={name:name,userid:req.session.userid}
    console.log(obj)
    var x=new sessionsmodel(obj)
    x.save().then(()=>{
        console.log("saved to sessionsmode;");
    }).catch((err)=>{
        console.log(err);
    })

    var datac=await connectionsmodel.find({status:"online"},{name:1});
    
    var params={data:datac}

    var obj={name:name,status:"online"}
    console.log(obj)
    var x=new connectionsmodel(obj);
    x.save().then(()=>{
        console.log("saved to connectiosnsmode;");
    }).catch((err)=>{
        console.log(err);
    })

    

    res.render("dashboardx.pug",params);

})
























app.listen(port,()=>{
    console.log("running on port");
})