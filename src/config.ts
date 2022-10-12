import { token, userAgent, userIds, workspaceId } from './secrets'

export const ENV = {
    user_ids: userIds,
    user_agent: userAgent,
    workspace_id: workspaceId,
    token: token,
    password: 'api_token'
}
