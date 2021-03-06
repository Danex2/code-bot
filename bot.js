const Discord = require("discord.js");
const client = new Discord.Client();
const User = require("./models/User");
const mongoose = require("mongoose");
const utils = require("./utils/utils");
require("dotenv").config();
mongoose.Promise = global.Promise;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async msg => {
  if (msg.author.bot) return;
  let userData = {
    userId: msg.author.id,
    userName: msg.author.username,
    lastCheckin: new Date(),
    daysCompleted: 1,
    startDate: new Date(),
    roundsCompleted: 0,
    totalDaysCompleted: 1
  };
  const user = await User.findOne({ userId: msg.author.id });
  // shit ton of if statements, refactor at some point
  // need a better command handler
  if (
    msg.content === "!join" &&
    msg.channel.type === "dm" &&
    utils.checkUser(user)
  ) {
    await User.create(userData);
    msg.author.send(
      "Nice! You have joined #100DaysOfCode! Check in everyday with !completed to make sure it is logged with the bot. To remove yourself from this event type !remove"
    ); // adding an else here to tell the user they've been registered throws a DiscordAPIError
    // the same thing for everything else too
  } else {
    client.users.get(msg.author.id).send("You've already joined!");
  }
  if (
    msg.content === "!remove" &&
    msg.channel.type === "dm" &&
    !utils.checkUser(user)
  ) {
    User.findOneAndDelete({ userId: msg.author.id }).exec();
    msg.author.send("No longer tracking your progress.");
  }
  if (
    msg.content === "!current" &&
    msg.channel.type === "dm" &&
    !utils.checkUser(user)
  ) {
    msg.author.send(
      `You have completed [${user.daysCompleted}/100] days! Keep it up!`
    );
  }
  if (
    msg.content === "!completed" &&
    msg.channel.type === "dm" &&
    !utils.checkUser(user) &&
    user.lastCheckin.getTime() !== new Date(user.lastCheckin).getTime()
  ) {
    if (user.daysCompleted === 100) {
      User.findOneAndUpdate(
        { userId: msg.author.id },
        { $inc: { roundsCompleted: 1 }, $set: { daysCompleted: 0 } }
      ).exec();
      msg.author.send(
        "Woohoo! You completed a round of #100DaysOfCode! Your progress has been reset so feel free to start over when you want! :D"
      );
    } else {
      User.findOneAndUpdate(
        { userId: msg.author.id },
        { $inc: { daysCompleted: 1, totalDaysCompleted: 1 } }
      ).exec();
      msg.author.send("Day completed! Good job!");
    }
  } else {
    client.users.get(msg.author.id).send("You've already !");
  }
  if (msg.content === "!stats" && user) {
    const embed = new Discord.RichEmbed()
      .setTitle(`#100DaysOfCode stats for ${user.userName}`)
      .setColor(0x00ae86)
      .setFooter(`Generated by: ${client.user.tag} on ${new Date()}`)
      .addField("Current days completed", user.daysCompleted)
      .addField("Rounds completed", user.roundsCompleted)
      .addField("Total days completed", user.totalDaysCompleted);
    msg.author.send({ embed });
  }
  if (msg.content === "!commands") {
    const embed = new Discord.RichEmbed()
      .setTitle(`#100DaysOfCode commands`)
      .setColor(0x00ae86)
      .addField("!join", "Join the event and sets your current day at 1")
      .addField("!completed", "Logs your completed day")
      .addField(
        "!remove",
        "Deletes all of your stats and removes you from the databse"
      )
      .addField(
        "!stats",
        "Shows your current streak, days completed and rounds completed"
      )
      .addField("!current", "Shows your current streak");
    msg.author.send({ embed });
  }
});

mongoose
  .connect("mongodb://localhost:27017/100daysofcode", { useNewUrlParser: true })
  .then(c => {
    console.log("Connected to DB.");
    client.login(process.env.BOT_TOKEN);
  })
  .catch(e => console.error(e));
