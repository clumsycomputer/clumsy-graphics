import { EventBase } from './common'

export type ClientServerEvent =
  | ClientServerListeningEvent
  | ClientApiRequestEvent
  | ClientAssetRequestEvent

export interface ClientServerListeningEvent
  extends EventBase<'clientServerListening', {}> {}

export type ClientApiRequestEvent =
  | ClientApiRequestEventBase<'getAnimationRenderTask'>
  | ClientApiRequestEventBase<'getFrameRenderTask'>

interface ClientApiRequestEventBase<
  ApiRequestType extends string
> extends EventBase<
    'clientApiRequest',
    {
      apiRequestType: ApiRequestType
      clientRequest: unknown
      serverResponse: unknown
    }
  > {}

export interface ClientAssetRequestEvent
  extends EventBase<'clientAssetRequest', {}> {}
