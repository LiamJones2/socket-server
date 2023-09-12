const server = require('./server.js');
const PORT = 8080;

server.listen(PORT, () => console.log(`Listening on ${PORT}...`));