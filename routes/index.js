const express = require('express');
const router = express.Router();
const Twit = require('twit');
const config = require('../config.js');
const T = new Twit(config);
const io = require('socket.io');
const moment = require('moment');

router.use((req, res, next) => {
  T.get('account/verify_credentials', {skip_status: true})
        .catch(function (err) {
            console.log('caught error at getting credentials', err.stack)
        })
        .then(function (result) {
            let data = result.data;
            req.userName = data.screen_name;
            req.profileImage = data.profile_image_url;
            req.name = data.name;
            req.friendsCount = data.friends_count;
            req.profile_banner_url = data.profile_banner_url;
        });

    setTimeout(next, 1000);
});

router.use((req, res, next) => {
  T.get("statuses/user_timeline", {screen_name: req.userName, count: 5},
        function (err, data, response) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                req.tweets = data;
            }

        });
    setTimeout(next, 1000);
});

router.use((req, res, next) => {
  T.get("friends/list", {screen_name: req.userName, count: 5},
        function (err, data, response) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                req.friends = data.users;
            }
        });
    setTimeout(next, 1000);
});

router.use((req, res, next) => {
  T.get("direct_messages/sent", {count: 5}, function (err, data, response) {
         if (err) {
             console.log(err);
             throw err;
         } else {
             req.messages = data;
         }
     });
     setTimeout(next, 1000);
});

router.get('/', (req, res) => {
  res.render('layout', {
    userName: req.userName,
    profileImage: req.profileImage,
    name: req.name,
    friendsCount: req.friendsCount,
    tweets: req.tweets,
    friends: req.friends,
    messages: req.messages,
    profile_banner_url: req.profile_banner_url
  });
  io.on('connection', function (socket) {
    socket.emit('sendUserName', req.userName);
    socket.emit('sendName', req.name);
    socket.emit('sendProfileImage', req.profileImage);
  });
});

module.exports = router;
