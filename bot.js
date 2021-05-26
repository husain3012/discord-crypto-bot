// jshint esversion:8
// Add to your server: https://discord.com/oauth2/authorize?client_id=846618544560144394&scope=bot
// permission integer:3959946304

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
let topCoins = ["btc", "eth", "doge"];

client.on("ready", (err) => {
  if (!err) {
    console.log("Bot connected");
    let i =0;
    setInterval(function(){
      console.log("making api request");
      axios.request(options).then(function(response){
        let array = response.data;
        array.every((obj) => {
          if (obj.symbol === topCoins[i]) {
            client.user.setActivity(_.toUpper(obj.symbol) + " @ " + _.toUpper(base_curr) + formatNumber(obj.current_price) );
            if(i<topCoins.length){
              i +=1;
            }
            else(i = 0)
            
            return false;
          } else {
            return true;
          }
        });

      })
      
    }, 30000)
  }
});

client.on("message", (msg) => {
  let command = msg.content.slice(0, 5);
  if (msg.content.slice(0, 5) === "stonk") {
    let coin = msg.content.slice(5);
    axios
      .request(options)
      .then(function (response) {
        let array = response.data;
        array.every((obj) => {
          if (obj.symbol === coin) {
            let desc = messageGenerator(obj);
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


function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function sendEmbedMessage(embedObj, message) {
  let Embed = new Discord.MessageEmbed()
    .setTitle(embedObj.name)
    .setColor(0x02475e)
    .setDescription(message)
    .setThumbnail(embedObj.image);
  return Embed;
}

function messageGenerator(obj) {
  return "High(24h): " + formatNumber(obj.high_24h) + ",   Low(24h): " + formatNumber(obj.low_24h) + ",   Current Price: " + formatNumber(obj.current_price);
}

client.login(process.env.BOTTOKEN);
