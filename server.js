const express = require('express');
const http = require('http');

const API = require('./api');
const dbConnect = require('./config/db_config');

require('dotenv').config();
const PORT = process.env.PORT;

const app = express();

const server = http.createServer(app);
new dbConnect();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use('/uploads', express.static('uploads'));


new API(app).registerGroups();

server.listen(PORT, () => console.log(`Server Port ${PORT}`));