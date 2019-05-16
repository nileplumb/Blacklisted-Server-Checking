const moment = require('moment')
const Discord = require('discord.js')
const username = member => member.nickname || member.user.username
const config = require('./files/blacklist_config.json')

// timestamp based on set timezone
function postTime () {
  const timezone = config.Timezone
  let timeNow = new Date().getTime()
  if (!timezone || timezone === 'GMT' || timezone == null) return moment.tz(timeNow, timezone).format('dddd, MMMM Do, h:mm A') + ' GMT'
  return moment.tz(timeNow, timezone).format('dddd, MMMM Do, h:mm A')
}

const Success = message => new Discord.RichEmbed().setColor('00ff00')
  .setDescription(message)
  .setFooter(postTime())

const Warning = message => new Discord.RichEmbed().setColor('00ff00')
  .setDescription(message)
  .setFooter(postTime())

module.exports = {
  // messages sent to the command channel in corresponding home server
  command: {
    joinedHome: (member, foundServers) => Warning('New member is in blacklisted servers.')
      .setAuthor(`${username(member)} (${member.id})`, member.user.displayAvatarURL)
      .addField('Blacklisted server(s):', foundServers.join('\n')),

    joinedBlacklisted: (member, foundServers) => Warning('Member has joined a blacklisted server.')
      .setAuthor(`${username(member)} (${member.id})`, member.user.displayAvatarURL)
      .addField('Blacklisted server(s):', foundServers.join('\n')),

    leftBlacklisted: (member, foundServers) => Success(`Member has left ${member.guild.name}`)
      .setAuthor(`${username(member)} (${member.id})`, member.user.displayAvatarURL)
      .addField('Remaining blacklisted server(s):', foundServers.join('\n')),

    leftAllBlacklisted: member => Success('No longer a member of any Blacklisted Servers.')
      .setAuthor(`${username(member)} (${member.id})`, member.user.displayAvatarURL),

    foundMemberInBlacklisted: (member, foundServers) => Warning('Found a member of blacklisted servers')
      .setAuthor(`${username(member)} (${member.id})`, member.user.displayAvatarURL)
      .addField('Blacklisted server(s):', foundServers.join('\n')),

    foundXMembersInBlacklisted: count => Warning(`${count} members were found in blacklisted servers`),

    leftHome: member => Success(`${username(member)} has decided to leave our server.`),
    warnedSuccess: member => Success(`Warned ${username(member)}.`),
    kickedSuccess: member => Success(`Kicked ${username(member)}.`),
    bannedSuccess: member => Success(`Banned ${username(member)}.`),
    taggedSuccess: member => Success(`Tagged ${username(member)}.`),
    nicknamedSuccess: member => Success(`Nicknamed ${username(member)}.`),

    noPermissions: () => Warning('You do not have permission to use that command.'),
    invalidCheck: () => Warning('Check target not found.'),
    userWhitelisted: () => Warning('This user is whitelisted.'),
    userClean: () => Success('This user is not in any blacklisted servers.')
  },
  // messages sent to the user
  user: {
    memberInBlacklistedWarning: (member, foundServers) => Warning(config.Joined_My_Server_While_In_Spoof_Servers_Warning
      .replace(/%SERVERNAME%/g, member.guild.name)
      .replace(/%TIMETILPUNISH%/g, config.Minutes_Til_Punish))
      .setThumbnail('https://i.imgur.com/fE3yYLz.jpg?1')
      .addField('Blacklisted server(s):', foundServers.join('\n')),

    joinedBlacklisted: (member, foundServers) => Warning(config.Joined_Spoof_Server_While_In_My_Server_Warning
      .replace(/%SPOOFSERVERS%/g, foundServers.join(', '))
      .replace(/%SERVERNAME%/g, member.guild.name)
      .replace(/%TIMETILPUNISH%/g, config.Minutes_Til_Punish))
      .setThumbnail('https://i.imgur.com/gXw71sr.jpg?1'),

    manuallyChecked: (member, foundServers) => Warning(config.Manual_Check_Warning
      .replace(/%SPOOFSERVERS%/g, foundServers.join(', '))
      .replace(/%SERVERNAME%/g, member.guild.name)
      .replace(/%TIMETILPUNISH%/g, config.Minutes_Til_Punish))
      .setThumbnail('https://i.imgur.com/gXw71sr.jpg?1'),

    leftBlacklisted: member => Success(config.Left_Spoof_Message
      .replace(/%SERVERNAME%/g, member.guild.name))
      .setThumbnail('https://i.imgur.com/UtIms4t.jpg'),

    kicked: (member, foundServers) => Warning(config.Kicked_Message
      .replace(/%SPOOFSERVERS%/g, foundServers.join(', '))
      .replace(/%SERVERNAME%/g, member.guild.name))
      .setThumbnail('https://i.imgur.com/Qa1ik69.jpg?1'),

    banned: (member, foundServers) => Warning(config.Banned_Message
      .replace(/%SPOOFSERVERS%/g, foundServers.join(', '))
      .replace(/%SERVERNAME%/g, member.guild.name))
      .setThumbnail('https://i.imgur.com/Qa1ik69.jpg?1'),

    tagged: (member, foundServers) => Warning(config.Roletagged_Message
      .replace(/%SPOOFSERVERS%/g, foundServers.join(', '))
      .replace(/%SERVERNAME%/g, member.guild.name))
      .setThumbnail('https://i.imgur.com/Qa1ik69.jpg?1'),

    nicknamed: (member, foundServers) => Warning(config.Nicknamed_Message
      .replace(/%SPOOFSERVERS%/g, foundServers.join(', '))
      .replace(/%SERVERNAME%/g, member.guild.name))
      .setThumbnail('https://i.imgur.com/Qa1ik69.jpg?1'),
  }
}
