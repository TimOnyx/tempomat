import { DATE_FORMAT, parseWhenArg } from './worklogs/worklogs'
import * as entriesList from './toggl/entriesList'
import chalk from 'chalk'
import cli from 'cli-ux'
import { format } from 'date-fns'
import togglApi from './api/togglapi'
import time from './time'
import { ENV } from './config'
import globalFlags from './globalFlags'

export default {

    async setup() {
        console.log('not implemented')
    },

    async listUserWorklogs(when?: string, until?: string) {
        execute(async () => {
            cli.action.start('Loading worklogs')
            const now = time.now()
            const entries = await togglApi.getEntries({
                since: format(parseWhenArg(now, when), DATE_FORMAT),
                until: format(parseWhenArg(now, until || when), DATE_FORMAT),
                user_agent: ENV.user_agent,
                user_ids: ENV.user_ids,
                workspace_id: ENV.workspace_id
            })
            cli.action.stop('Done.')
            if (globalFlags.debug) {
                console.log('raw entries:')
                console.log('--------------------------------------------')
                entries.data.forEach(item => console.log(item))
                console.log('--------------------------------------------')
            }
            const list = entriesList.render(entries.data)
            console.log('Copy and paste these back into the terminal:')
            console.log('--------------------------------------------')
            list.forEach(item => console.log(item))
            console.log('--------------------------------------------')
        })
    }
}

async function execute(action: () => Promise<void>): Promise<boolean> {
    try {
        await action()
        return true
    } catch (e) {
        showError(e)
        return false
    }
}

function showError(e: Error) {
    cli.action.stop('Error.')
    console.log(chalk.redBright(e.message))
}
