const express = require('express');
const app = express();          //this initializes a new instance.
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const bcrypt = require('bcrypt');

const mongoose = require("mongoose");
const message_history = require("./model/message_history");
const user_data = require("./model/users");
const eventDB = require("./model/eventDB");

const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_SECRET;
const verifyToken = require("./verifyToken");

require('console');

mongoose.connect("mongodb://localhost/msg_hdb").then(() => {
    console.log('connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB: ', error);
});

app.use(express.static('public'));
app.use(express.json());

app.post('/index', async(req,res) => {
    try{
        const { username, password } = req.body;

        if(!username || !password){
            return res.send({success: false, message: "Fill all the required fields!"});
        }

        const match_user = await user_data.findOne({username});
        if(!match_user){
            return res.send({success: false, message: "User Not Found."});
        }
        
        // console.log("password from body:", password);
        // console.log("password from DB:", match_user?.password);

        const match_pwd = await bcrypt.compare( password,match_user.password);
        if(!match_pwd){
            return res.send({success: false, message: "Incorrect Password."});
        }
          
        const payload = {
            username: match_user.username,
            role: match_user.role,
        };

        const token = jwt.sign(payload, secret, {expiresIn: '1h'});
        // console.log(token);

        // return res.send({success: true, username: match_user.username, role: match_user.role, message: "Login Successful!"});
        return res.send({success: true, message: "Login Successful!", token: token});
        }
        catch(error){console.error(error)};
        });

// var user_data = {};
app.post('/signup', async(req,res) => {
    try{
        const {username, password, role } = req.body;

        if(!username || !password || !role){
            return res.send({success: false, message: "Fill all the required fields!"});
        }

        const match_user = await user_data.findOne({username});
        if(match_user){
            return res.send({success: false, message: "Username already taken!"});
        }

        const saltRounds = 10;

        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err){
                console.error(`An error occurred: ${err}`);
                return;
            }

            bcrypt.hash(password, salt, (err, hashed_pwd) => {
                if (err){
                    console.error(`An error occurred: ${err}`);
                    return;
                }

            // console.log(`hashed password: ${hashed_pwd}`);

            const userData = new user_data({ 
                username: username, 
                password: hashed_pwd, 
                role: role
            });
            userData.save()
                .then(() => {
                    console.log("info saved to db");
                    return res.send({success: true, message: "Sign-up Completed. Please login with your creds now!"});
                })
                .catch((error) => {
                    console.error(`info can't be saved :${error}`);
                    return res.send({ success: false, message: "Error saving user to DB." });
                });
            }); 
        });
    }catch(error){
       console.error(error);
        return res.send({ success: false, message: 'Unexpected server error.' }); 
    }
});

app.post('/eventAdd', verifyToken, async(req,res) => {
    console.log("User making the request:", req.user);

    if(req.user.role !== "admin"){
        return res.status(403).json({message: "Access denied: Admins only!"});
    }

    try{
        const {eventName} = req.body;

        if(!eventName){
            return res.send({success: false, message: "Please add an event name."});
        }

        const match_event = await eventDB.findOne({eventName});
        if(match_event){
            return res.send({success: false, message: "Event with this name already exists!"});
        }

        const eventData = new eventDB({ 
            eventName: eventName
        });
        eventData.save()
        .then(() => {
            console.log("event saved to db");
            return res.send({success: true, message: "Event added."});
        })
        .catch((error) => {
            console.error(`event can't be saved :${error}`);
            return res.send({ success: false, message: "Error saving event to DB." });
        });

    }catch(error){
        console.error(error);
        return res.send({ success: false, message: 'Unexpected server error.' }); 
    }
})

app.get('/existing_events', (req,res) => {
    eventDB.find({}).then((eventList)=>{
        res.json(eventList);
    }).catch((e)=>{
        console.error(e);
        return res.send({message: 'Failed to fetch events!!'});
    })
})

var user_room = {};

io.on('connection', (socket) => {
    console.log('A user connected');
    // const connected = "~New user connected~"
    // io.emit('user_connect', connected );
    socket.on('joinRoom', (data) => {
        console.log(data);
        socket.join(data.room);
        // socket.to(data.room).emit('userJoin', `--${data.name} joined the room--`);
        io.to(data.room).emit('userJoin', `--${data.name} joined the room--`);
        user_room[socket.id] = {name: data.name, room: data.room};
    })
    socket.on('getMsg_h', (room) => {
        message_history.find({ room: room }).sort({timestamp: 1}).then( (result) => {
            socket.emit('msg_history', result);
        }).catch((err) => {
            console.error('MsgH cant be loaded:', err);
        });
    });
    socket.on('User message', (data) =>{
        console.log('Message recieved:', data.msg);
        const msg_h = new message_history({ 
            sender: data.name, 
            room: data.room, 
            content: data.msg, 
            timestamp: new Date() 
        });
        msg_h.save().then(() => console.log("msg saved to db")).catch((err) => console.error("msg can't be saved to db: ", err));
        
        io.to(data.room).emit('newMessage', data);
    });
    socket.on('leaveRoom', (data) => {
        socket.leave(data.room);
        socket.to(data.room).emit('userLeft', `--${data.name} left the room--`);
        delete user_room[socket.id];

        const activeList = [];
        // var i = 0;
        for(const id in user_room){
            const { name, room } = user_room[id];
            if(room === data.room){
                activeList.push(name);
                // i++ ;
            }
        }
        console.log(activeList);
        io.to(data.room).emit('userList', activeList);
        // socket.emit('userList', activeList);
    })
    socket.on('disconnect', (reason) => { 
        if (user_room[socket.id]) {
            console.log(reason);
            const { name, room } = user_room[socket.id];
            socket.leave(room);
            socket.to(room).emit('userLeft', `--${name} disconnected--`);
            delete user_room[socket.id];

            const activeList = [];
            // var i = 0;
            for(const id in user_room){
                const { name, Room } = user_room[id];
                if(Room === room){
                   activeList.push(name);
                   // i++ ;
                }
            }
            console.log(activeList);
            io.to(room).emit('userList', activeList);
            // socket.emit('userList', activeList);
        }     
    })
    socket.on('userList', ({ roomName}) => {
        const activeList = [];
        // var i = 0;
        for(const id in user_room){
            const { name, room } = user_room[id];
            if(room === roomName){
                activeList.push(name);
                // i++ ;
            }
        }
        console.log(activeList);
        io.to(roomName).emit('userList', activeList);
        // socket.emit('userList', activeList);
    });
});

server.listen(3000, ()=> {
    console.log('Server running');   
});