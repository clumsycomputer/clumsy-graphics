import { string } from 'fp-ts'

export interface ActionBase<
  ActionType extends string,
  ActionPayload extends object
> {
  type: ActionType
  actionPayload: ActionPayload
}

export interface EventBase<
  EventType extends string,
  EventPayload extends object
> {
  eventType: EventType
  eventPayload: EventPayload
}

export type ChannelEventEmitter<
  SomeChannelEvent extends EventBase<string, object>
> = (input: SomeChannelEvent) => void
