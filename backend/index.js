const express = require('express')
const cors = require('cors')
const myconn = require('express-myconnection')
const app = express()
const mysql = require('mysql2')
const path = require('path')

require("dotenv").config;

// const urlDB = `mysql://root:ZrRnEuBTNJGXvADOLaDdaKxavknIWOJG@monorail.proxy.rlwy.net:25876/railway`

const urlDB = `${process.env.MYSQL_URL}`

app.use(myconn(mysql,
    // {
    //     host: process.env.DB_HOST,
    //     port: process.env.PORT,
    //     user: 'root',
    //     password: "dhanyaKUMARVG@77",
    //     database: 'images'
    // }
    urlDB
))

app.use(cors())
app.use(express.static(path.join(__dirname, 'dbImages')))

app.use(require('./routes/routes'))

app.listen(9000, () => {
    console.log('Server running on', 'http://localhost:' + 9000)
})