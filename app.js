const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config({ path: "config.env" });

const dbConnection = require("./config/database.js");
const ApiError = require("./util/ApiError.js");
const globalError = require("./middlewares/errorMiddleware.js");
const isAuth = require("./middlewares/isAuth.js");
const isRole = require("./middlewares/isRole.js");

const { ADMIN } = require("./constants/userRoles.js");

const authRoutes = require("./routes/authRouter.js");
const adminRoutes = require("./routes/adminRouter.js");
const userRoutes = require("./routes/userRouter.js");

dbConnection();

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(
	cors({
		origin: "*",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		allowedHeaders: "Content-Type,Authorization",
		preflightContinue: false,
		optionsSuccessStatus: 204,
	})
);

app.options("*", (req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, Access-Control-Allow-Headers"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, PUT, DELETE, OPTIONS"
	);
	res.sendStatus(200);
});

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept , Authorization ,X-Auth-Token ,Access-Control-Allow-Headers"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, PUT, DELETE, OPTIONS"
	);
	next();
});

console.log(`mode: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === "development") {
	app.use(
		morgan("dev", {
			skip: (req) => req.method === "OPTIONS",
		})
	);
}

if (process.env.NODE_ENV === "development") {
	app.use((req, res, next) => {
		const protocol = "http";
		const hostname = "localhost:3000";
		res.locals.baseUrl = `${protocol}://${hostname}`;
		next();
	});
} else {
	app.use((req, res, next) => {
		const protocol = req.headers["x-forwarded-proto"] || req.protocol;
		const hostname = req.headers.host.split(":")[0];
		res.locals.baseUrl = `${protocol}://${hostname}`;
		next();
	});
}

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", isAuth, isRole([{ value: ADMIN }]), adminRoutes);
app.use("/api/v1/user", isAuth, isRole([{ value: "user" }]), userRoutes);

app.use("*", (req, res, next) => {
	next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

app.use(globalError);

module.exports = app;
