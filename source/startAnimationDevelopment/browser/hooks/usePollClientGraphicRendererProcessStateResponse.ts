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
  localStorageKey: string
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
  previousClientGraphicsRendererProcessState: ClientGraphicsRendererProcessState | null
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
  const { localStorageKey, graphicsRendererProcessKey, staticPollRate } = api
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
      localStorageKey,
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
              localStorageKey,
              graphicsRendererProcessKey,
              localStorageSessionCacheId,
              setPollClientGraphicsRendererProcessStateResponse,
              pollClientGraphicsRendererProcessStateResponseRef,
              maybeNextPollClientGraphicsRendererProcessStateResponse: {
                clientGraphicsRendererProcessState:
                  maybeNextClientGraphicsRendererProcessState,
                previousClientGraphicsRendererProcessState:
                  pollClientGraphicsRendererProcessStateResponseRef.current
                    .responseStatus === 'fetchSuccessful'
                    ? pollClientGraphicsRendererProcessStateResponseRef.current
                        .clientGraphicsRendererProcessState
                    : null,
                responseStatus: 'fetchSuccessful',
                responseStatusCode: 200,
              },
            })
            break
          case 400:
            const responseErrorMessage =
              await fetchClientGraphicsRendererProcessStateResponse.text()
            maybeSetPollClientGraphicsRendererProcessStateResponse({
              localStorageKey,
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
              localStorageKey,
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
    'localStorageKey' | 'graphicsRendererProcessKey'
  > {
  localStorageSessionCacheId: string
  localStorageKey: string
}

function getInitialPollClientGraphicsRendererProcessStateResponse(
  api: GetInitialPollClientGraphicsRendererProcessStateResponseApi
): PollClientGraphicsRendererProcessStateResponse {
  const {
    localStorageKey,
    graphicsRendererProcessKey,
    localStorageSessionCacheId,
  } = api
  const cachedPollClientGraphicsRendererProcessStateResponseData =
    getCachedPollClientGraphicsRendererProcessStateResponseData({
      localStorageSessionCacheId,
      localStorageKey,
    })
  const cachedPollClientGraphicsRendererProcessStateResponse =
    cachedPollClientGraphicsRendererProcessStateResponseData
      ?.pollClientGraphicsRendererProcessStateResponseMap[
      graphicsRendererProcessKey
    ]
  if (cachedPollClientGraphicsRendererProcessStateResponse) {
    return cachedPollClientGraphicsRendererProcessStateResponse
  } else {
    return {
      responseStatus: 'serverInitializing',
      responseStatusCode: 204,
    }
  }
}

interface MaybeSetPollClientGraphicsRendererProcessStateResponseApi
  extends Pick<
    UsePollClientGraphicsRendererProcessStateResponseApi,
    'localStorageKey' | 'graphicsRendererProcessKey'
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
    setPollClientGraphicsRendererProcessStateResponse,
    localStorageKey,
    graphicsRendererProcessKey,
  } = api
  // todo calc shouldUpdateDiff
  if (true) {
    pollClientGraphicsRendererProcessStateResponseRef.current =
      maybeNextPollClientGraphicsRendererProcessStateResponse
    setPollClientGraphicsRendererProcessStateResponse(
      maybeNextPollClientGraphicsRendererProcessStateResponse
    )
    const cachedPollClientGraphicsRendererProcessStateResponseData =
      getCachedPollClientGraphicsRendererProcessStateResponseData({
        localStorageSessionCacheId,
        localStorageKey,
      })
    if (
      maybeNextPollClientGraphicsRendererProcessStateResponse.responseStatus ===
        'fetchSuccessful' &&
      maybeNextPollClientGraphicsRendererProcessStateResponse
        .clientGraphicsRendererProcessState.buildVersion ===
        cachedPollClientGraphicsRendererProcessStateResponseData?.buildVersion
    ) {
      const nextCachedPollClientGraphicsRendererProcessStateResponseData: CachedPollClientGraphicsRendererProcessStateResponseData =
        {
          localStorageSessionCacheId,
          buildVersion:
            cachedPollClientGraphicsRendererProcessStateResponseData.buildVersion,
          pollClientGraphicsRendererProcessStateResponseMap: {
            ...cachedPollClientGraphicsRendererProcessStateResponseData.pollClientGraphicsRendererProcessStateResponseMap,
            [graphicsRendererProcessKey]:
              maybeNextPollClientGraphicsRendererProcessStateResponse,
          },
        }
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(
          nextCachedPollClientGraphicsRendererProcessStateResponseData
        )
      )
    } else if (
      maybeNextPollClientGraphicsRendererProcessStateResponse.responseStatus ===
        'fetchSuccessful' &&
      maybeNextPollClientGraphicsRendererProcessStateResponse
        .clientGraphicsRendererProcessState.buildVersion !==
        cachedPollClientGraphicsRendererProcessStateResponseData?.buildVersion
    ) {
      const nextCachedPollClientGraphicsRendererProcessStateResponseData: CachedPollClientGraphicsRendererProcessStateResponseData =
        {
          localStorageSessionCacheId,
          buildVersion:
            maybeNextPollClientGraphicsRendererProcessStateResponse
              .clientGraphicsRendererProcessState.buildVersion,
          pollClientGraphicsRendererProcessStateResponseMap: {
            [graphicsRendererProcessKey]:
              maybeNextPollClientGraphicsRendererProcessStateResponse,
          },
        }
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(
          nextCachedPollClientGraphicsRendererProcessStateResponseData
        )
      )
    }
  }
}

export interface GetCachedPollClientGraphicsRendererProcessStateResponseDataApi
  extends Pick<
    UsePollClientGraphicsRendererProcessStateResponseApi,
    'localStorageKey'
  > {
  localStorageSessionCacheId: string
}

export function getCachedPollClientGraphicsRendererProcessStateResponseData(
  api: GetCachedPollClientGraphicsRendererProcessStateResponseDataApi
) {
  const { localStorageKey, localStorageSessionCacheId } = api
  const maybeCachedPollClientGraphicsRendererProcessStateResponseDataString =
    localStorage.getItem(localStorageKey)
  const cachedPollClientGraphicsRendererProcessStateResponseData =
    maybeCachedPollClientGraphicsRendererProcessStateResponseDataString
      ? (JSON.parse(
          maybeCachedPollClientGraphicsRendererProcessStateResponseDataString
        ) as unknown as CachedPollClientGraphicsRendererProcessStateResponseData | null)
      : null
  return localStorageSessionCacheId ===
    cachedPollClientGraphicsRendererProcessStateResponseData?.localStorageSessionCacheId
    ? cachedPollClientGraphicsRendererProcessStateResponseData
    : null
}

export interface CachedPollClientGraphicsRendererProcessStateResponseData {
  localStorageSessionCacheId: string
  buildVersion: ClientGraphicsRendererProcessState['buildVersion']
  pollClientGraphicsRendererProcessStateResponseMap: {
    [
      graphicsRendererProcessKey: string
    ]: PollClientGraphicsRendererProcessStateResponse
  }
}
