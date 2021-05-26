// jshint esversion:8

// permission integer:3959946304

const Discord = require("discord.js");
const axios = require("axios");
const _ = require("lodash");
require("dotenv").config();

const client = new Discord.Client();
let base_curr="inr";
var options = {
  method: "GET",
  url: "https://coingecko.p.rapidapi.com/coins/markets",
  params: { vs_currency: base_curr, page: "1", per_page: "100", order: "market_cap_desc" },
  headers: {
    "x-rapidapi-key": process.env.COINGECKOKEY,
    "x-rapidapi-host": "coingecko.p.rapidapi.com",
  },
};

client.on("ready", (err) => {
  if (!err) {
    console.log("Bot connected");
  }
});

client.on("message", (msg) => {
  let command = msg.content.slice(0,5);
  if (msg.content.slice(0, 5) === "stonk") {
    let coin = msg.content.slice(5);
    axios
      .request(options)
      .then(function (response) {
        let array = response.data;
        array.every((obj) => {
          if (obj.symbol === coin) {
           let desc =  messageGenerator(obj);
           msg.channel.send(sendEmbedMessage(obj, desc));
            return false;
          } else {
            return true;
          }
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }
});

function sendEmbedMessage(embedObj, message) {
  let Embed = new Discord.MessageEmbed()
  .setTitle(embedObj.name)
  .setColor(0x02475e)
  .setDescription(message)
  .setThumbnail(embedObj.image);
  return Embed;
}

function messageGenerator(obj) {
  return "High(24h): " + obj.high_24h + ",   Low(24h): " + obj.low_24h + ",   Current Price: " + obj.current_price;
}

client.login(process.env.BOTTOKEN);
