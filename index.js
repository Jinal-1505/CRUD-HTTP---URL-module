const http = require("http");
const url = require('url');
const queryString = require('querystring');
const host = "localhost";
const port = "3000";
const users = [
    { email: "abc@gmail.com", name: "abc", age: 20 },
    { email: "jinny@gmail.com", name: "Jinny", age: 22 }
]
const server = http.createServer((req, res) => {
    // const method = req.method;
    const { pathname, query } = url.parse(req.url);
    const { email } = queryString.parse(query);

    switch (req.method) {
        // Handle GET requests==read
        case 'GET':
            if (pathname === '/') {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(users));
            }
            //handle GET perticuler user
            else if (pathname === '/user' && email) {
                const user = users.find(u => u.email);
                if (user) {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);
                    res.end(JSON.stringify(user));
                }
                else {
                    return handleError(res, 404);
                }
            }
            else {
                return handleError(res, 404);
            }
            break;
        //handle create
        case 'POST':
            if (pathname === '/') {
                let b = '';
                req.on('data', chunks => {
                    b = b + chunks.toString();
                });
                req.on('end', () => {
                    const user = JSON.parse(b);
                    if (users.find(u => u.email === user.email)) {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        res.end();
                    }
                    else {
                        users.push(user);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end();
                    }
                });
            } else {
                return handleError(res, 404);
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
                    const index = users.findIndex(u => u.email === email);
                    if (index >= 0) {
                        users[index] = { ...user, email }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end();
                    } else {
                        return handleError(res, 404);
                    }

                });
            }
            else {
                return handleError(res, 404);
            }
            break;
        //handle delete
        case 'DELETE':
            if (pathname === '/user' && email) {
                const index = users.findIndex(u => u.email === email);
                if (index >= 0) {
                    users.splice(index, 1);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end();
                }
                else {
                    return handleError(res, 404);
                }
            }
            else {
                return handleError(res, 404);
            }
            break;
    }
});
// Start the server
server.listen(port, host, () => {
    console.log("server is running on port 3000");
});
//handling error
function handleError(res, code) {
    res.statusCode = code;
    res.end(`{"error"}`);
}