import { Command, flags } from '@oclif/command'
import { appName } from '../appName'
import { trimIndent } from '../trimIndent'
import globalFlags from '../globalFlags'
import toggl from '../toggl'

export default class FromToggl extends Command {
    static description = '[or ft], print toggl line from provided date (YYYY-MM-DD or \'y\' as yesterday)'

    static examples = [
        `${appName} fromtoggl`,
        `${appName} ft`,
        `${appName} fromtoggl y `,
        `${appName} fromtoggl yesterday `,
        `${appName} fromtoggl 2020-02-17`
    ]

    static aliases = ['ft']

    static flags = {
        help: flags.help({ char: 'h' }),
        debug: flags.boolean()
    }

    static args = [
        {
            name: 'when',
            description: trimIndent(`start date to fetch worklogs, defaulted to today
        * date in YYYY-MM-DD format
        * y as yesterday`),
            required: false
        },
        {
            name: 'until',
            description: trimIndent(`end date to fetch worklogs, defaulted to when
        * date in YYYY-MM-DD format
        * y as yesterday`),
            required: false
        }
    ]

    async run() {
        const { args, flags } = this.parse(FromToggl)
        globalFlags.debug = flags.debug
        const entries = await toggl.listUserWorklogs(args.when, args.until)
        console.log(entries)
    }
}
