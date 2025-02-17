import { Command, flags } from '@oclif/command'
import { appName } from '../../appName'
import tempo from '../../tempo'
import globalFlags from '../../globalFlags'

export default class FromToggl extends Command {
    static description = 'print aliases list'

    static examples = [
        `${appName} alias:list`
    ]

    static flags = {
        help: flags.help({ char: 'h' }),
        debug: flags.boolean()
    }

    async run() {
        const { flags } = this.parse(FromToggl)
        globalFlags.debug = flags.debug
        tempo.listAliases()
    }
}
