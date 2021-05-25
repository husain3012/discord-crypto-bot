// jshint esversion:8

// permission integer:3959946304

const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require("axios");
const _ = require("lodash");
require("dotenv").config();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.content.slice(0, 5) === "stonk") {
    // Send "pong" to the same channel
    let currency = msg.content.slice(5);
    getCrypto(currency);
  }

  function getCrypto(currency) {
    axios.get("https://api.wazirx.com/api/v2/tickers").then((resp) => {
      const json = resp.data;
      if (resp.status === 200) {
        if (currency === "btc") {
          let name = json.btcinr.name;
          let high = json.btcinr.high;
          let low = json.btcinr.low;
          let volume = json.btcinr.volume;

          let message = messageGenerator([name,high,low,volume]);
          msg.channel.send(sendEmbedMessage(name, message));
        } else if (currency === "eth") {
          let name = json.ethinr.name;
          let high = json.ethinr.high;
          let low = json.ethinr.low;
          let volume = json.ethinr.volume;
          let message = messageGenerator([name,high,low,volume]);
          msg.channel.send(sendEmbedMessage(name, message));
        }
      }
    });
  }
});




function sendEmbedMessage(title, message) {
  let Embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setColor(0x02475e)
    .setDescription(message)
    return Embed;
}

function messageGenerator(values) {
  return "High: " + values[1] + ", Low: "+values[2] + ", Volume: " + values[3];
}

client.login(process.env.BOTTOKEN);
