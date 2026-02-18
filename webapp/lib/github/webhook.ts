import { createHmac } from 'crypto'
import { Webhooks } from '@octokit/webhooks'
import type { PullRequestEvent, PushEvent, InstallationEvent } from '@octokit/webhooks-types'

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!signature) {
    return false
  }

  const hmac = createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  
  return signature === digest
}

export function parseWebhookEvent(payload: any): {
  event: string
  data: any
} {
  return {
    event: payload.action || payload.type || 'unknown',
    data: payload,
  }
}

