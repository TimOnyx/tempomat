/* eslint-disable camelcase */
import { AxiosError, AxiosResponse } from 'axios'
import flags from '../globalFlags'
import togglAxios from './togglAxios'

export type GetEntriesRequest = {
    since: string;
    until: string;
    user_ids: number | number[];
    user_agent: string;
    workspace_id: number;
}

export type GetEntriesResponseDataItem = {
    id: number;
    pid: number | null;
    tid: number | null;
    uid: number;
    description: string;
    start: string;
    end: string;
    updated: string;
    dur: number
    user: string;
    use_stop: boolean,
    client: string | null;
    project: string | null;
    project_color: string | null;
    project_hex_color: string | null;
    task: string | null;
    billable: unknown,
    is_billable: boolean,
    cur: unknown,
    tags: unknown[]
}

export type GetEntriesResponse = {
    total_grand: unknown,
    total_billable: unknown,
    total_currencies: unknown,
    data: GetEntriesResponseDataItem[];
}

export default {

    async getEntries(request: GetEntriesRequest): Promise<GetEntriesResponse> {
        let url = '/reports/api/v2/details?'
        url += `since=${request.since}&`
        url += `until=${request.until}&`
        url += `user_ids=${request.user_ids}&`
        url += `user_agent=${request.user_agent}&`
        url += `workspace_id=${request.workspace_id}`

        return execute(async () => {
            const response = await togglAxios.get(url)
            debugLog(response)
            return response.data
        })
    }

}

function debugLog(response: AxiosResponse) {
    if (flags.debug) {
        console.log(`Request: ${JSON.stringify(response.config)}, Response: ${JSON.stringify(response.data)}`)
    }
}

async function execute<T>(action: () => Promise<T>): Promise<T> {
    return action().catch((e) => handleError(e))
}

function handleError(e: AxiosError): never {
    if (flags.debug) console.log(`Response: ${JSON.stringify(e.response?.data)}`)
    const responseStatus = e.response?.status
    if (responseStatus === 401) {
        throw Error('Unauthorized access. Token is invalid or has expired.')
    }
    const errorMessages = e.response?.data?.errors?.map((err: { message?: string }) => err.message)
    if (errorMessages) {
        throw Error(`Failure. Reason: ${e.message}. Errors: ${errorMessages.join(', ')}`)
    } else {
        if (flags.debug) console.log(e.toJSON())
        let errorMessage = 'Error connecting to server.'
        if (responseStatus) errorMessage += ` Server status code: ${responseStatus}.`
        throw Error(errorMessage)
    }
}
