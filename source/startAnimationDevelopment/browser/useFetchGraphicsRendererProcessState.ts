// import {
//   Dispatch,
//   MutableRefObject,
//   SetStateAction,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react'
// import { decodeData } from '../../helpers/decodeData'
// import {
//   ClientGraphicsRendererProcessState,
//   ClientGraphicsRendererProcessStateCodec,
// } from '../models/ClientGraphicsRendererProcessState'

// export interface UseFetchGraphicsRendererProcessStateApi {
//   graphicsRendererProcessKey: string
//   staticPollRate: number
// }

// export type RenderTargetParams =
//   | AnimationRenderTargetParams
//   | FrameRenderTargetParams

// interface AnimationRenderTargetParams
//   extends RenderTargetParamsBase<'animation'> {}

// interface FrameRenderTargetParams extends RenderTargetParamsBase<'frame'> {
//   frameIndex: `${number}`
// }

// interface RenderTargetParamsBase<RenderType extends string> {
//   renderType: RenderType
// }

// export type FetchGraphicsRendererProcessState =
//   | FetchGraphicsRendererProcessServerInitializingState
//   | FetchGraphicsRendererProcessSuccessState
//   | FetchGraphicsRendererProcessClientErrorState
//   | FetchGraphicsRendererProcessServerErrorState

// interface FetchGraphicsRendererProcessServerInitializingState
//   extends FetchGraphicsRendererProcessStateBase<'serverInitializing', 204> {}

// export interface FetchGraphicsRendererProcessSuccessState
//   extends FetchGraphicsRendererProcessStateBase<'fetchSuccessful', 200> {
//   fetchedGraphicsRendererProcessState: ClientGraphicsRendererProcessState
// }

// interface FetchGraphicsRendererProcessClientErrorState
//   extends FetchGraphicsRendererProcessStateBase<'fetchError', 400> {
//   fetchErrorMessage: string
// }

// interface FetchGraphicsRendererProcessServerErrorState
//   extends FetchGraphicsRendererProcessStateBase<'serverError', 500> {}

// interface FetchGraphicsRendererProcessStateBase<
//   FetchStatus extends string,
//   FetchStatusCode extends number
// > {
//   fetchStatus: FetchStatus
//   fetchStatusCode: FetchStatusCode
// }

// export function useFetchGraphicsRendererProcessState(
//   api: UseFetchGraphicsRendererProcessStateApi
// ) {
//   const { graphicsRendererProcessKey, staticPollRate } = api
//   const localStorageSessionCacheId = useMemo(
//     () =>
//       document
//         .getElementById('client-page-bundle-script')
//         ?.getAttribute('data-local-storage-session-cache-id')!,
//     []
//   )
//   const [
//     fetchGraphicsRendererProcessState,
//     setFetchGraphicsRendererProcessState,
//   ] = useState<FetchGraphicsRendererProcessState>(
//     getInitialFetchGraphicsRendererProcessState({
//       graphicsRendererProcessKey,
//       localStorageSessionCacheId,
//     })
//   )
//   const fetchGraphicsRendererProcessStateRef =
//     useRef<FetchGraphicsRendererProcessState>(fetchGraphicsRendererProcessState)
//   useEffect(() => {
//     const fetchLatestGraphicsRendererProcessStateIntervalHandle = setInterval(
//       async () => {
//         const fetchLatestGraphicsRendererProcessStateResponse = await fetch(
//           `/api/latestAnimationModule/graphicsRendererProcessState?graphicsRendererProcessKey=${graphicsRendererProcessKey}`
//         )
//         switch (fetchLatestGraphicsRendererProcessStateResponse.status) {
//           case 204:
//             break
//           case 200:
//             const fetchLatestGraphicsRendererProcessStateResponseData =
//               await fetchLatestGraphicsRendererProcessStateResponse.json()
//             const fetchedGraphicsRendererProcessState =
//               await decodeData<ClientGraphicsRendererProcessState>({
//                 inputData: fetchLatestGraphicsRendererProcessStateResponseData,
//                 targetCodec: ClientGraphicsRendererProcessStateCodec,
//               })
//             maybeSetFetchGraphicsRendererProcessState({
//               graphicsRendererProcessKey,
//               localStorageSessionCacheId,
//               setFetchGraphicsRendererProcessState,
//               fetchGraphicsRendererProcessStateRef,
//               maybeNextFetchGraphicsRendererProcessState: {
//                 fetchedGraphicsRendererProcessState,
//                 fetchStatus: 'fetchSuccessful',
//                 fetchStatusCode: 200,
//               },
//             })
//             break
//           case 400:
//             const fetchErrorMessage =
//               await fetchLatestGraphicsRendererProcessStateResponse.text()
//             maybeSetFetchGraphicsRendererProcessState({
//               graphicsRendererProcessKey,
//               localStorageSessionCacheId,
//               setFetchGraphicsRendererProcessState,
//               fetchGraphicsRendererProcessStateRef,
//               maybeNextFetchGraphicsRendererProcessState: {
//                 fetchErrorMessage,
//                 fetchStatus: 'fetchError',
//                 fetchStatusCode: 400,
//               },
//             })
//             break
//           case 500:
//             maybeSetFetchGraphicsRendererProcessState({
//               graphicsRendererProcessKey,
//               localStorageSessionCacheId,
//               setFetchGraphicsRendererProcessState,
//               fetchGraphicsRendererProcessStateRef,
//               maybeNextFetchGraphicsRendererProcessState: {
//                 fetchStatus: 'serverError',
//                 fetchStatusCode: 500,
//               },
//             })
//             break
//           default:
//             break
//         }
//       },
//       staticPollRate
//     )
//     return () => {
//       clearInterval(fetchLatestGraphicsRendererProcessStateIntervalHandle)
//     }
//   }, [])
//   return { fetchGraphicsRendererProcessState }
// }

// interface GetInitialFetchGraphicsRendererProcessStateApi
//   extends Pick<
//     UseFetchGraphicsRendererProcessStateApi,
//     'graphicsRendererProcessKey'
//   > {
//   localStorageSessionCacheId: string
// }

// function getInitialFetchGraphicsRendererProcessState(
//   api: GetInitialFetchGraphicsRendererProcessStateApi
// ): FetchGraphicsRendererProcessState {
//   const { graphicsRendererProcessKey, localStorageSessionCacheId } = api
//   const maybeCachedFetchGraphicsRendererProcessStateDataString =
//     localStorage.getItem(graphicsRendererProcessKey)
//   const maybeCachedFetchGraphicsRendererProcessStateData =
//     maybeCachedFetchGraphicsRendererProcessStateDataString
//       ? (JSON.parse(
//           maybeCachedFetchGraphicsRendererProcessStateDataString
//         ) as unknown as CachedFetchGraphicsRendererProcessStateData | null)
//       : null
//   if (
//     localStorageSessionCacheId ===
//     maybeCachedFetchGraphicsRendererProcessStateData?.localStorageSessionCacheId
//   ) {
//     return maybeCachedFetchGraphicsRendererProcessStateData.fetchGraphicsRendererProcessState
//   } else {
//     return {
//       fetchStatus: 'serverInitializing',
//       fetchStatusCode: 204,
//     }
//   }
// }

// interface MaybeSetFetchGraphicsRendererProcessStateApi
//   extends Pick<
//     UseFetchGraphicsRendererProcessStateApi,
//     'graphicsRendererProcessKey'
//   > {
//   localStorageSessionCacheId: string
//   maybeNextFetchGraphicsRendererProcessState: FetchGraphicsRendererProcessState
//   fetchGraphicsRendererProcessStateRef: MutableRefObject<FetchGraphicsRendererProcessState>
//   setFetchGraphicsRendererProcessState: Dispatch<
//     SetStateAction<FetchGraphicsRendererProcessState>
//   >
// }

// function maybeSetFetchGraphicsRendererProcessState(
//   api: MaybeSetFetchGraphicsRendererProcessStateApi
// ) {
//   const {
//     maybeNextFetchGraphicsRendererProcessState,
//     fetchGraphicsRendererProcessStateRef,
//     localStorageSessionCacheId,
//     graphicsRendererProcessKey,
//     setFetchGraphicsRendererProcessState,
//   } = api
//   const currentFetchGraphicsRendererProcessState =
//     fetchGraphicsRendererProcessStateRef.current
//   const fetchStatusDifferent =
//     maybeNextFetchGraphicsRendererProcessState.fetchStatus !==
//     currentFetchGraphicsRendererProcessState.fetchStatus
//   const fetchedGraphicsRendererProcessStateDifferent =
//     maybeNextFetchGraphicsRendererProcessState.fetchStatus ===
//       'fetchSuccessful' &&
//     currentFetchGraphicsRendererProcessState.fetchStatus ===
//       'fetchSuccessful' &&
//     (maybeNextFetchGraphicsRendererProcessState
//       .fetchedGraphicsRendererProcessState.buildVersion !==
//       currentFetchGraphicsRendererProcessState
//         .fetchedGraphicsRendererProcessState.buildVersion ||
//       maybeNextFetchGraphicsRendererProcessState
//         .fetchedGraphicsRendererProcessState.graphicsRendererProcessStatus !==
//         currentFetchGraphicsRendererProcessState
//           .fetchedGraphicsRendererProcessState.graphicsRendererProcessStatus ||
//       maybeNextFetchGraphicsRendererProcessState
//         .fetchedGraphicsRendererProcessState.graphicsRendererProcessStdoutLog !==
//         currentFetchGraphicsRendererProcessState
//           .fetchedGraphicsRendererProcessState.graphicsRendererProcessStdoutLog)
//   const fetchErrorMessageDifferent =
//     maybeNextFetchGraphicsRendererProcessState.fetchStatus === 'fetchError' &&
//     currentFetchGraphicsRendererProcessState.fetchStatus === 'fetchError' &&
//     maybeNextFetchGraphicsRendererProcessState.fetchErrorMessage !==
//       currentFetchGraphicsRendererProcessState.fetchErrorMessage
//   if (
//     fetchStatusDifferent ||
//     fetchedGraphicsRendererProcessStateDifferent ||
//     fetchErrorMessageDifferent
//   ) {
//     fetchGraphicsRendererProcessStateRef.current =
//       maybeNextFetchGraphicsRendererProcessState
//     const nextCachedFetchGraphicsRendererProcessStateData: CachedFetchGraphicsRendererProcessStateData =
//       {
//         localStorageSessionCacheId,
//         fetchGraphicsRendererProcessState:
//           maybeNextFetchGraphicsRendererProcessState,
//       }
//     localStorage.setItem(
//       graphicsRendererProcessKey,
//       JSON.stringify(nextCachedFetchGraphicsRendererProcessStateData)
//     )
//     setFetchGraphicsRendererProcessState(
//       maybeNextFetchGraphicsRendererProcessState
//     )
//   }
// }

// interface CachedFetchGraphicsRendererProcessStateData {
//   localStorageSessionCacheId: string
//   fetchGraphicsRendererProcessState: FetchGraphicsRendererProcessState
// }
