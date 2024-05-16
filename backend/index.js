const express = require('express')
const cors = require('cors')
const myconn = require('express-myconnection')
const app = express()
const mysql = require('mysql2')
const path = require('path')

require("dotenv").config;

const urlDB = `${process.env.MYSQL_URL}`

app.use(myconn(mysql,
    urlDB
))

app.use(cors())


app.use(require('./routes/routes'))



app.listen(process.env.PORT, () => {
    console.log('Server running on' + process.env.PORT)
})