const express = require("express");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const process = require("process");
const router = express.Router();

const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
];
const CREDENTIALS_PATH = path.join(process.cwd(), "service.json");

//Download Files on server
let downloadFiles = async (driveFiles, drive) => {
  let dirname = __dirname.split("Routes").join("");

  // Create an array of Promises that will resolve when the file is downloaded and read
  const promises = driveFiles.map((item) => {
    return new Promise((resolve, reject) => {
      const url = item.fileLink;
      const fileId = url.split("d/")[1].split("/view")[0];

      //Get the file data using fileID to get file name
      drive.files.get({ fileId: fileId }, (er, re) => {
        // Added
        if (er) {
          console.log(er);
          reject(er);
          return;
        }
        const fileName = re.data.name;
        const filePath = `${dirname}public/${fileName}`;
        const dest = fs.createWriteStream(filePath);
    
        //Get the file stream from drive and save to the desired path.
        drive.files.get(
          { fileId: fileId, alt: "media" },
          { responseType: "stream" },
          function (err, res) {
            if (err) {
              console.log(err);
              reject(err);
            }
            res.data
              .on("end", () => {
                item.serverURL = `${process.env.SERVER_URL}/${fileName}`;
                resolve(item);
              })
              .on("error", (err) => {
                console.error("Error downloading file.");
                reject(err);
              })
              .pipe(dest);
          }
        );
      });
    });
  });

  // Wait for all the Promises to resolve before returning the results
  try {

    const results = await Promise.all(promises);
    return results;
  } catch (err) {
    console.log("Imgur-server-err:", err);
    throw err
  }
};

router.post("/:id", async (req, res) => {
  let fileURLs = req.body.fileURLs;

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
  //console.log("calling downloads", fileURLs);
  let resultURLs = await downloadFiles(fileURLs, drive);
  console.log("result array Sent Successfully");
  return res.json(resultURLs);
});

module.exports = router;
