import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { decodeData } from '../../../helpers/decodeData'
import {
  ClientGraphicsRendererProcessState,
  ClientGraphicsRendererProcessStateCodec,
} from '../../models/ClientGraphicsRendererProcessState'
import { AnimationDevelopmentPageProps } from '../components/AnimationDevelopmentPage'
import { AssetBaseRoute, ViewSubRoute } from '../models'

export interface UsePollClientGraphicsRendererProcessStateResponseApi
  extends Pick<
    AnimationDevelopmentPageProps<AssetBaseRoute, ViewSubRoute>,
    'graphicsRendererProcessKey'
  > {
  staticPollRate: number
}

export type PollClientGraphicsRendererProcessStateResponse =
  | PollClientGraphicsRendererProcessStateServerInitializingResponse
  | PollClientGraphicsRendererProcessStateSuccessResponse
  | PollClientGraphicsRendererProcessStateClientErrorResponse
  | PollClientGraphicsRendererProcessStateServerErrorResponse

export interface PollClientGraphicsRendererProcessStateServerInitializingResponse
  extends PollClientGraphicsRendererProcessStateBase<
    'serverInitializing',
    204
  > {}

export interface PollClientGraphicsRendererProcessStateSuccessResponse
  extends PollClientGraphicsRendererProcessStateBase<'fetchSuccessful', 200> {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessState
}

export interface PollClientGraphicsRendererProcessStateClientErrorResponse
  extends PollClientGraphicsRendererProcessStateBase<'fetchError', 400> {
  responseErrorMessage: string
}

export interface PollClientGraphicsRendererProcessStateServerErrorResponse
  extends PollClientGraphicsRendererProcessStateBase<'serverError', 500> {}

interface PollClientGraphicsRendererProcessStateBase<
  ResponseStatus extends string,
  ResponseStatusCode extends number
> {
  responseStatus: ResponseStatus
  responseStatusCode: ResponseStatusCode
}

export function usePollClientGraphicsRendererProcessStateResponse(
  api: UsePollClientGraphicsRendererProcessStateResponseApi
): {
  pollClientGraphicsRendererProcessStateResponse: PollClientGraphicsRendererProcessStateResponse
} {
  const { graphicsRendererProcessKey, staticPollRate } = api
  const localStorageSessionCacheId = useMemo(
    () =>
      document
        .getElementById('client-page-bundle-script')
        ?.getAttribute('data-local-storage-session-cache-id')!,
    []
  )
  const [
    pollClientGraphicsRendererProcessStateResponse,
    setPollClientGraphicsRendererProcessStateResponse,
  ] = useState<PollClientGraphicsRendererProcessStateResponse>(
    getInitialPollClientGraphicsRendererProcessStateResponse({
      graphicsRendererProcessKey,
      localStorageSessionCacheId,
    })
  )
  const pollClientGraphicsRendererProcessStateResponseRef =
    useRef<PollClientGraphicsRendererProcessStateResponse>(
      pollClientGraphicsRendererProcessStateResponse
    )
  useEffect(() => {
    const pollClientGraphicsRendererProcessStateIntervalHandle = setInterval(
      async () => {
        const fetchClientGraphicsRendererProcessStateResponse = await fetch(
          `/api/latestAnimationModule/graphicsRendererProcessState?graphicsRendererProcessKey=${graphicsRendererProcessKey}`
        )
        switch (fetchClientGraphicsRendererProcessStateResponse.status) {
          case 204:
            break
          case 200:
            const fetchClientGraphicsRendererProcessStateResponseData =
              await fetchClientGraphicsRendererProcessStateResponse.json()
            const maybeNextClientGraphicsRendererProcessState =
              await decodeData<ClientGraphicsRendererProcessState>({
                inputData: fetchClientGraphicsRendererProcessStateResponseData,
                targetCodec: ClientGraphicsRendererProcessStateCodec,
              })
            maybeSetPollClientGraphicsRendererProcessStateResponse({
              graphicsRendererProcessKey,
              localStorageSessionCacheId,
              setPollClientGraphicsRendererProcessStateResponse,
              pollClientGraphicsRendererProcessStateResponseRef,
              maybeNextPollClientGraphicsRendererProcessStateResponse: {
                clientGraphicsRendererProcessState:
                  maybeNextClientGraphicsRendererProcessState,
                responseStatus: 'fetchSuccessful',
                responseStatusCode: 200,
              },
            })
            break
          case 400:
            const responseErrorMessage =
              await fetchClientGraphicsRendererProcessStateResponse.text()
            maybeSetPollClientGraphicsRendererProcessStateResponse({
              graphicsRendererProcessKey,
              localStorageSessionCacheId,
              setPollClientGraphicsRendererProcessStateResponse,
              pollClientGraphicsRendererProcessStateResponseRef,
              maybeNextPollClientGraphicsRendererProcessStateResponse: {
                responseErrorMessage,
                responseStatus: 'fetchError',
                responseStatusCode: 400,
              },
            })
            break
          case 500:
            maybeSetPollClientGraphicsRendererProcessStateResponse({
              graphicsRendererProcessKey,
              localStorageSessionCacheId,
              setPollClientGraphicsRendererProcessStateResponse,
              pollClientGraphicsRendererProcessStateResponseRef,
              maybeNextPollClientGraphicsRendererProcessStateResponse: {
                responseStatus: 'serverError',
                responseStatusCode: 500,
              },
            })
            break
          default:
            break
        }
      },
      staticPollRate
    )
    return () => {
      clearInterval(pollClientGraphicsRendererProcessStateIntervalHandle)
    }
  }, [])
  return { pollClientGraphicsRendererProcessStateResponse }
}

interface GetInitialPollClientGraphicsRendererProcessStateResponseApi
  extends Pick<
    UsePollClientGraphicsRendererProcessStateResponseApi,
    'graphicsRendererProcessKey'
  > {
  localStorageSessionCacheId: string
}

function getInitialPollClientGraphicsRendererProcessStateResponse(
  api: GetInitialPollClientGraphicsRendererProcessStateResponseApi
): PollClientGraphicsRendererProcessStateResponse {
  const { graphicsRendererProcessKey, localStorageSessionCacheId } = api
  const maybeCachedFetchGraphicsRendererProcessStateDataString =
    localStorage.getItem(graphicsRendererProcessKey)
  const maybeCachedFetchGraphicsRendererProcessStateData =
    maybeCachedFetchGraphicsRendererProcessStateDataString
      ? (JSON.parse(
          maybeCachedFetchGraphicsRendererProcessStateDataString
        ) as unknown as CachedPollClientGraphicsRendererProcessStateResponseData | null)
      : null
  if (
    localStorageSessionCacheId ===
    maybeCachedFetchGraphicsRendererProcessStateData?.localStorageSessionCacheId
  ) {
    return maybeCachedFetchGraphicsRendererProcessStateData.pollClientGraphicsRendererProcessStateResponse
  } else {
    return {
      responseStatus: 'serverInitializing',
      responseStatusCode: 204,
    }
  }
}

interface CachedPollClientGraphicsRendererProcessStateResponseData {
  localStorageSessionCacheId: string
  pollClientGraphicsRendererProcessStateResponse: PollClientGraphicsRendererProcessStateResponse
}

interface MaybeSetPollClientGraphicsRendererProcessStateResponseApi
  extends Pick<
    UsePollClientGraphicsRendererProcessStateResponseApi,
    'graphicsRendererProcessKey'
  > {
  localStorageSessionCacheId: string
  maybeNextPollClientGraphicsRendererProcessStateResponse: PollClientGraphicsRendererProcessStateResponse
  pollClientGraphicsRendererProcessStateResponseRef: MutableRefObject<PollClientGraphicsRendererProcessStateResponse>
  setPollClientGraphicsRendererProcessStateResponse: Dispatch<
    SetStateAction<PollClientGraphicsRendererProcessStateResponse>
  >
}

function maybeSetPollClientGraphicsRendererProcessStateResponse(
  api: MaybeSetPollClientGraphicsRendererProcessStateResponseApi
) {
  const {
    pollClientGraphicsRendererProcessStateResponseRef,
    localStorageSessionCacheId,
    maybeNextPollClientGraphicsRendererProcessStateResponse,
    graphicsRendererProcessKey,
    setPollClientGraphicsRendererProcessStateResponse,
  } = api
  // todo calc shouldUpdateDiff
  if (true) {
    pollClientGraphicsRendererProcessStateResponseRef.current =
      maybeNextPollClientGraphicsRendererProcessStateResponse
    const nextCachedPollClientGraphicsRendererProcessStateResponseData: CachedPollClientGraphicsRendererProcessStateResponseData =
      {
        localStorageSessionCacheId,
        pollClientGraphicsRendererProcessStateResponse:
          maybeNextPollClientGraphicsRendererProcessStateResponse,
      }
    localStorage.setItem(
      graphicsRendererProcessKey,
      JSON.stringify(
        nextCachedPollClientGraphicsRendererProcessStateResponseData
      )
    )
    setPollClientGraphicsRendererProcessStateResponse(
      maybeNextPollClientGraphicsRendererProcessStateResponse
    )
  }
}
