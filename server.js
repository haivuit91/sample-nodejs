const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express();

const connectionString = 'mongodb://127.0.0.1:27017/sample-nodejs';

app.listen(3000, function () {
    console.log('listening on 3000')
})

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(bodyParser.json())

MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('sample-nodejs')
        const userCollection = db.collection('users')

        app.get('/', (req, res) => {
            userCollection.find().toArray()
                .then(results => {
                    res.render('index.ejs', { users: results })
                })
                .catch(/* ... */)
        })

        app.post('/save', (req, res) => {
            let user = req.body

            userCollection.findOne({ userName: user.userName })
                .then(results => {
                    if (results) {
                        userCollection.findOneAndUpdate({
                            userName: user.userName
                        }, {
                            $set: {
                                password: user.password,
                                lastName: user.lastName,
                                firstName: user.firstName
                            }
                        }, {
                            upsert: true
                        })
                            .then(result => res.redirect('/'))
                            .catch(error => console.error(error))
                    } else {
                        userCollection.insertOne(user)
                            .then(result => res.redirect('/'))
                            .catch(error => console.error(error))
                    }
                })
                .catch(/* ... */)
        })

        app.post('/delete', (req, res) => {
            userCollection.deleteOne(
                { userName: req.body.userName }
            )
                .then(result => {
                    if (result.deletedCount === 0) {
                        return res.json('User not found')
                    }
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })
    })
    .catch(error => console.error(error))

