const Discord = require('discord.js');
const Listing = require('./../modules/Listing');
const fs = require('fs');
const settings = require('./../settings.json');
const owner = settings.owner;

module.exports.run = async (bot, message, args) => {
    let voiceChannelID = "594029248486965248"
    let voice_channel = message.guild.channels.get(voiceChannelID);
    let members = message.guild.channels.get(voiceChannelID).members.size;
    let snipeChannel = message.channel;
    const filter = m => !m.author.bot;
    let game = new Listing();

    let raw = fs.readFileSync('./roles.json');
    let allowedRoles = JSON.parse(raw);

    let validation = function(serverRoles, userRoles){
        let val = false;
        serverRoles.forEach((role) => {
            userRoles.forEach((usr) => {
                if (role == usr ){
                    val = true;
                }
            });
        });
        return val;
    }

    let editLast3 = null;
 
    let gamemode = "SOLO";
 
    if (args.length > 0){
        if (args[0].toUpperCase() === "SOLO" ||
            args[0].toUpperCase() === "DUOS" ||
            args[0].toUpperCase() === "SQUADS"){
                gamemode = args[0];
            }
    }
   
    let startMessage = new Discord.RichEmbed()
        .setColor("#00d4ff")
        .setTitle("Scrim Match Starting!")
        .setDescription("Type your Bus Paths here by putting the start of the bus path and the end / last stop location. Ex: junk lazy")
        .addField("Hosted By", `${message.author}`, true)
        .addField("Gamemode", gamemode, true)
        .addField("Game ", "FORTNITE", true)
        .setFooter(`${message.guild.name} / dev: Genetiicツ#6263 `, "https://cdn.discordapp.com/attachments/564622782139465732/597973707801231360/IMG_0210.JPG")
    
    message.channel.send({embed: startMessage});    
 
    let time = 25;
    let editTime = "";
 
    let timeEmbed = new Discord.RichEmbed()
        .setTitle("Next match in aprox...")
        .setDescription(time + " minutes")
        .setColor("#00d4ff");
       
 
    setTimeout(async () => {
        editTime = await message.channel.send({embed: timeEmbed}).catch( (err) => {
            console.log("Cant edit deleted message.")
        });
    }, 10);
 
    let timeInterval = setInterval(() => {
        if (time === 1){
            time -= 1;
            timeEmbed.setDescription(time + " minutes");
            clearInterval(timeInterval);
        } else {
            time -= 1;
            timeEmbed.setDescription(time + " minutes")
        }
 
        editTime.edit({embed: timeEmbed}).catch((err) => {
            console.log("cant edit")
            clearInterval(timeInterval);
        });
 
    },60000);
       
    let last3 = new Discord.RichEmbed()
        .setTitle("Bus Paths")
        .setColor("#00d4ff");
 
    setTimeout(async () => {
        editLast3 = await message.channel.send({embed: last3});
        message.channel.overwritePermissions(message.guild.defaultRole, {
            SEND_MESSAGES: true
 
        }).catch((err) => {
            console.log(err);
        })
 
    }, 10);
 
    const collector = snipeChannel.createMessageCollector(filter, {time: 180000});
 
    collector.on('collect', m => {
        console.log(`Collected ${m.content} | ${m.author.username}`);
 
       
        if (validation(allowedRoles.roles,m.member.roles.array()) || m.member.id === owner){
            if (m.content === "n!start" || m.content === "n!stop"){
                collector.stop();
                console.log("Collector stopped");
                return;
 
               
            }
        }
        if (game.data.length === 0 && m.length){
            game.addID(m.content.toUpperCase(), m.author.username);
        }else if (m.content.length){
            if (game.userPresent(m.author.username)){
                game.deleteUserEntry(m.author.username);
                if (game.idPresent(m.content.toUpperCase())){
                    game.addUser(m.content.toUpperCase(), m.author.username);
                }else{
                    game.addID(m.content.toUpperCase(), m.author.username);
                }
            } else {
                if  (game.idPresent(m.content.toUpperCase())){
                    game.addUser(m.content.toUpperCase(), m.author.username);
                }else {
                    game.addID(m.content.toUpperCase(), m.author.username);
                }
            }
        }
 
 
        game.sort();
 
        let str = " ";
        last3 = new Discord.RichEmbed()
        .setTitle ("Bus Paths")
        .setThumbnail('https://cdn.discordapp.com/attachments/564622782139465732/597973707801231360/IMG_0210.JPG')
        .setColor("#00d4ff")
 
        let playerCount = 0;
        for (var i = 0; i < game.data.length; i++){
        playerCount += game.data[i].users.length;
        }        
        for (var i = 0; i < game.data.length; i++){
            str = " ";
            for (var j = 0; j < game.data[i].users.length ; j++){
                str += game.data[i].users[j] + "\n";
            }
            last3.addField(`${game.data[i].id.toUpperCase()} - ${game.data[i].users.length} PLAYERS`, str, true);
            last3.setFooter(`${game.data.length} Responses | ${playerCount} Players | ${members} Players In ${voice_channel.name}`, "https://cdn.discordapp.com/attachments/564622782139465732/597973707801231360/IMG_0210.JPG")
        }
            editLast3.edit({embed: last3}).catch((err) => {
                console.log("Caught edit error");
            });
 
        if (m.deletable){
            m.delete().catch((err) => {
                console.log("Cant delete")
                console.log(err);
            });
        }
    });
 
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
   
        let endMessage = new Discord.RichEmbed()
        .setTitle("No more Bus Paths accepted at this point")
        .setDescription("Good luck and have fun in your game!")
        .setFooter(`${message.guild.name}`)
        .setColor("#ff0000");
 
        message.channel.send({embed: endMessage});
 
        message.channel.overwritePermissions(message.guild.defaultRole, {
            SEND_MESSAGES: true
        }).catch((err) => {
            console.log(err);
        })
 
    });
 
   
   
 
   
 
   
 
}
 
 
 
module.exports.help = {
    name: "start"
}