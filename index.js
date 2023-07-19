const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require('crypto');
const bodyParser = require('body-parser');
const e = require('express');

const urlEncoder = bodyParser.urlencoded({ extended: false });

require('dotenv').config()

const users = [];
const exercises = []

app.use(cors())
app.use(express.static('public'))
app.use(urlEncoder);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .get((req, res) => {
    res.json(users);
  })
  .post((req, res) => {
    const username =req.body.username;
    const _id = crypto.randomBytes(16).toString('hex');

    const user = { username, _id };
    users.push(user);
    res.json(user);
  })

app.post('/api/users/:_id/exercises', (req, res) => {

  const _id = req.params._id;

  const description = req.body.description;
  const duration = parseInt(req.body.duration, 10);

  let dateObj;
  if (req.body.date == '' || req.body.date == undefined) {
    dateObj = new Date();
  } else {
    dateObj = new Date(req.body.date);
  }
  const date = dateObj.toDateString();
  
  let username;
  users.forEach(user => {
    if (user._id == _id) {
      username = user.username;
    }
  });

  exercises.push({description, duration, date, _id});

  res.json({ username, description, duration, date, _id});
});

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;

  let currentUser;
  for(let i = 0; i < users.length; i++) {
    if (users[i]._id == id) {
      currentUser = users[i];
      break;
    }
  }

  let count = 0;
  const userExercises = [];
  for (let i = 0; i < exercises.length; i++) {
    if (exercises[i]._id == id) {
      if (req.query.limit != undefined) {
        if (req.query.limit == count) {
          break;
        }
      }
      if (req.query.from != undefined) {
        if (Date.parse(req.query.from) > Date.parse(exercises[i].date)) {
          continue;
        }
      }
      if (req.query.to != undefined) {
        if (Date.parse(req.query.to) < Date.parse(exercises[i].date)) {
          continue;
        }
      }
      userExercises.push(exercises[i]);
      count++;
    }
  }
  currentUser['log'] = userExercises;
  currentUser['count'] = count;

  res.json(currentUser);
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
