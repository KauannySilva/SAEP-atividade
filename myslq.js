const express = require('express'); 
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: "root",   
    password: "root",
    database: "vw_estoque",
    post: 3307
});

module.exports = connection;