const express = require("express");
const { google } = require("googleapis");
const path = require("path");

const process = require("process");

let router = express.Router();

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
];
const CREDENTIALS_PATH = path.join(process.cwd(), "service.json");

router.get("/:id", async (req, res) => {
  let folderId = req.params.id;

  //get auth
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });

  //get drive
  const drive = google.drive({
    version: "v3",
    auth,
  });

  let nextPageToken = "";
  var query = `'${folderId}' in parents and trashed = false`;
  let resultArr = [];

  let callback = () => {
    drive.files.list(
      {
        q: query,
        pageToken: nextPageToken,
        fields: "files(name,webContentLink,webViewLink),nextPageToken",
      },
      function (error, response) {
        if (error) {
          return res.send(error);
        }
        response.data.files.forEach(function (item) {
          let obj = {
            name: item.name,
            downloadLink: item.webContentLink,
            viewLink: item.webViewLink,
          };
          resultArr.push(obj);
        });
        if (response.data.nextPageToken) {
          nextPageToken = response.data.nextPageToken;
          callback();
        } else {
          console.log("result array Sent Successfully");
          return res.json(resultArr);
        }
      }
    );
  };
  callback();
});

module.exports = router;
