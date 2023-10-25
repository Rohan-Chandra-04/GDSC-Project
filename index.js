

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
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
app.set('views', path.join(__dirname, 'views')); // Assuming your EJS template is in a 'views' folder

// Replace 'YOUR_GITHUB_ACCESS_TOKEN' with your GitHub personal access token
const accessToken = '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';

// Define the GitHub GraphQL API endpoint
const apiUrl = 'https://api.github.com/graphql';

app.get("/", (req, res) => {
    res.render('index'); // Assuming your EJS template is named 'index.ejs'
});

app.post('/', async (req, res) => {
    // Get the GraphQL query from the request body
    var userName = req.body.userKaName;
    console.log(userName);
    try {
        const dataFeed = await fetchData(apiUrl, accessToken, userName);
         console.log(dataFeed);
         console.log(dataFeed.user.contributionsCollection.contributionCalendar);
        res.render('index', { data : dataFeed });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function fetchData(apiUrl, accessToken, userName) {
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


