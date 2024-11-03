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

app.set("io", io);

io.on("connection", (socket) => {
	console.log("New client connected");

	socket.on("join", (userId) => {
		socket.join(userId);
		console.log(`User with ID ${userId} joined room ${userId}`);
	});

	socket.on(
		"message",
		({ _id, sender, reciver, text, createdAt, updatedAt }) => {
			console.log(`Message from ${sender} to ${reciver}: `, text);

			io.to(reciver).emit("message", {
				_id,
				sender,
				reciver,
				text,
				createdAt,
				updatedAt,
			});
		}
	);

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

server.listen(PORT, () => {
	console.log(`Server is Running on Port: ${PORT}`);
});
