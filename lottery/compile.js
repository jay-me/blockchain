const fs = require("fs");
const path = require("path");

const solc = require("solc");

const lotteryPath = path.join(__dirname, "contracts", "Lottery.sol");

const source = fs.readFileSync(lotteryPath, "utf8");

module.exports = solc.compile(source, 1).contracts[":Lottery"];
