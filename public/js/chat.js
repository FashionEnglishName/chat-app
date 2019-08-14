const socket = io();

const locationButton = document.querySelector("#send-location");
const form = document.querySelector("form");
const input = document.querySelector("input");
const messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
	const newMessage = messages.lastElementChild;

	const newMessageHeight = newMessage.offsetHeight + parseInt(getComputedStyle(newMessage).marginBottom);
	;

	const visibleHeight = messages.offsetHeight;

	const containerHeight = messages.scrollHeight;

	const scrollOffset = visibleHeight + messages.scrollTop;

	if(containerHeight - newMessageHeight <= scrollOffset) {

		messages.scrollTop = messages.scrollHeight;
	}
}

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format("HH:mm")
	});
	messages.insertAdjacentHTML("beforeend", html);

	autoscroll();

});

socket.on('locationMessage', (message) => {
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.text,
		createdAt: moment(message.createdAt).format("HH:mm")
	});
	messages.insertAdjacentHTML("beforeend", html);

	autoscroll();
});

socket.on("roomData", ({room, users}) => {
	const html = Mustache.render(sidebarTemplate, {
		room, 
		users,
	});
	document.querySelector("#sidebar").innerHTML = html;
});

locationButton.addEventListener("click", e => {
	if(!navigator.geolocation) return alert("not supported by your browser");

	locationButton.setAttribute("disabled", "disabled");
	let longitude, latitude;
	navigator.geolocation.getCurrentPosition(position => {
		longitude = position.coords.longitude;
		latitude = position.coords.latitude;
		socket.emit("sendLocation", {latitude, longitude}, () => {
			locationButton.removeAttribute("disabled");
		});
	});
});

form.addEventListener("submit", function(e) {
	e.preventDefault();
	form.setAttribute("disabled", "disabled");
	socket.emit("sendMessage", input.value, function() {
		form.removeAttribute("disabled");
	});
	input.value = "";
});

socket.emit("join", {username, room}, error => {
	if(error) {
		alert(error);
		location.href = '/';
	}
});
