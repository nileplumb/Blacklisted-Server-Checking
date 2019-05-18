const embeds = require('./embeds')
const config = require('./files/blacklist_config.json')

module.exports = executioner => {
  const kick = async (user, member, command, servers) => {
    await user.send(embeds.user.kicked(member, servers))
    await member.kick('Member of a spoofing server.')
    await command.send(embeds.command.kickedSuccess(member))
  }
  const ban = async (user, member, command, servers) => {
    await user.send(embeds.user.banned(member, servers))
    await member.ban('Member of a spoofing server.')
    await command.send(embeds.command.bannedSuccess(member))
  }
  const role = async (user, member, command, servers) => {
    await user.send(embeds.user.tagged(member, servers))
    await member.addRole(config.Punish_Role_ID, 'Member of a spoofing server.')
    await command.send(embeds.command.taggedSuccess(member))
  }
  const nick = async (user, member, command, servers) => {
    await user.send(embeds.user.nicknamed(member, servers))
    await member.setNickname(`${config.Punish_Nickname_Prefix} ${member.nickname || member.user.username}`, 'Member of a spoofing server.')
    await command.send(embeds.command.nicknamedSuccess(member))
  }

  return async function punish (type = 'KICK', member, command, servers) {
    const user = executioner.users.get(member.id)
    if (type === 'KICK') return kick(user, member, command, servers)
    if (type === 'BAN') return ban(user, member, command, servers)
    if (type === 'ROLE') return role(user, member, command, servers)
    if (type === 'NICK') return nick(user, member, command, servers)
    if (type === 'NICKROLE') {
      await nick(user, member, command, servers)
      await role(user, member, command, servers)
    }
  }
}
