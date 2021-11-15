import * as IO from 'io-ts'
import { SagaReturnType } from 'redux-saga/effects'
import { NumberFromString } from '../../helpers/codecTypes'
import { decodeData } from '../../helpers/decodeData'
import { call, put, select, spawn, takeEvent } from '../helpers/storeEffects'
import { ClientServerEvent } from '../models/ClientServerEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'

export interface ClientServerEventHandlerSagaApi
  extends Pick<
    SagaReturnType<typeof animationDevelopmentSetupSaga>,
    'clientServerEventChannel'
  > {}

export function* clientServerEventHandlerSaga(
  api: ClientServerEventHandlerSagaApi
) {
  const { clientServerEventChannel } = api
  while (true) {
    const someClientServerEvent = yield* takeEvent<ClientServerEvent>(
      clientServerEventChannel
    )
    switch (someClientServerEvent.eventType) {
      case 'clientServerListening':
        break
      case 'clientApiRequest':
        const { apiRequestType, apiRequest, apiResponse } =
          someClientServerEvent.eventPayload
        switch (apiRequestType) {
          case 'getAnimationRenderProcessState':
            yield* spawn(function* () {
              const currentAnimationModuleSourceState = yield* select(
                (currentAnimationDevelopmentState) =>
                  currentAnimationDevelopmentState.animationModuleSourceState
              )
              switch (currentAnimationModuleSourceState.sourceStatus) {
                case 'sourceInitializing':
                  apiResponse.sendStatus(204)
                  break
                case 'sourceReady':
                  if (
                    currentAnimationModuleSourceState.animationRenderProcessState
                  ) {
                    const {
                      spawnedProcess,
                      ...clientAnimationRenderProcessState
                    } =
                      currentAnimationModuleSourceState.animationRenderProcessState
                    apiResponse.statusCode = 200
                    apiResponse.send(
                      JSON.stringify(clientAnimationRenderProcessState)
                    )
                  } else {
                    yield* put({
                      type: 'spawnAnimationRenderProcess',
                      actionPayload: {
                        animationModuleSessionVersion:
                          currentAnimationModuleSourceState.animationModuleSessionVersion,
                      },
                    })
                    apiResponse.statusCode = 200
                    apiResponse.send(
                      JSON.stringify({
                        processStatus: 'processActive',
                      })
                    )
                  }
              }
            })
            break
          case 'getFrameRenderProcessState':
            yield* spawn(function* () {
              const currentAnimationModuleSourceState = yield* select(
                (currentAnimationDevelopmentState) =>
                  currentAnimationDevelopmentState.animationModuleSourceState
              )
              switch (currentAnimationModuleSourceState.sourceStatus) {
                case 'sourceInitializing':
                  apiResponse.sendStatus(204)
                  break
                case 'sourceReady':
                  const getFrameRenderProcessStateRequestParams = yield* call(
                    () =>
                      decodeData<
                        { frameIndex: number },
                        { frameIndex: string }
                      >({
                        targetCodec: IO.exact(
                          IO.type({
                            frameIndex: NumberFromString,
                          })
                        ),
                        inputData: apiRequest.params,
                      })
                  )
                  const targetFrameRenderProcessState =
                    currentAnimationModuleSourceState.frameRenderProcessStates[
                      getFrameRenderProcessStateRequestParams.frameIndex
                    ]
                  if (targetFrameRenderProcessState) {
                    const { spawnedProcess, ...clientFrameRenderProcessState } =
                      targetFrameRenderProcessState
                    apiResponse.statusCode = 200
                    apiResponse.send(
                      JSON.stringify(clientFrameRenderProcessState)
                    )
                  } else {
                    yield* put({
                      type: 'spawnFrameRenderProcess',
                      actionPayload: {
                        frameIndex:
                          getFrameRenderProcessStateRequestParams.frameIndex,
                        animationModuleSessionVersion:
                          currentAnimationModuleSourceState.animationModuleSessionVersion,
                      },
                    })
                    apiResponse.statusCode = 200
                    apiResponse.send(
                      JSON.stringify({
                        processStatus: 'processActive',
                      })
                    )
                  }
                  break
              }
            })
            break
        }
        break
      case 'clientAssetRequest':
        yield* spawn(function* () {
          const getClientAssetRequestParams = yield* call(() =>
            decodeData<{ assetFilename: string }>({
              targetCodec: IO.exact(
                IO.type({
                  assetFilename: IO.string,
                })
              ),
              inputData: someClientServerEvent.eventPayload.assetRequest.params,
            })
          )
          const currentAvailableAssetsFilePathMap = yield* select(
            (currentAnimationDevelopmentState) =>
              currentAnimationDevelopmentState.availableAssetsFilePathMap
          )
          const targetAssetFilepath =
            currentAvailableAssetsFilePathMap[
              getClientAssetRequestParams.assetFilename
            ]
          if (targetAssetFilepath) {
            someClientServerEvent.eventPayload.assetResponse.sendFile(
              targetAssetFilepath
            )
          } else {
            someClientServerEvent.eventPayload.assetResponse.sendStatus(404)
          }
        })
        break
    }
  }
}
