const express       = require('express');
const bodyParser    = require("body-parser");
const cors          = require("cors");
const mysql         = require('mysql');
const dbOptions     = require('./db.json');

const app       = express();
const port      = 3000;

app.use(cors());
app.use(bodyParser.json());



app.post('/savecoleta', async (req, res) => {
    const coleta = req.body;
    // console.log(coleta);
   
        
    const sqlInsert = `
        INSERT INTO coletas(device_id, endereco, peso, itens_coleta, nome, phone, status)
        VALUES(?, ?, ?, ?, ?, ?, ?)
    `;

    const sqlInsertValues = [coleta.deviceid, coleta.endereco, coleta.peso, coleta.itens_coleta, coleta.nome, coleta.phone, 0];

    let dbResult;

    try
    {
        dbResult = await runDB(sqlInsert, sqlInsertValues);
    }
    catch(err)
    {
        res.status(500).send({
            "status": err
        });        

        console.log(err);

        con.end();
        return;
    }


    res.status(200).send({
        "status": "OK"
    });


});

app.get('/minhascoletas/:deviceid', async (req, res) => {
    const deviceId = req.params.deviceid;
    const sql = `SELECT * FROM coletas WHERE device_id = ?`;
    const sqlValues = [deviceId];

    const dbResult = await runDB(sql, sqlValues);

    res.status(200).send({
        "coletas": dbResult
    });
});

app.delete('/deletecoleta', async (req, res) => {
    const id = req.body.id;
   
        
    const sqlDelete = `
        DELETE FROM coletas WHERE id = ?
    `;

    const sqlDeleteValues = [id];

    
    try
    {
        await runDB(sqlDelete, sqlDeleteValues);
    }
    catch(err)
    {
        res.status(500).send({
            "status": err
        });        

        console.log(err);

        con.end();
        return;
    }


    res.status(200).send({
        "status": "OK"
    });


});

app.get("/coletas-pendentes", async (req, res) => {
    const sql = `SELECT * FROM coletas WHERE status = 0`;
    const response = await runDB(sql, []);
    res.status(200).send({
        "list": response
    })
})

app.listen(port, () => {
    console.log(`Junta Fruta server listening on port ${port}`)
});

function runDB(sql,sqlValues)
{
    return new Promise((resolve, reject) => {
        const con = mysql.createConnection(dbOptions);

        con.connect(function(err) {
            if (err)
            {
                console.log(err);
    
                reject(err);
    
                con.end();
                return;
            }

            con.query(sql, sqlValues, function (err, result) {
                if (err)
                {
                    console.log(err);
    
                    reject(err);
    
                    con.end();
                    return;
                }
    
                // console.log("Result: " + result);
    
                resolve(result);
    
                con.end();
            });
        });
    });
}