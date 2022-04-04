import { client } from '..'
import Command from '../interfaces/Command'
import { I, D } from '../aliases/discord.js'
import { MessageActionRow, MessageButton, ApplicationCommandOptionType, MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'
import cheerio from 'cheerio'

/** 핑 명령어 */
export default class PingCommand implements Command {
  /** 실행되는 부분입니다. */
  async run (interaction: I) {
    const response = await fetch(encodeURI(`https://uniteapi.dev/p/` + interaction.options.data[0].value))
    const responseString = await response.text()
    const $ = cheerio.load(responseString)
    const container = $('#content-container > div ').text()
    const history = $('#content-container > div > div:nth-child(2) > div > div > div:nth-child(2)').text()
    const pokemonUsage = $('#content-container > div > div:nth-child(3) > div > div > div:nth-child(1) > div:nth-child(1) > p').text()
    console.log(history)
    const data ={
        name:<String> interaction.options.data[0].value,
        FPpoint:<String> container.match(/FP-points\d{1,3}/)?.[0].match(/\d{1,3}/)?.[0],
        level:<String> container.match(/LevelLvl \d{1,2}/)?.[0].match(/\d{1,2}/)?.[0],
        freindCode:<String> container.match(/#[A-Z0-9]{7}/)?.[0],
        totalBattles:<any> container.match(/Total Battles\d{1,}/)?.[0].match(/\d{1,}/)?.[0],
        numberOfwins:<any> container.match(/No. Of Wins\d{1,}/)?.[0].match(/\d{1,}/)?.[0],
        winRate: container.match(/Win Rate\d{1,3}/)?.[0].match(/\d{1,3}/)?.[0],
        rank: container.match(/\dRank(.*?)Level/)?.[1].replaceAll('Master','마스터컵').replaceAll('Ultra','액스퍼트컵').replaceAll('Veteran','앨리트컵').replaceAll('Expert','하이퍼컵').replaceAll('Great','슈퍼컵').replaceAll('Beginner','비기너컵').replaceAll('Class','클래스'),
        rankIcon: `https://uniteapi.dev${container.match(/srcSet="(.*?) /)?.[1]}`.replaceAll('&amp','').replaceAll('?','&').replaceAll(';','?'),
        rating: container.match(/loading="lazy"\/>(\d{4})FP/)?.[1]
    }
    // .replaceAll('Master','마스터컵').replaceAll('Expert','액스퍼트컵').replaceAll('Elite','앨리트컵').replaceAll('Great','하이퍼컵').replaceAll('Super','슈퍼컵').replaceAll('Beginner','비기너컵').replaceAll('Class','클래스')
    console.log(data)
    if(!data.FPpoint || !data.level || !data.freindCode ) return await interaction.editReply({content: `사용자명 **${data.name}**의 검색결과가 없습니다`})
    const embed = new MessageEmbed()
        .setColor('#7e27b0')
        .setTitle(`${data.name}(${data.freindCode}) 님의 전적`)
        .addField('🇱 🇻 레벨', data.level as string, true)
        .addField('🫂 페어플레이 포인트',data.FPpoint as string, true)
        .addField('🏆 랭크', !data.rank ? '랭크매치 미참가' : `${data.rank} ${data.rating ? ` ${data.rating}점`: `` }`, true)
        .addField('⚔️ 전투 횟수', data.totalBattles as string, true)
        .addField('🏅 우승 횟수', data.numberOfwins as string, true)
        .addField('승률', data.winRate + '%', true)
    await interaction.editReply({ embeds:[embed] })
  }

  /** 해당 명령어의 대한 설정입니다. */
  metadata = <D>{
    name: 'record',
    description: '포켓몬 유나이트 유저 전적을 검색합니다',
    options: [
      {
        type: 3,
        name: 'nickname',
        description: '포켓몬유나이트 유저 닉네임',
        required: true
      }
    ]
  }
}
