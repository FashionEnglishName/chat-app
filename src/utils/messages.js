const generateMessageObject = (username, text) => {
	return {
		username,
		text,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessageObject
}