const fs = require('fs');
const path = require('path');

const solc = require('solc');

const inBoxPath = path.join(__dirname, 'contracts' , 'Inbox.sol');

const source = fs.readFileSync(inBoxPath, 'utf8');

module.exports = solc.compile(source,1).contracts[':Inbox'];