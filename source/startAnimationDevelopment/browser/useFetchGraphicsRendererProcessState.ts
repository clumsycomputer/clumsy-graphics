import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { decodeData } from '../../helpers/decodeData'
import {
  ClientGraphicsRendererProcessState,
  ClientGraphicsRendererProcessStateCodec,
} from '../models/GraphicsRendererProcessState'

const FetchGraphicsRendererProcessStateStorageKey =
  'storedFetchGraphicsRendererProcessState'

export interface UseFetchGraphicsRendererProcessStateApi {
  renderTargetParams: RenderTargetParams
}

export type RenderTargetParams =
  | AnimationRenderTargetParams
  | FrameRenderTargetParams

interface AnimationRenderTargetParams
  extends RenderTargetParamsBase<'animation'> {}

interface FrameRenderTargetParams extends RenderTargetParamsBase<'frame'> {
  frameIndex: `${number}`
}

interface RenderTargetParamsBase<RenderType extends string> {
  renderType: RenderType
}

export type FetchGraphicsRendererProcessState =
  | FetchGraphicsRendererProcessServerInitializingState
  | FetchGraphicsRendererProcessSuccessState
  | FetchGraphicsRendererProcessClientErrorState
  | FetchGraphicsRendererProcessServerErrorState

interface FetchGraphicsRendererProcessServerInitializingState
  extends FetchGraphicsRendererProcessStateBase<'serverInitializing', 204> {}

export interface FetchGraphicsRendererProcessSuccessState
  extends FetchGraphicsRendererProcessStateBase<'fetchSuccessful', 200> {
  fetchedGraphicsRendererProcessState: ClientGraphicsRendererProcessState
}

interface FetchGraphicsRendererProcessClientErrorState
  extends FetchGraphicsRendererProcessStateBase<'fetchError', 400> {
  fetchErrorMessage: string
}

interface FetchGraphicsRendererProcessServerErrorState
  extends FetchGraphicsRendererProcessStateBase<'serverError', 500> {}

interface FetchGraphicsRendererProcessStateBase<
  FetchStatus extends string,
  FetchStatusCode extends number
> {
  fetchStatus: FetchStatus
  fetchStatusCode: FetchStatusCode
}

export function useFetchGraphicsRendererProcessState(
  api: UseFetchGraphicsRendererProcessStateApi
) {
  const { renderTargetParams } = api
  const [
    fetchGraphicsRendererProcessState,
    setFetchGraphicsRendererProcessState,
  ] = useState<FetchGraphicsRendererProcessState>(
    getInitialFetchGraphicsRendererProcessState({
      renderTargetParams,
    })
  )
  const fetchGraphicsRendererProcessStateRef =
    useRef<FetchGraphicsRendererProcessState>(fetchGraphicsRendererProcessState)
  const fetchQueryParamString = useMemo(() => {
    if (renderTargetParams.renderType === 'animation') {
      return `?assetType=mp4`
    } else if (renderTargetParams.renderType === 'frame') {
      return `?assetType=png&frameIndex=${renderTargetParams.frameIndex}`
    }
  }, [])
  useEffect(() => {
    const fetchLatestGraphicsRendererProcessStateIntervalHandle = setInterval(
      async () => {
        const fetchLatestGraphicsRendererProcessStateResponse = await fetch(
          `/api/latestAnimationModule/graphicsRendererProcessState${fetchQueryParamString}`
        )
        switch (fetchLatestGraphicsRendererProcessStateResponse.status) {
          case 204:
            // maybeSetFetchGraphicsRendererProcessState({
            //   renderTargetParams,
            //   setFetchGraphicsRendererProcessState,
            //   fetchGraphicsRendererProcessStateRef,
            //   maybeNextFetchGraphicsRendererProcessState: {
            //     fetchStatus: 'serverInitializing',
            //     fetchStatusCode: 204,
            //   },
            // })
            break
          case 200:
            const fetchLatestGraphicsRendererProcessStateResponseData =
              await fetchLatestGraphicsRendererProcessStateResponse.json()
            const fetchedGraphicsRendererProcessState =
              await decodeData<ClientGraphicsRendererProcessState>({
                inputData: fetchLatestGraphicsRendererProcessStateResponseData,
                targetCodec: ClientGraphicsRendererProcessStateCodec,
              })
            maybeSetFetchGraphicsRendererProcessState({
              renderTargetParams,
              setFetchGraphicsRendererProcessState,
              fetchGraphicsRendererProcessStateRef,
              maybeNextFetchGraphicsRendererProcessState: {
                fetchedGraphicsRendererProcessState,
                fetchStatus: 'fetchSuccessful',
                fetchStatusCode: 200,
              },
            })
            break
          case 400:
            const fetchErrorMessage =
              await fetchLatestGraphicsRendererProcessStateResponse.text()
            maybeSetFetchGraphicsRendererProcessState({
              renderTargetParams,
              setFetchGraphicsRendererProcessState,
              fetchGraphicsRendererProcessStateRef,
              maybeNextFetchGraphicsRendererProcessState: {
                fetchErrorMessage,
                fetchStatus: 'fetchError',
                fetchStatusCode: 400,
              },
            })
            break
          case 500:
            maybeSetFetchGraphicsRendererProcessState({
              renderTargetParams,
              setFetchGraphicsRendererProcessState,
              fetchGraphicsRendererProcessStateRef,
              maybeNextFetchGraphicsRendererProcessState: {
                fetchStatus: 'serverError',
                fetchStatusCode: 500,
              },
            })
            break
          default:
            break
        }
      },
      500
    )
    return () => {
      clearInterval(fetchLatestGraphicsRendererProcessStateIntervalHandle)
    }
  }, [])
  return { fetchGraphicsRendererProcessState }
}

interface GetInitialFetchGraphicsRendererProcessStateApi
  extends Pick<UseFetchGraphicsRendererProcessStateApi, 'renderTargetParams'> {}

function getInitialFetchGraphicsRendererProcessState(
  api: GetInitialFetchGraphicsRendererProcessStateApi
): FetchGraphicsRendererProcessState {
  const { renderTargetParams } = api
  const maybePersistedState = localStorage.getItem(
    FetchGraphicsRendererProcessStateStorageKey
  )
  const persistedStateData = maybePersistedState
    ? (JSON.parse(maybePersistedState) as unknown as {
        storedRenderTargetParams: UseFetchGraphicsRendererProcessStateApi['renderTargetParams']
        storedFetchGraphicsRendererProcessState: FetchGraphicsRendererProcessState
      } | null)
    : null
  if (
    persistedStateData &&
    JSON.stringify(renderTargetParams) ===
      JSON.stringify(persistedStateData.storedRenderTargetParams)
  ) {
    return persistedStateData.storedFetchGraphicsRendererProcessState
  } else {
    return {
      fetchStatus: 'serverInitializing',
      fetchStatusCode: 204,
    }
  }
}

interface MaybeSetFetchGraphicsRendererProcessStateApi
  extends Pick<UseFetchGraphicsRendererProcessStateApi, 'renderTargetParams'> {
  maybeNextFetchGraphicsRendererProcessState: FetchGraphicsRendererProcessState
  fetchGraphicsRendererProcessStateRef: MutableRefObject<FetchGraphicsRendererProcessState>
  setFetchGraphicsRendererProcessState: Dispatch<
    SetStateAction<FetchGraphicsRendererProcessState>
  >
}

function maybeSetFetchGraphicsRendererProcessState(
  api: MaybeSetFetchGraphicsRendererProcessStateApi
) {
  const {
    maybeNextFetchGraphicsRendererProcessState,
    fetchGraphicsRendererProcessStateRef,
    renderTargetParams,
    setFetchGraphicsRendererProcessState,
  } = api
  const currentFetchGraphicsRendererProcessState =
    fetchGraphicsRendererProcessStateRef.current
  const fetchStatusDifferent =
    maybeNextFetchGraphicsRendererProcessState.fetchStatus !==
    currentFetchGraphicsRendererProcessState.fetchStatus
  const fetchedGraphicsRendererProcessStateDifferent =
    maybeNextFetchGraphicsRendererProcessState.fetchStatus ===
      'fetchSuccessful' &&
    currentFetchGraphicsRendererProcessState.fetchStatus ===
      'fetchSuccessful' &&
    (maybeNextFetchGraphicsRendererProcessState
      .fetchedGraphicsRendererProcessState.animationModuleSessionVersion !==
      currentFetchGraphicsRendererProcessState
        .fetchedGraphicsRendererProcessState.animationModuleSessionVersion ||
      maybeNextFetchGraphicsRendererProcessState
        .fetchedGraphicsRendererProcessState.processStatus !==
        currentFetchGraphicsRendererProcessState
          .fetchedGraphicsRendererProcessState.processStatus ||
      maybeNextFetchGraphicsRendererProcessState
        .fetchedGraphicsRendererProcessState.processStdoutLog !==
        currentFetchGraphicsRendererProcessState
          .fetchedGraphicsRendererProcessState.processStdoutLog)
  const fetchErrorMessageDifferent =
    maybeNextFetchGraphicsRendererProcessState.fetchStatus === 'fetchError' &&
    currentFetchGraphicsRendererProcessState.fetchStatus === 'fetchError' &&
    maybeNextFetchGraphicsRendererProcessState.fetchErrorMessage !==
      currentFetchGraphicsRendererProcessState.fetchErrorMessage
  if (
    fetchStatusDifferent ||
    fetchedGraphicsRendererProcessStateDifferent ||
    fetchErrorMessageDifferent
  ) {
    fetchGraphicsRendererProcessStateRef.current =
      maybeNextFetchGraphicsRendererProcessState
    localStorage.setItem(
      FetchGraphicsRendererProcessStateStorageKey,
      JSON.stringify({
        storedRenderTargetParams: renderTargetParams,
        storedFetchGraphicsRendererProcessState:
          maybeNextFetchGraphicsRendererProcessState,
      })
    )
    setFetchGraphicsRendererProcessState(
      maybeNextFetchGraphicsRendererProcessState
    )
  }
}
