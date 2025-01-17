const express = require('express');
     const http = require('http');
     const morgan = require('morgan');
     const bodyParser = require('body-parser');
     //Body parser is used to convert string into json format for the request
const hostname = 'localhost';
const port = 3000;

const app = express();

app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());

const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter );
app.use('/leaders', leaderRouter);
const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});