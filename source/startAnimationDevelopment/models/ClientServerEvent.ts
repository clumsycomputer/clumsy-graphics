import { EventBase } from './common'

export type ClientServerEvent =
  | ClientServerListeningEvent
  | ClientApiRequestEvent
  | ClientAssetRequestEvent

export interface ClientServerListeningEvent
  extends EventBase<'clientServerListening', {}> {}

export interface ClientApiRequestEvent
  extends EventBase<'clientApiRequest', {}> {}

export interface ClientAssetRequestEvent
  extends EventBase<'clientAssetRequest', {}> {}
