import http from 'http';
import { app } from './app.js';
import { log } from 'console';

const server = http.createServer(app);
const port = process.env.PORT || 3001;

server.listen(port, () => {
    log(`Server is running on port: ${port}`);
})

// Graceful Shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    console.log('Shutting down server.');
    server.close(() => {
        process.exit(0);
    });
}