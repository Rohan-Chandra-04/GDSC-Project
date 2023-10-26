//Code written by: Rohan Chandra R
//Date: 20/10/2023
//Description: This project was done as part of recruitment process of GDSC NITK.In this project, my backend will make
// a request to GitHub GraphQL API to fetch the user's profile data and display it on the frontend.

const express = require('express'); //  'express' module to create a web server
const axios = require('axios');  //axios module to make HTTP requests
const bodyParser = require('body-parser'); // Import the 'body-parser' module to get user input data from form
const path = require('path'); // Import the 'path' module for file paths
const ejs = require('ejs'); // Import EJS templating engine

const app = express();
const port = 3000;

// Middleware to parse JSON and form data request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Set the static assets directory (e.g. stylesheets, images, etc)

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // I follow this setup of 'views' folder for EJS templates

// This is my personal access token to authenticate with github graphql api
const accessToken = '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';

// GitHub GraphQL API endpoint
const apiUrl = 'https://api.github.com/graphql';

app.get("/", (req, res) => {
    res.render('index'); // to render EJS template named as 'index.ejs'
});

app.post('/', async (req, res) => {
    // Get the GraphQL query from the request body
    var userName = req.body.userKaName; //input of username from ejs template
    console.log(userName); //checking whether i received username from template or not
    // I want to make a function call to my fetchData function here
    try {
        const dataFeed = await fetchData(apiUrl, accessToken, userName);
         console.log(dataFeed);  //to check whether i received data from github api or not
        res.render('index', { data : dataFeed }); //passing the data to ejs template to display
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


// I used this seperate function to fetch data from github grphql api since it was returning an error when 
// query was written in post request. I tried to solve it but couldn't so i used this function to fetch data
async function fetchData(apiUrl, accessToken, userName) {
    // this is Graphql query obtained with help of github api explorer, github documentation and stackoverflow
    const query = `
    query {
      user(login: "${userName}") {
        login
        name
        avatarUrl
        email
        repositories(first: 4, orderBy: { field: CREATED_AT, direction: DESC }) {
          nodes {
            name
            description
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    `;
    //using axios to send my query to github graphql api
    try {
        const response = await axios.post(apiUrl, { query }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        return response.data.data; // Return the GraphQL response data
    } catch (error) {
        throw error;
    }
}

app.listen(port, () => {
    console.log(`Express server is running on port ${port}`);
});


