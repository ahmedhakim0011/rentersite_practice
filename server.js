const express = require('express');
const http = require('http');
const {io} = require("./socket");
const API = require('./api');
const dbConnect = require('./config/db_config');
const { notFound, errorHandler } = require("./middlewears/errorHandling");
require('dotenv').config();
const PORT = process.env.PORT;

const app = express();

const server = http.createServer(app);
io(server);
new dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


new API(app).registerGroups();
app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => console.log(`Server Port ${PORT}`));
