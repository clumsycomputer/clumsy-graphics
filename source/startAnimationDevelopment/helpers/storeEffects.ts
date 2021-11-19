import {
  Buffer as ChannelBuffer,
  EventChannel,
  MulticastChannel,
  Task,
} from 'redux-saga'
import {
  actionChannel as _actionChannel,
  ActionPattern,
  call as _call,
  fork as _fork,
  put as _put,
  SagaReturnType,
  select as _select,
  spawn as _spawn,
  Tail,
  take as _take,
} from 'redux-saga/effects'
import { ActionBase, EventBase } from '../models/common'
import { AnimationDevelopmentAction } from '../models/AnimationDevelopmentAction'
import { AnimationDevelopmentState } from '../models/AnimationDevelopmentState'

const { storeEffects } = getStoreEffects<
  AnimationDevelopmentAction,
  AnimationDevelopmentState
>()

export const call = storeEffects.call
export const fork = storeEffects.fork
export const spawn = storeEffects.spawn
export const put = storeEffects.put
export const select = storeEffects.select
export const takeAction = storeEffects.takeAction
export const takeActionFromChannel = storeEffects.takeActionFromChannel
export const takeEvent = storeEffects.takeEvent
export const actionChannel = storeEffects.actionChannel

function getStoreEffects<
  StoreAction extends ActionBase<string, object>,
  StoreState
>() {
  const storeEffects = {
    call: function* <SomeFunction extends (...args: any[]) => any>(
      someFunction: SomeFunction,
      ...functionArgs: Parameters<SomeFunction>
    ) {
      return (yield _call<SomeFunction>(
        someFunction,
        ...functionArgs
      )) as SagaReturnType<SomeFunction>
    },
    fork: function* <SomeFunction extends (...args: any[]) => any>(
      someFunction: SomeFunction,
      ...functionArgs: Parameters<SomeFunction>
    ) {
      return (yield _fork<SomeFunction>(someFunction, ...functionArgs)) as Task
    },
    spawn: function* <SomeFunction extends (...args: any[]) => any>(
      someFunction: SomeFunction,
      ...functionArgs: Parameters<SomeFunction>
    ) {
      return (yield _spawn<SomeFunction>(someFunction, ...functionArgs)) as Task
    },
    put: function* <SomeStoreAction extends StoreAction>(
      someAction: SomeStoreAction
    ) {
      return (yield _put<SomeStoreAction>(someAction)) as void
    },
    select: function* <
      SomeFunction extends (state: StoreState, ...args: any[]) => any
    >(
      storeSelector: SomeFunction,
      ...selectorArgs: Tail<Parameters<SomeFunction>>
    ) {
      return (yield _select(storeSelector, ...selectorArgs)) as ReturnType<
        typeof storeSelector
      >
    },
    takeAction: function* <TargetAction extends StoreAction>(
      actionPattern: StoreActionPattern<StoreAction, TargetAction>
    ) {
      return (yield _take<TargetAction>(
        actionPattern as ActionPattern<TargetAction>
      )) as TargetAction
    },
    takeActionFromChannel: function* <ChannelAction extends StoreAction>(
      actionChannel: MulticastChannel<ChannelAction>
    ) {
      return (yield _take(actionChannel)) as ChannelAction
    },
    takeEvent: function* <SomeEvent extends EventBase<string, object>>(
      takeableChannel: EventChannel<SomeEvent>
    ) {
      return (yield _take<SomeEvent>(takeableChannel)) as SomeEvent
    },
    actionChannel: function* <ChannelAction extends StoreAction>(
      channelActionPattern: StoreActionPattern<StoreAction, ChannelAction>,
      channelBuffer: ChannelBuffer<ChannelAction>
    ) {
      return (yield _actionChannel(
        channelActionPattern as ActionPattern<ChannelAction>,
        channelBuffer
      )) as MulticastChannel<ChannelAction>
    },
  }
  return { storeEffects }
}

type StoreActionPattern<
  StoreAction extends ActionBase<string, object>,
  TargetAction extends StoreAction
> =
  | TargetAction['type']
  | GuardPredicate<StoreAction, TargetAction>
  | Array<TargetAction['type'] | GuardPredicate<StoreAction, TargetAction>>

type GuardPredicate<
  PredicateArgument,
  PredicateGuard extends PredicateArgument
> = (
  somePredicateArgument: PredicateArgument
) => somePredicateArgument is PredicateGuard
