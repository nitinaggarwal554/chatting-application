//after correction

/////////////////////////////////////////////////////////////////////////


var express=require('express');
var app=express();
var server=require('http').Server(app);
var client=require('socket.io')(server).sockets;
var path=require('path');
var ip=require('ip');
var mongo=require('mongodb').MongoClient;
var mongoose=require('mongoose');

var port=3000

//CONNECT TO MONGO
mongoose.connect('mongodb://localhost/chatdb',function(err,db){
    if(err){
        throw err;
    }
console.log('mongo connected.');

//connect to socket.io
client.on('connection',function (socket){
    console.log('a new user is connected')
let chat=db.collection('chats');

//create functon to send status{
SendStatus=function(s){
    socket.emit('status',s)
}

//get chats from mongo collection
chat.find().limit(100).sort({ _id:1}).toArray(function(err,res){
    if(err){
        throw err;
    }
    //emit the messages
    console.log(res);
    socket.emit('output',res);
})

//handle the input events
socket.on('input',function(data){
    let name=data.name;
    let message=data.message;
    //check for name and messages
    if(name == '' ||  message == ''){
        //send error status
        SendStatus('Please enter the name and messages.')
    }else{
        //insert messages
        chat.insertOne({name:name,message:message},function(){
            var arr = [];
            arr.push(data);
            socket.emit('output',arr);
            arr = [];
        //send status objcts
            SendStatus({
                message:'message sent',
                clear:true
            })
        })
    }

});

//handle clear
socket.on('clear',function(data){
    //remove all chats from collection
    chat.deleteMany({},function(){
        socket.emit('cleared')
    })
})


    socket.on('disconnect',function(){
        console.log('a user is disconnected')
    })
})

})

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html')
})

server.listen(port,function(){
    console.log('the server is listening at http://' + ip.address() + ":" + port);
})