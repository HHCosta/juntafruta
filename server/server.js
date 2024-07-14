const express       = require('express');
const bodyParser    = require("body-parser");
const cors          = require("cors");
const mysql         = require('mysql');
const dbOptions     = require('./db.json');

const app       = express();
const port      = 3000;

app.use(cors());
app.use(bodyParser.json());

const con = mysql.createConnection(dbOptions);

app.post('/savecoleta', (req, res) => {
    const coleta = req.body;
    console.log(coleta);

    con.connect(function(err) {
        if (err)
        {
            console.log(err);

            res.status(500).send({
                "status": err
            });

            con.end();
            return;
        }

        console.log("Connected!");
        
        const sqlInsert = `
            INSERT INTO coletas(device_id, endereco, peso, itens_coleta, nome, phone)
            VALUES(?, ?, ?, ?, ?, ?)
        `;

        const sqlInsertValues = [coleta.deviceid, coleta.endereco, coleta.peso, coleta.itens_coleta, coleta.nome, coleta.phone];

        con.query(sqlInsert, sqlInsertValues, function (err, result) {
            if (err)
            {
                console.log(err);

                res.status(500).send({
                    "status": err
                });

                con.end();
                return;
            }

            // console.log("Result: " + result);

            res.status(200).send({
                "status": "OK"
            });

            con.end();
        });
    });


})

app.listen(port, () => {
    console.log(`Junta Fruta server listening on port ${port}`)
})