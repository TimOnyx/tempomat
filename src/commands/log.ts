import { Command, flags } from '@oclif/command'
import { appName } from '../appName'
import { trimIndent } from '../trimIndent'
import tempo from '../tempo'
import globalFlags from '../globalFlags'

export default class Log extends Command {
    static description = '[or l], add a new worklog using duration or interval (abc-123 15m or abc-123 11-12:30)'

    static examples = [
        `${appName} log abc-123 1h `,
        `${appName} l abc-123 1h `,
        `${appName} log abc-123 15m `,
        `${appName} log abc-123 1h15m `,
        `${appName} log abc-123 11-14`,
        `${appName} log abc-123 11-14:30`,
        `${appName} log abc-123 11:35-14:20 `,
        `${appName} log abc-123 11.35-14.20 `,
        `${appName} log abc-123 1h15m 2019-02-17`,
        `${appName} log abc-123 1h15m y`,
        `${appName} log abc-123 1h15m yesterday`,
        `${appName} log abc-123 1h15m -d "worklog description"`,
        `${appName} log abc-123 1h15m --start 10:30`,
        `${appName} log abc-123 1h15m -s 9`
    ]

    static aliases = ['l']

    static flags = {
        help: flags.help({ char: 'h' }),
        debug: flags.boolean(),
        description: flags.string({
            char: 'd',
            description: 'worklog description'
        }),
        start: flags.string({
            char: 's',
            description: 'start time (HH:mm format), used when the input is a duration'
        }),
        'remaining-estimate': flags.string({
            char: 'r',
            description: 'remaining estimate'
        }),
        worklogType: flags.enum({
            char: 'w',
            description: 'worklog type',
            options: [
                /* eslint-disable no-multi-spaces */
                'TicketWriting',                // "Ticket Writing/Analysis",
                'Analysis',                     // "Investigation/Technical Support/Research",
                'Development',                  // "Development/Deployment",
                'CodeReview',                   // "Code Review",
                'ManualTesting',                // "Manual Testing",
                'Rework',                       // "Rework Development/Test",
                'UnitTestWriting',              // "Unit Test Writing",
                'AutomationTestWriting',        // "Automation Test Writing",
                'Overhead:AdministrativeTasks', // "ISO2K1 Registrations/OV-408: SCRUM Meetings",
                'Overhead:Meetings'             // "OV-57: NON-TICKET-SPECIFIC Worklogs"
                /* eslint-enable no-multi-spaces */
            ]
        })
    }

    static args = [
        {
            name: 'issue_key_or_alias',
            description: 'issue key, like abc-123 or alias',
            required: true
        },
        {
            name: 'duration_or_interval',
            description: 'worklog duration (e.g 15m) or interval (e.g 11:30-14)',
            required: true
        },
        {
            name: 'when',
            description: trimIndent(`date to add worklog, defaulted to today
      * date in YYYY-MM-DD format
      * y as yesterday`),
            required: false
        }
    ]

    async run() {
        const { args, flags } = this.parse(Log)
        globalFlags.debug = flags.debug
        await tempo.addWorklog({
            issueKeyOrAlias: args.issue_key_or_alias,
            durationOrInterval: args.duration_or_interval,
            when: args.when,
            description: flags.description,
            startTime: flags.start,
            remainingEstimate: flags['remaining-estimate'],
            attributes: flags.worklogType ? {
                _WorklogTypes_: flags.worklogType
            } : undefined
        })
    }
}
