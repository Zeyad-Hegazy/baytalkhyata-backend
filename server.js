const http = require("http");
const app = require("./app");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config({ path: "config.env" });

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("New client connected");

	socket.on("message", (data) => {
		console.log("Message received: ", data);
		socket.broadcast.emit("message", data);
	});

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

server.listen(PORT, () => {
	console.log(`Server is Running on Port: ${PORT}`);
});
