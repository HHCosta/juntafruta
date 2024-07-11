const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors")
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/savecoleta', (req, res) => {
    const coleta = req.body;
    console.log(coleta);
    res.send('OK');
})

app.listen(port, () => {
    console.log(`Junta Fruta server listening on port ${port}`)
})