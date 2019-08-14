const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessageObject } = require("./utils/messages.js");
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/users.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
	console.log("new connection");

	socket.on("join", ({ username, room }, callback) => {
		const { error, user } = addUser({id: socket.id, username, room});
		if(error) {
			return callback(error);
		}

		socket.join(user.room);
		socket.emit("message", generateMessageObject(user.username, `welcome`));
		socket.broadcast.to(user.room).emit("message", generateMessageObject(user.username, `${user.username} comes in`));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUserInRoom(user.room)
		});


		callback();

	});

	socket.on("sendMessage", (msg, callback) => {
		const user = getUser(socket.id);
		const filter = new Filter();
		if(filter.isProfane(msg)) {
			return callback("Profane language is not allowed");
		}

		io.to(user.room).emit("message", generateMessageObject(user.username, msg));
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);

		if(user) {
			io.to(user.room).emit("message", generateMessageObject(user.username, `${user.username} has left`));
			io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUserInRoom(user.room)
		});
		}

	});

	socket.on("sendLocation", (location, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit("locationMessage", generateMessageObject(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
		callback();
	});

})

server.listen(port, () => {
	console.log("listen on " + port);
});