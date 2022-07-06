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

export interface PollClientGraphicsRendererProcessStateSuccessResponse<
  SomeClientGraphicsRendererProcessState extends ClientGraphicsRendererProcessState = ClientGraphicsRendererProcessState
> extends PollClientGraphicsRendererProcessStateBase<'fetchSuccessful', 200> {
  clientGraphicsRendererProcessState: SomeClientGraphicsRendererProcessState
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
  cachedPollClientGraphicsRendererProcessStateResponseData: CachedPollClientGraphicsRendererProcessStateResponseData | null
} {
  const { localStorageKey, graphicsRendererProcessKey, staticPollRate } = api
  const localStorageSessionCacheId = useMemo(
    () =>
      document
        .getElementById('client-page-bundle-script')
        ?.getAttribute('data-local-storage-session-cache-id')!,
    []
  )
  const { cachedPollClientGraphicsRendererProcessStateResponseData } =
    useMemo(() => {
      return getCachedPollClientGraphicsRendererProcessStateResponseData({
        localStorageKey,
        localStorageSessionCacheId,
      })
    }, [])
  const [
    pollClientGraphicsRendererProcessStateResponse,
    setPollClientGraphicsRendererProcessStateResponse,
  ] = useState<PollClientGraphicsRendererProcessStateResponse>(
    getInitialPollClientGraphicsRendererProcessStateResponse({
      graphicsRendererProcessKey,
      cachedPollClientGraphicsRendererProcessStateResponseData,
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
              cachedPollClientGraphicsRendererProcessStateResponseData,
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
              cachedPollClientGraphicsRendererProcessStateResponseData,
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
              cachedPollClientGraphicsRendererProcessStateResponseData,
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
  return {
    pollClientGraphicsRendererProcessStateResponse,
    cachedPollClientGraphicsRendererProcessStateResponseData,
  }
}

interface GetInitialPollClientGraphicsRendererProcessStateResponseApi
  extends Pick<
      UsePollClientGraphicsRendererProcessStateResponseApi,
      'graphicsRendererProcessKey'
    >,
    Pick<
      ReturnType<
        typeof getCachedPollClientGraphicsRendererProcessStateResponseData
      >,
      'cachedPollClientGraphicsRendererProcessStateResponseData'
    > {}

function getInitialPollClientGraphicsRendererProcessStateResponse(
  api: GetInitialPollClientGraphicsRendererProcessStateResponseApi
): PollClientGraphicsRendererProcessStateResponse {
  const {
    cachedPollClientGraphicsRendererProcessStateResponseData,
    graphicsRendererProcessKey,
  } = api
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
    >,
    Pick<
      ReturnType<
        typeof getCachedPollClientGraphicsRendererProcessStateResponseData
      >,
      'cachedPollClientGraphicsRendererProcessStateResponseData'
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
    setPollClientGraphicsRendererProcessStateResponse,
    cachedPollClientGraphicsRendererProcessStateResponseData,
    localStorageSessionCacheId,
    maybeNextPollClientGraphicsRendererProcessStateResponse,
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

interface GetCachedPollClientGraphicsRendererProcessStateResponseDataApi
  extends Pick<
    UsePollClientGraphicsRendererProcessStateResponseApi,
    'localStorageKey'
  > {
  localStorageSessionCacheId: string
}

function getCachedPollClientGraphicsRendererProcessStateResponseData(
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
  return {
    cachedPollClientGraphicsRendererProcessStateResponseData:
      localStorageSessionCacheId ===
      cachedPollClientGraphicsRendererProcessStateResponseData?.localStorageSessionCacheId
        ? cachedPollClientGraphicsRendererProcessStateResponseData
        : null,
  }
}

interface CachedPollClientGraphicsRendererProcessStateResponseData {
  localStorageSessionCacheId: string
  buildVersion: ClientGraphicsRendererProcessState['buildVersion']
  pollClientGraphicsRendererProcessStateResponseMap: {
    [
      graphicsRendererProcessKey: string
    ]: PollClientGraphicsRendererProcessStateResponse
  }
}
