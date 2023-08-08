import { GetEntriesResponseDataItem } from '../api/togglapi'

export function render(entries: GetEntriesResponseDataItem[]) {
    return entries.map(entry => generateContent(entry))
}

function generateContent(entry: GetEntriesResponseDataItem) {
    const {
        description: rawDescription,
        dur,
        start,
        task,
        client,
        project
    } = entry

    if (!client || !task || !project) {
        return 'BAD INPUT, update toggl'
    }

    const ticket = getTicketFromDescription(rawDescription)
    const readableDuration = getReadebleDurationFromMs(dur)
    const date = start.split('T')[0]
    const type = getTypeFromTicketTaskAndDescription(ticket, task, rawDescription)
    const description = removeTicketFromDescription(rawDescription, ticket)

    if (!description) {
        return `tempo l ${ticket} ${readableDuration} ${date} -w ${type}`
    }

    // TODO: extract, add more edge cases like 'write ticket'
    if (type === TYPES.codeReview && description === 'PR') {
        return `tempo l ${ticket} ${readableDuration} ${date} -w ${type}`
    }

    return `tempo l ${ticket} ${readableDuration} ${date} -w ${type} -d "${description}"`
}

const OVERHEAD_TICKETS = {
    scrum: 'OV-408',
    overhead: 'OV-57'
}

function getTicketFromDescription(description: string): string {
    // Scrum
    if (description.toLowerCase().includes('daily')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('monthly')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('demo')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('retro')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('refinement')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('standup')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('planning')) {
        return OVERHEAD_TICKETS.scrum
    }
    if (description.toLowerCase().includes('sprint')) {
        return OVERHEAD_TICKETS.scrum
    }
    // Overhead
    if (description.toLowerCase().includes('research:')) {
        return OVERHEAD_TICKETS.overhead
    }
    if (description.toLowerCase().includes('meeting:')) {
        return OVERHEAD_TICKETS.overhead
    }
    if (description.includes('OSD-')) {
        return OVERHEAD_TICKETS.overhead
    }

    // Includes ticket number
    if (description.includes('QB-')) {
        return description.split(':')[0]
    }
    if (description.includes('CBRS-')) {
        return description.split(':')[0]
    }
    if (description.includes('HSSE-')) {
        return description.split(':')[0]
    }
    if (description.includes('NP-')) {
        return description.split(':')[0]
    }
    if (description.includes('SOPS-')) {
        return description.split(':')[0]
    }
    if (description.includes('ES-')) {
        return description.split(':')[0]
    }
    if (description.includes('OVA-')) {
        return description.split(':')[0]
    }

    return OVERHEAD_TICKETS.overhead
}

const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60
const ONE_HOUR = ONE_MINUTE * 60

function getReadebleDurationFromMs(timeInMs: number): string {
    let duration = ''
    const hours = Math.floor(timeInMs / ONE_HOUR)
    if (hours) {
        duration += `${hours}h`
    }
    if (!(timeInMs % ONE_HOUR)) {
        return duration
    }
    const minutes = Math.round((timeInMs % ONE_HOUR) / ONE_MINUTE)
    if (minutes) {
        if (minutes === 60) {
            return `${hours + 1}h`
        }
        duration += `${minutes}m`
    }
    return duration
}

const TYPES = {
    /* eslint-disable no-multi-spaces */
    ticketWriting: 'TicketWriting',              // "Ticket Writing/Analysis",
    analysis: 'Analysis',                        // "Investigation/Technical Support/Research",
    development: 'Development',                  // "Development/Deployment",
    codeReview: 'CodeReview',                    // "Code Review",
    testing: 'ManualTesting',                    // "Manual Testing",
    rework: 'Rework',                            // "Rework Development/Test",
    unitTesting: 'UnitTestWriting',              // "Unit Test Writing",
    automationTesting: 'AutomationTestWriting',  // "Automation Test Writing",
    scrum: 'Overhead:AdministrativeTasks',       // "ISO2K1 Registrations/OV-408: SCRUM Meetings",
    overhead: 'Overhead:Meetings'                // "OV-57: NON-TICKET-SPECIFIC Worklogs"
    /* eslint-enable no-multi-spaces */
}

const TASKS = {
    analysis: 'ANALYSIS',
    PM: 'PM',
    techsup: 'TECHSUP',
    bug: 'BUG',
    dev: 'DEV',
    support: 'SUPPORT',
    refact: 'REFACT',
    meeting: 'MEETING',
    testing: 'TESTING',
    helpdesk: 'HELPDESK'
}

function getTypeFromTicketTaskAndDescription(ticket: string, task: string | null, description: string) {
    // TICKET BASED
    if (ticket === OVERHEAD_TICKETS.scrum) {
        return TYPES.scrum
    }

    if (ticket === OVERHEAD_TICKETS.overhead) {
        return TYPES.overhead
    }

    if (ticket.includes('ES-')) {
        return TYPES.analysis
    }

    // TESTING
    if (description.toLowerCase().includes('test')) {
        return TYPES.testing
    }
    if (description.toLowerCase().includes('testing')) {
        return TYPES.testing
    }

    // TICKET WRITING
    if (description.toLowerCase().includes('write')) {
        return TYPES.ticketWriting
    }
    if (description.toLowerCase().includes('writing')) {
        return TYPES.ticketWriting
    }

    // ANALYSIS
    if (description.toLowerCase().includes('analysis')) {
        return TYPES.analysis
    }
    if (description.toLowerCase().includes('research')) {
        return TYPES.analysis
    }
    if (description.toLowerCase().includes('check')) {
        return TYPES.analysis
    }

    // CODE REVIEW
    if (description.includes('PR')) {
        return TYPES.codeReview
    }
    if (description.toLowerCase().includes('code review')) {
        return TYPES.codeReview
    }
    if (description.toLowerCase().includes('codereview')) {
        return TYPES.codeReview
    }
    if (description.toLowerCase().includes('pull request')) {
        return TYPES.codeReview
    }
    if (description.toLowerCase().includes('pullrequest')) {
        return TYPES.codeReview
    }

    // REWORK
    if (description.toLowerCase().includes('rework')) {
        return TYPES.rework
    }

    // UNIT TESTING
    if (description.toLowerCase().includes('unit')) {
        return TYPES.unitTesting
    }

    // AUTOMATION TESTING
    if (description.toLowerCase().includes('automation')) {
        return TYPES.automationTesting
    }

    // TASK BASED
    if (task === TASKS.analysis) {
        return TYPES.analysis
    }
    if (task === TASKS.PM) {
        return TYPES.analysis
    }
    if (task === TASKS.techsup) {
        return TYPES.analysis
    }
    if (task === TASKS.bug) {
        return TYPES.development
    }
    if (task === TASKS.dev) {
        return TYPES.development
    }
    if (task === TASKS.support) {
        return TYPES.analysis
    }
    if (task === TASKS.refact) {
        return TYPES.development
    }
    if (task === TASKS.meeting) {
        return TYPES.analysis
    }
    if (task === TASKS.testing) {
        return TYPES.analysis
    }
    if (task === TASKS.helpdesk) {
        return TYPES.analysis
    }

    return TYPES.development
}

function removeTicketFromDescription(rawDescription: string, ticket: string) {
    if (rawDescription.includes(': ')) {
        return rawDescription.replace(`${ticket}: `, '')
    }

    if (rawDescription.includes(':')) {
        return rawDescription.replace(`${ticket}:`, '')
    }

    return rawDescription.replace(ticket, '')
}
