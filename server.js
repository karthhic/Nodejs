const http = require('http');
const {
    parse
} = require('querystring');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/control.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the control database.');
    }
});

let sql = 'SELECT * FROM langs WHERE name IN("test");';

const server = http.createServer((req, res) => {

    function ending() {
        res.end("");
    }
    function ending2() {
        res.end("{}]");
    }

    if (req.url === '/') {
        if (req.method === 'POST') {
            collectRequestData(req, result => {
                //console.log(result);
                db.run(`INSERT INTO langs (name,status,age) values("${result.key}",${result.status},${result.age});`);
                res.write(`
            <!doctype html>
            <html>
            <body>
                <form action="/" method="post">
                	<input type="text" name="key" /><br />
                    <input type="number" name="status" /><br />
                    <input type="number" name="age" /><br />
                    <button>Save</button>
                </form><br>
                <form action="/info" method="post">
                	<input type="text" name="name" /><br />
                    <button>Query</button>
                </form>
            `);
                res.write(`Latest data: ${result.key} ${result.status} ${result.age}<br><br>`);

            });
                //res.end("</body></html>");
                setTimeout(ending, 800);

        } else {
            res.end(`
            <!doctype html>
            <html>
            <body>
                <form action="/" method="post">
                	<input type="text" name="key" /><br />
                    <input type="number" name="status" /><br />
                    <input type="number" name="age" /><br />
                    <button>Save</button>
                </form><br>
                <form action="/info" method="post">
                	<input type="text" name="name" /><br />
                    <button>Query</button>
                </form>
            </body>
            </html>
        `);
        }
    } else if (req.url === '/info') {
        if (req.method === 'POST') {
            collectRequestData(req, result => {
                res.write("[");
                //console.log(result);
                    db.all(`SELECT * FROM langs WHERE name IN("${result.name}");`, [], (err, rows) => {
                      if (err) {
                        throw err;
                      }
                      rows.forEach((row) => {
                          //console.log(row.age, row.status);
                          res.write(`\{status: ${row.status}, age: ${row.age}\},`);
                      })
                   });
                   setTimeout(ending2, 800);
            });
        }
        if (req.method === 'GET') {
            res.end(`
            <!doctype html>
            <html>
            <body>
                <form action="/info" method="post">
                	<input type="text" name="name" /><br />
                    <button>Query</button>
                </form>
            </body>
            </html>
        `);
        }
    } else {
        res.end("oopsi");
    }
});
server.listen(3000);

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if (request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    } else {
        callback(null);
    }
}