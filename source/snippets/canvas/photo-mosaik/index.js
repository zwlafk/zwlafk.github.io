const http = require('http');
const genPhotoMosaikBase64Data = require('./src/genPhotoMosaik')

const server = async () => {
    let data = await genPhotoMosaikBase64Data()
    http.createServer(function (request, response) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(`<img src=${data} />`);
    }).listen(8888);
}
server()