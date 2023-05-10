const http = require("http");
const url = require('url');
const queryString = require('querystring');
const host = "localhost";
const port = "3000";
const fs = require('fs');
const file = "db.json";
function readFile() {
    const data = fs.readFileSync(file);
    return JSON.parse(data);
}
function writeFile(data) {
    fs.writeFileSync(file, JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url);
    const { email } = queryString.parse(query);

    switch (req.method) {
        // Handle GET requests==read
        case 'GET':
            if (pathname === '/') {
                const userData = readFile();
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(userData));
            }
            //handle GET perticuler user
            else if (pathname === '/user' && email) {
                const userData = readFile();

                const user = userData.find(u => u.email === email);
                if (user) {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.end(JSON.stringify(user));
                }
                else {
                    return handleError(res, 404, 'User not found');
                }
            }
            else {
                return handleError(res, 404, 'Invalid Url');
            }
            break;
        //handle create
        case 'POST':
            if (pathname === '/') {
                let b = '';
                req.on('data', chunks => {
                    b += chunks.toString();
                });
                req.on('end', () => {
                    const user = JSON.parse(b);
                    const userData = readFile();
                    if (userData.find(u => u.email === user.email)) {
                        // res.writeHead(404, { 'Content-Type': 'application/json' });
                        // res.end("Already Existed...");
                        return handleError(res, 400, 'user already exists');
                    }
                    else {
                        userData.push(user);
                        writeFile(userData);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end("User Created Sucessfully...!!");
                    }
                });
            } else {
                return handleError(res, 404, "Invalid Url");
            }
            break;
        //handle update
        case 'PUT':
            if (pathname === '/user' && email) {
                let b = '';
                req.on('data', chunks => {
                    b = b + chunks.toString();
                });
                req.on('end', () => {
                    const user = JSON.parse(b);
                    const userData = readFile();
                    const index = userData.findIndex(u => u.email === email);
                    if (index >= 0) {
                        userData[index] = { ...user, email }
                        writeFile(userData);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: "Data Updated Successfully...!!" }));
                    } else {
                        return handleError(res, 404, 'User is not found');
                    }

                });
            }
            else {
                return handleError(res, 404, 'Invalid URL');
            }
            break;
        //handle delete
        case 'DELETE':
            if (pathname === '/user' && email) {
                let userData = readFile();
                const index = userData.findIndex(u => u.email === email);
                if (index >= 0) {
                    userData.splice(index, 1);
                    writeFile(userData);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: "Data Deleted Sucessfully..!!!" }));
                }
                else {
                    return handleError(res, 404, 'User not found');
                }
            }
            else {
                return handleError(res, 404, 'Invalid URL');
            }
            break;
    }
});
// Start the server
server.listen(port, host, () => {
    console.log("server is running on port 3000");
});
//handling error
function handleError(res, code, message) {
    res.statusCode = code;
    res.end(JSON.stringify({ error: message }));

}