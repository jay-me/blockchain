const assert = require("assert");

const ganache = require("ganache-cli");
const Web3 = require("web3");

const { interface, bytecode } = require("../compile");

const web3 = new Web3(ganache.provider());

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[1],
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it("requires a minimum amount of ether", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: "200",
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Can't allow anyone to pick a winner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("Send money to winner and reset playeres array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    // Fetch account balance before picking winner
    const initialBalance = await web3.eth.getBalance(accounts[0]);

    // Picking Winner
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    // Balance after pick winner
    const currBalance = await web3.eth.getBalance(accounts[0]);

    const difference = currBalance - initialBalance;

    const players = await lottery.methods.getPlayers().call({
      from: accounts[1],
    });

    assert(difference > web3.utils.toWei("1.8", "ether"));
    assert(players.length === 0);
  });
});
