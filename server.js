const express = require("express");
const http = require("http");
const httpProxy = require("http-proxy");

const app = express();

const server = http.createServer(app);

const proxy = httpProxy.createProxyServer({
    ws: true,
    changeOrigin: true,
    secure: true
});

const TARGET = "https://kali.rohityerra.xyz";


// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/health", (req, res) => {
    res.status(200).send("Kali Render Gateway OK");
});


// --------------------------------------------------
// Proxy normal HTTP requests
// --------------------------------------------------

app.use((req, res) => {

    console.log("HTTP:", req.method, req.url);

    proxy.web(
        req,
        res,
        {
            target: TARGET
        },
        (err) => {

            console.error("HTTP proxy error:", err);

            if (!res.headersSent) {
                res.status(502).send("Gateway error");
            }
        }
    );
});


// --------------------------------------------------
// Proxy WebSocket connections
// --------------------------------------------------

server.on("upgrade", (req, socket, head) => {

    console.log("WebSocket:", req.url);

    proxy.ws(
        req,
        socket,
        head,
        {
            target: TARGET
        },
        (err) => {

            console.error("WebSocket proxy error:", err);

            socket.destroy();
        }
    );
});


// --------------------------------------------------
// Start server
// --------------------------------------------------

const PORT = process.env.PORT || 10000;

server.listen(PORT, "0.0.0.0", () => {

    console.log(`Render gateway listening on port ${PORT}`);

});
