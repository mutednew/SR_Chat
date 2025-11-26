import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./socketHandler";


const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    setupSocketHandlers(io);

    server.all(/.*/, (req: Request, res: Response) => {
        return handle(req, res);
    });

    httpServer.listen(port, () => {
        console.log(`> Server ready on http://${hostname}:${port}`);
    });
});

