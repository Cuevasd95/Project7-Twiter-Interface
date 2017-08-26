const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const Twit = require('twit');
const router = express.Router();
const mainRoutes = require('./routes');
const io = require('socket.io');
const config = require('./config.js');
let port = process.env.PORT || 3000;

app.use(express.static('public'));
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(router);
app.use(mainRoutes);

app.set('view engine', 'pug');

const T = new Twit(config);

app.use((req, res, next) => {
    let err = new Error('OOOPPPPS Looks like that page doesn\'t exist');
    err.status = 404;
    next(err);
});
app.use((req, res, next) => {
    let err = new Error('Internal Server Error');
    err.status = 500;
    next(err);
});
app.use((err, req, res, next) => {
    res.locals.error = err;
    res.status(err.status);
    res.render('error');
});

/*app.post('/', (req, res, next) => {
  io.on('connection', function (socket) {
      socket.on('message', function (newTweetValue) {
          console.log(newTweetValue);
          T.post('statuses/update', {status: newTweetValue}, function (err, data, response) {
              if (err) {
                  console.log(err);
              }
          });
      });
  });
});*/

app.listen(port, () => {
  console.log('The application is running');
});
