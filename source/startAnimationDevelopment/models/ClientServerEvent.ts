import { Request as ClientRequest, Response as ServerResponse } from 'express'
import { EventBase } from './common'

export type ClientServerEvent =
  | ClientServerListeningEvent
  | ClientRequestsGraphicsRendererProcessStateEvent
  | ClientRequestsGraphicAssetEvent
  | ClientRequestsPageEvent

export interface ClientServerListeningEvent
  extends EventBase<'clientServerListening', {}> {}

export interface ClientRequestsGraphicsRendererProcessStateEvent
  extends ClientRequestsEventBase<'clientRequestsGraphicsRendererProcessState'> {}

export interface ClientRequestsGraphicAssetEvent
  extends ClientRequestsEventBase<'clientRequestsGraphicAsset'> {}

export interface ClientRequestsPageEvent
  extends ClientRequestsEventBase<'clientRequestsPage'> {}

interface ClientRequestsEventBase<
  ClientRequestsEventType extends string
> extends EventBase<
    ClientRequestsEventType,
    {
      clientRequest: ClientRequest
      serverResponse: ServerResponse
    }
  > {}
