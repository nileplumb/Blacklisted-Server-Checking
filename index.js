const Discord = require('discord.js')
const embeds = require('./embeds')
const config = require('./files/blacklist_config.json')

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

const executioner = new Discord.Client({
  disabledEvents: [
    'CHANNEL_PINS_UPDATE', 'MESSAGE_REACTION_REMOVE_ALL', 'PRESENCE_UPDATE', 'VOICE_STATE_UPDATE',
    'TYPING_START', 'VOICE_SERVER_UPDATE', 'RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE'
  ]
})
const userbot = new Discord.Client({
  disabledEvents: [
    'GUILD_CREATE', 'GUILD_DELETE', 'GUILD_UPDATE', 'GUILD_MEMBER_UPDATE', 'GUILD_MEMBERS_CHUNK', 'GUILD_ROLE_CREATE',
    'GUILD_ROLE_DELETE', 'GUILD_ROLE_UPDATE', 'GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'CHANNEL_CREATE', 'CHANNEL_DELETE',
    'CHANNEL_UPDATE', 'CHANNEL_PINS_UPDATE', 'MESSAGE_DELETE', 'MESSAGE_UPDATE', 'MESSAGE_DELETE_BULK', 'MESSAGE_REACTION_ADD',
    'MESSAGE_REACTION_REMOVE', 'MESSAGE_REACTION_REMOVE_ALL', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'USER_SETTINGS_UPDATE',
    'PRESENCE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE', 'RELATIONSHIP_ADD', 'RELATIONSHIP_REMOVE'
  ]
})
const punish = require('./punish')(executioner, userbot)

executioner.on('ready', () => console.info('[Blacklist] Executioner is ready to enact your will.'))
userbot.on('ready', () => {
  console.info(`[Blacklist] Now Checking ${userbot.guilds.size - config.Home_Server_IDs.length} Blacklisted Servers.`)
  userbot.user.setPresence({ 'status': 'invisible' })
})

const homeServers = config.Home_Server_IDs.map(guildID => executioner.guilds.get(guildID))
const commandChannels = config.Command_Channels.map(channel => executioner.channels.get(channel))

function isWhitelisted (member) {
  return config.Whitelist_Roles.some(role => member.roles.has(role)) || config.Whitelist.includes(member.id)
}

// check the user for spoof servers
function getBlacklistedServersForUser (userID) {
  const foundServers = []
  for (let guild of userbot.guilds.array()) {
    if (config.Home_Server_IDs.includes(guild.id)) continue
    if (guild.members.has(userID)) foundServers.push(guild.name)
  }
  return foundServers
}

async function checkAfterDelay (member, homeServer, command) {
  const user = executioner.users.get(member.id)

  // if user is no longer in members of the guild, send an info message
  if (!homeServer.members.has(member.id)) return command.send(embeds.command.leftHome(member))

  // check again for the blacklisted servers
  const foundServers = getBlacklistedServersForUser(member.id)
  if (!foundServers.length) return user.send(embeds.user.leftBlacklisted(member))

  return punish(config.Pound_Level, member, command, foundServers)
}

async function handleNewMember (member) {
  const homeServer = member.guild
  const command = commandChannels.find(channel => channel.guild.id === homeServer.id)
  const user = executioner.users.get(member.id)

  const foundServers = getBlacklistedServersForUser(member.id)
  if (!foundServers.length) return

  // send info message to the command channel
  await command.send(embeds.command.joinedHome(member, foundServers))

  // send warning message to the member
  await user.send(embeds.user.memberInBlacklistedWarning(member, foundServers))

  // send "member warned" info message
  await command.send(embeds.command.warnedSuccess(member))

  // check again in after a period of time determined in the config
  await sleep(config.Minutes_Til_Punish * 1000 * 60)
  return checkAfterDelay(member, homeServer, command)
}

async function handleExistingMember (member) {
  if (!homeServers.some(server => server.members.has(member.id))) return

  const homeServer = homeServers.find(server => server.members.has(member.id))
  const command = commandChannels.find(channel => channel.guild.id === homeServer.id)
  const user = executioner.users.get(member.id)

  const foundServers = getBlacklistedServersForUser(member.id)
  if (!foundServers.length) return

  // send info message to the command channel
  await command.send(embeds.command.joinedBlacklisted(member))

  // send warning message to the member
  await user.send(embeds.user.joinedBlacklisted(member, foundServers))

  // send "member warned" info message
  await command.send(embeds.command.warnedSuccess(member))

  // check again in after a period of time determined in the config
  await sleep(config.Minutes_Til_Punish * 1000 * 60)
  return checkAfterDelay(member, homeServer, command)
}

userbot.on('guildMemberAdd', async member => {
  // ignore if they user is on the whitelist
  if (isWhitelisted(member)) return

  // member joined one of the home servers
  if (config.Home_Server_IDs.includes(member.guild.id)) {
    return handleNewMember(member).catch(console.error)
  }
  // member joined one of the blacklisted servers
  else {
    return handleExistingMember(member).catch(console.error)
  }
})

userbot.on('guildMemberRemove', async member => {
  if (isWhitelisted(member)) return
  if (!homeServers.some(server => server.members.has(member.id))) return

  const homeServer = homeServers.find(server => server.members.has(member.id))
  const command = commandChannels.find(channel => channel.guild.id === homeServer.id)

  const foundServers = getBlacklistedServersForUser(member.id)
  if (!foundServers) return command.send(embeds.command.leftAllBlacklisted(member))

  await command.send(embeds.command.leftBlacklisted(member, foundServers))
})

userbot.on('message', async message => {
  if (!config.Command_Channels.includes(message.channel.id)) return
  if (!message.content.startsWith(config.Prefix)) return

  if (!message.member.roles.has(config.AdminRoleID) && !message.member.roles.has(config.ModRoleID) && message.member.id !== config.Owner_ID) {
    await message.channel.send(embeds.command.noPermissions())
    return
  }
  const [ command, ...args ] = message.cleanContent.slice(config.Prefix.length).split(' ')

  if (command === 'check') {
    const [ target ] = args
    if (target === 'server' || target === 'all') {
      console.log('[Blacklist] Starting a check of the entire server.')
      let badMembers = 0

      for (let member of message.guild.members.array()) {
        if (isWhitelisted(member)) continue

        const foundServers = getBlacklistedServersForUser(member.id)
        if (!foundServers) continue

        badMembers++

        await message.channel.send(embeds.command.foundMemberInBlacklisted(member, foundServers))
      }

      if (badMembers > 0) await message.channel.send(embeds.command.foundXMembersInBlacklisted(badMembers))
    } else if (message.guild.members.has(target)) {
      const member = message.guild.members.get(target)
      if (isWhitelisted(member)) return message.channel.send(embeds.command.userWhitelisted())

      const foundServers = getBlacklistedServersForUser(target)
      if (!foundServers.length) return message.channel.send(embeds.command.userClean())

      await message.channel.send(embeds.command.foundMemberInBlacklisted(member, foundServers))
    } else {
      await message.channel.send(embeds.command.invalidCheck())
    }
  }
  if (command === 'restart') {
    process.exit(1)
  }
  if (command === 'warn') {
    const [ target ] = args
    if (message.guild.members.has(target)) {
      const member = message.guild.members.get(target)
      if (isWhitelisted(member)) return message.channel.send(embeds.command.userWhitelisted())

      const foundServers = getBlacklistedServersForUser(target)
      if (!foundServers.length) return message.channel.send(embeds.command.userClean())

      await executioner.users.get(member.id).send(embeds.user.manuallyChecked(member, foundServers))
      await message.channel.send(embeds.command.warnedSuccess())
    } else {
      await message.channel.send(embeds.command.invalidCheck())
    }
  }
})

// BOT LOGIN TO DISCORD
userbot.login(config.User_Token)
executioner.login(config.Bot_Token)
