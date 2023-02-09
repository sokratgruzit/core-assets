/* 
    Note that you need to create .env file with PORT 
    variable and OCTOKIT variable (token can be created 
    at github account in main:
    
    Settings => Developer settings => Personal access tokens => Tokens(classic)) 
*/

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cors_options = require("./config/cors_options");
const credentials = require("./middleware/credentials");
const { Octokit } = require("@octokit/rest");

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.OCTOKIT
});

const app = express();
app.use(express.json({ extended: true }));
app.use(credentials);
app.use(cors(cors_options));
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.post("/api/core-assets", async (req, res) => {
  const { o, r, p, t } = req.body;

  await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: o, //Owner of the repo (github username)
    repo: r, //Name of the repo
    path: p //Absolute path to file, for example: 'blockchains/aeternity/info/logo.png'
  })
  .then(passed => {
    let response = null;

    if (t === "content") {
      response = Buffer.from(passed.data[t], 'base64').toString();
    } else {
      response = passed.data[t /* Property from response object ('content', 'git_url', 'html_url', etc.) */];
    }
    console.log(passed.data)
    return res.send(response);
  });
});

//Static path
const root = require("path").join(__dirname, "front", "build");
app.use(express.static(root));

async function start() {
  const PORT = process.env.PORT || 5000;

  try {
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
  } catch (e) {
    console.log(`Server Error ${e.message}`);
    process.exit(1);
  }
}

start();
