const users = [];

const addUser = ({ id, username, room }) => {
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	if(!username || !room) {
		return {error: "Username and room are required"};
	}

	const existingUser = users.find(user => {
		return user.username === username && user.room === room;
	});

	if(existingUser) return {error: "Username is existing"};

	const user = { id, username, room };
	users.push(user);
	return { user };
}

const removeUser = (id) => {
	const index = users.findIndex(user => {
		return user.id === id;
	});

	if(index !== -1) {
		return users.splice(index, 1)[0];
	}
}

const getUser = id => {
	const index = users.findIndex(user => {
		return user.id === id;
	});

	if(index === -1) return undefined;
	else return users[index];
}

const getUserInRoom = room => {
	const userInRoom = users.filter(user => user.room === room);

	return userInRoom;
}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUserInRoom
}
