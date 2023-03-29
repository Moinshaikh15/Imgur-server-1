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

  var query = `'${folderId}' in parents and trashed = false`;
  drive.files.list(
    { q: query, fields: "files(*)" },
    function (error, response) {
      if (error) {
        return res.send(error);
      }
      //console.log(response);
      let resultArr = [];
      response.data.files.forEach(function (item) {
        let obj = {};
        obj.name = item.name;
        obj.downloadLink = item.webContentLink;
        obj.viewLink = item.webViewLink;
        resultArr.push(obj);
      });
      return res.json(resultArr);
    }
  );
});

module.exports = router;
