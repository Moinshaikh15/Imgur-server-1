const express = require("express");
require("dotenv").config();

const drive = require("./Routes/drive");
const imgur = require("./Routes/imgur");

const cors = require("cors");

let app = express();

//middle wares
app.use(cors({ origin: "*" }));
app.use(express.json());

// api routes
app.use("/upload", imgur);
app.use("/get", drive);

app.listen(process.env.PORT || 3001);
