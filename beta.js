// jshint esversion:8
// Add to your server: https://discord.com/oauth2/authorize?client_id=846618544560144394&scope=bot
// permission integer:3959946304
// Get geckocoin API key from:

const Discord = require("discord.js");
const axios = require("axios");
const _ = require("lodash");
const currSymbol = require(__dirname + "/currency-symbol.json");
require("dotenv").config();

const client = new Discord.Client();
let base_curr = "inr";
var options = {
  method: "GET",
  url: "https://coingecko.p.rapidapi.com/coins/markets",
  params: { vs_currency: base_curr, page: "1", per_page: "100", order: "market_cap_desc" },
  headers: {
    "x-rapidapi-key": process.env.COINGECKOKEY,
    "x-rapidapi-host": "coingecko.p.rapidapi.com",
  },
};
let topCoins = ["btc", "eth", "doge", "matic", "xrp"];
let cryptoCoins = [];
let refreshRate = 60;
let lastApiCall = 0;

client.on("ready", (err) => {
  if (!err) {
    console.log("Bot connected");
    
    setInterval(function () {
      let i = 0;
      axios.request(options).then(function (response) {
        let array = response.data;
        let fetchInfo = setInterval(function () {
          array.every((obj) => {
            if (obj.symbol === topCoins[i]) {
              client.user.setActivity(
                _.toUpper(obj.symbol) +
                  " @ " +
                  _.toUpper(base_curr) +
                  " " +
                  formatNumber(obj.current_price, { type: "WATCHING" })
                
              );
              console.log("updatinf acivy");
              if (i < topCoins.length) {
                i += 1;
              } else {
                i = 0;
                clearInterval(fetchInfo);
              }

              return false;
            } else {
              return true;
            }
          });
        }, (refreshRate * 1000) / topCoins.length - 5000);
      });
      console.log("refreshing")
    }, refreshRate * 1000);
  }
});

client.on("message", (msg) => {
  msg.content = _.toLower(msg.content);
  let command = msg.content.split(" ");
  let pre = command[0];
  let attr = command[1];
  if (pre === "stonk") {
    switch (attr) {
      case "help":
        sendHelp(msg);
        break;
      case "set":
        console.log("set");
        break;
      default:
        sendCoinInfo(msg, attr);
        break;
    }
  }
});

function sendCoinInfo(msg, coin) {
  if (cryptoCoins.includes(coin)) {
    msg.channel.send("Fetching Info");
  }

  let found = false;
  console.log(msg.author.username + " is making a get request");
  axios
    .request(options)
    .then(function (response) {
      let array = response.data;
      array.every((obj) => {
        if (obj.symbol === coin) {
          msg.channel.send(sendEmbedMessage(obj));
          found = true;
          return false;
        } else {
          return true;
        }
      });
      if (!found) {
        msg.channel.send("Um, you called?");
      }
    })
    .catch(function (error) {
      console.error(error);
    });
}

function sendHelp(msg) {
  const help = new Discord.MessageEmbed()
    .setTitle("Stonk Commands")
    .setDescription(
      "This bot displays realtime stats in the bot's acitivty section.\nWrite **stonk** followed by your query."
    )
    .addFields(
      { name: "stonk help", value: "Displays this message" },
      { name: "stonk <coin symbol>", value: "Sends latest info about the currency. Example: stonk btc" }
    )
    .setURL("https://github.com/husain3012/discord-crypto-bot");
  msg.channel.send(help);
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function sendEmbedMessage(obj) {
  if (obj.price_change_percentage_24h > 0) {
    color = 0x4aa96c;
  } else {
    color = 0xca8a8b;
  }
  let Embed = new Discord.MessageEmbed()
    .setTitle(obj.name)
    .setColor(color)
    .addFields(
      { name: "High(24h):", value: formatNumber(obj.high_24h) + " " + _.toUpper(base_curr) },
      { name: "Low(24h):", value: formatNumber(obj.low_24h) + " " + _.toUpper(base_curr) },
      { name: "Current Price:", value: formatNumber(obj.current_price) + " " + _.toUpper(base_curr) },
      { name: "%24h:", value: obj.price_change_percentage_24h + " %" }
    )
    .setThumbnail(obj.image);
  return Embed;
}

client.login(process.env.BOTTOKEN);
