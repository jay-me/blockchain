const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const { interface, bytecode } = require("../compile");

const web3 = new Web3(ganache.provider());

let accounts;
let inbox;
let INTIAL_MESSAGE = "Hi There!";

beforeEach(async () => {
  // Get a list of all accouonts
  accounts = await web3.eth.getAccounts();

  // Use one of the account to deploy contract
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [INTIAL_MESSAGE],
    })
    .send({
      from: accounts[0],
      gas: "1000000",
    });
});

describe("Inbox contract", () => {
  it("deploys a contract", () => {
    assert.ok(inbox.options.address);
  });

  it("has a default massage value", async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INTIAL_MESSAGE);
  });

  it("can change message", async () => {
    await inbox.methods.setMessage("new message").send({
      from: accounts[0],
    });

    const message = await inbox.methods.message().call();
    assert.equal(message, "new message");
  });
});
