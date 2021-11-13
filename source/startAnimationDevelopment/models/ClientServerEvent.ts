import { Request as ClientRequest, Response as ServerResponse } from 'express'
import { EventBase } from './common'

export type ClientServerEvent =
  | ClientServerListeningEvent
  | ClientApiRequestEvent
  | ClientAssetRequestEvent

export interface ClientServerListeningEvent
  extends EventBase<'clientServerListening', {}> {}

export type ClientApiRequestEvent =
  | ClientApiRequestEventBase<'getAnimationRenderProcessState'>
  | ClientApiRequestEventBase<'getFrameRenderProcessState'>

interface ClientApiRequestEventBase<
  ApiRequestType extends string
> extends EventBase<
    'clientApiRequest',
    {
      apiRequestType: ApiRequestType
      apiRequest: ClientRequest
      apiResponse: ServerResponse
    }
  > {}

export interface ClientAssetRequestEvent
  extends EventBase<'clientAssetRequest', {}> {}
