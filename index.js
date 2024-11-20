// Required Modules
const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

// Load Templates
const templatesDir = `${__dirname}/templates`;
const tempOverview = fs.readFileSync(`${templatesDir}/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${templatesDir}/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${templatesDir}/template-product.html`, 'utf-8');

// Load Data
const dataPath = `${__dirname}/dev-data/data.json`;
const data = fs.readFileSync(dataPath, 'utf-8');
const dataObj = JSON.parse(data);

// Generate Slugs
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log('Generated slugs:', slugs);

// Create Server
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Helper to send response
  const sendResponse = (statusCode, headers, content) => {
    res.writeHead(statusCode, headers);
    res.end(content);
  };

  // Routes
  if (pathname === '/' || pathname === '/overview') {
    // Overview Page
    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    sendResponse(200, { 'Content-Type': 'text/html' }, output);

  } else if (pathname === '/product') {
    // Product Page
    const product = dataObj[query.id];
    if (product) {
      const output = replaceTemplate(tempProduct, product);
      sendResponse(200, { 'Content-Type': 'text/html' }, output);
    } else {
      sendResponse(404, { 'Content-Type': 'text/html' }, '<h1>Product not found!</h1>');
    }

  } else if (pathname === '/api') {
    // API Endpoint
    sendResponse(200, { 'Content-Type': 'application/json' }, data);

  } else {
    // 404 Not Found
    sendResponse(
      404,
      {
        'Content-Type': 'text/html',
        'X-Custom-Header': 'Page-Not-Found'
      },
      '<h1>Page not found!</h1>'
    );
  }
});

// Start Server
const PORT = 8000;
const HOST = '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log(`Server is listening on http://${HOST}:${PORT}`);
});