import { Input, Popover } from '@material-ui/core'
import Link, { LinkProps } from '@material-ui/core/Link'
import { makeStyles, Theme, useTheme } from '@material-ui/core/styles'
import { ArrowDropDownSharp } from '@material-ui/icons'
import React, {
  Dispatch,
  Fragment,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeData } from '../../helpers/decodeData'
import {
  ClientGraphicsRendererProcessInvalidBuildState,
  ClientGraphicsRendererProcessState,
  ClientGraphicsRendererProcessStateCodec,
  ClientGraphicsRendererProcessSuccessfulState,
  ClientGraphicsRendererProcessValidBuildState,
} from '../models/ClientGraphicsRendererProcessState'
import { GraphicsRendererProcessKey } from '../models/GraphicsRendererProcessKey'

export interface AnimationDevelopmentResultPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute
> extends Pick<
    AnimationDevelopmentPageProps<SomeAssetBaseRoute, '/result'>,
    'graphicsRendererProcessKey' | 'assetBaseRoute' | 'viewSubRoute'
  > {
  SomeAssetDisplay: (props: SomeAssetDisplayProps) => JSX.Element
}

export interface SomeAssetDisplayProps
  extends Pick<
    ClientGraphicsRendererProcessSuccessfulState,
    'graphicAssetUrl'
  > {}

export function AnimationDevelopmentResultPage<
  SomeAssetBaseRoute extends AssetBaseRoute
>(props: AnimationDevelopmentResultPageProps<SomeAssetBaseRoute>) {
  const {
    graphicsRendererProcessKey,
    assetBaseRoute,
    viewSubRoute,
    SomeAssetDisplay,
  } = props
  const styles = useAnimationDevelopmentResultPageStyles()
  return (
    <AnimationDevelopmentPage
      key={graphicsRendererProcessKey}
      graphicsRendererProcessKey={graphicsRendererProcessKey}
      assetBaseRoute={assetBaseRoute}
      viewSubRoute={viewSubRoute}
      SomeClientGraphicsRendererProcessPage={({
        clientGraphicsRendererProcessState,
      }) => {
        switch (clientGraphicsRendererProcessState.buildStatus) {
          case 'invalidBuild':
            return (
              <InvalidBuildClientGraphicsRendererProcessPage
                assetBaseRoute={assetBaseRoute}
                viewSubRoute={viewSubRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                viewRouteContent={
                  <AnimationDevelopmentErrorDisplay
                    errorMessage={
                      clientGraphicsRendererProcessState.buildErrorMessage
                    }
                  />
                }
              />
            )
          case 'validBuild':
            switch (
              clientGraphicsRendererProcessState.graphicsRendererProcessStatus
            ) {
              case 'processInitializing':
              case 'processActive':
                return (
                  <ValidBuildClientGraphicsRendererProcessPage
                    assetBaseRoute={assetBaseRoute}
                    viewSubRoute={viewSubRoute}
                    clientGraphicsRendererProcessState={
                      clientGraphicsRendererProcessState
                    }
                    viewRouteContent={
                      <div className={styles.inProgressContainer}>
                        in progress...
                      </div>
                    }
                  />
                )
              case 'processSuccessful':
                return (
                  <ValidBuildClientGraphicsRendererProcessPage
                    assetBaseRoute={assetBaseRoute}
                    viewSubRoute={viewSubRoute}
                    clientGraphicsRendererProcessState={
                      clientGraphicsRendererProcessState
                    }
                    viewRouteContent={
                      <div className={styles.assetContainer}>
                        <SomeAssetDisplay
                          graphicAssetUrl={
                            clientGraphicsRendererProcessState.graphicAssetUrl
                          }
                        />
                      </div>
                    }
                  />
                )
              case 'processFailed':
                return (
                  <ValidBuildClientGraphicsRendererProcessPage
                    assetBaseRoute={assetBaseRoute}
                    viewSubRoute={viewSubRoute}
                    clientGraphicsRendererProcessState={
                      clientGraphicsRendererProcessState
                    }
                    viewRouteContent={
                      <AnimationDevelopmentErrorDisplay
                        errorMessage={
                          clientGraphicsRendererProcessState.graphicsRendererProcessErrorMessage
                        }
                      />
                    }
                  />
                )
            }
        }
      }}
    />
  )
}

const useAnimationDevelopmentResultPageStyles = makeStyles((theme) => ({
  inProgressContainer: {
    padding: theme.spacing(1),
  },
  assetContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
    padding: theme.spacing(1),
  },
}))

interface AnimationDevelopmentErrorDisplayProps {
  errorMessage: string
}

function AnimationDevelopmentErrorDisplay(
  props: AnimationDevelopmentErrorDisplayProps
) {
  const { errorMessage } = props
  const styles = useAnimationDevelopmentErrorDisplayStyles()
  return (
    <div className={styles.errorMessageContainer}>
      <div className={styles.graphicsRendererProcessErrorMessage}>
        {errorMessage}
      </div>
    </div>
  )
}

const useAnimationDevelopmentErrorDisplayStyles = makeStyles((theme) => ({
  errorMessageContainer: {
    flexShrink: 1,
    flexGrow: 1,
    overflow: 'scroll',
    padding: theme.spacing(1),
  },
  graphicsRendererProcessErrorMessage: {
    backgroundColor: theme.palette.error.main,
    maxWidth: 600,
    padding: theme.spacing(1),
    whiteSpace: 'pre-wrap',
    color: theme.palette.getContrastText(theme.palette.error.main),
    fontSize: 14,
  },
}))

export interface AnimationDevelopmentLogsPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute
> extends Pick<
    AnimationDevelopmentPageProps<SomeAssetBaseRoute, '/logs'>,
    'graphicsRendererProcessKey' | 'assetBaseRoute' | 'viewSubRoute'
  > {}

export function AnimationDevelopmentLogsPage<
  SomeAssetBaseRoute extends AssetBaseRoute
>(props: AnimationDevelopmentLogsPageProps<SomeAssetBaseRoute>) {
  const { graphicsRendererProcessKey, assetBaseRoute, viewSubRoute } = props
  return (
    <AnimationDevelopmentPage
      key={graphicsRendererProcessKey}
      graphicsRendererProcessKey={graphicsRendererProcessKey}
      assetBaseRoute={assetBaseRoute}
      viewSubRoute={viewSubRoute}
      SomeClientGraphicsRendererProcessPage={({
        clientGraphicsRendererProcessState,
      }) => {
        switch (clientGraphicsRendererProcessState.buildStatus) {
          case 'invalidBuild':
            return (
              <InvalidBuildClientGraphicsRendererProcessPage
                assetBaseRoute={assetBaseRoute}
                viewSubRoute={viewSubRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                viewRouteContent={
                  <AnimationDevelopmentLogsDisplay
                    buildVersion={
                      clientGraphicsRendererProcessState.buildVersion
                    }
                    graphicsRendererProcessStdoutLog={''}
                    resultLink={
                      clientGraphicsRendererProcessState.buildStatus ===
                      'invalidBuild' ? (
                        <ViewResultLinkButton
                          assetBaseRoute={assetBaseRoute}
                          linkColor={'error'}
                          linkLabel={'view build error'}
                        />
                      ) : null
                    }
                  />
                }
              />
            )
          case 'validBuild':
            return (
              <ValidBuildClientGraphicsRendererProcessPage
                assetBaseRoute={assetBaseRoute}
                viewSubRoute={viewSubRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                viewRouteContent={
                  <AnimationDevelopmentLogsDisplay
                    buildVersion={
                      clientGraphicsRendererProcessState.buildVersion
                    }
                    graphicsRendererProcessStdoutLog={
                      clientGraphicsRendererProcessState.graphicsRendererProcessStdoutLog
                    }
                    resultLink={
                      clientGraphicsRendererProcessState.graphicsRendererProcessStatus ===
                      'processSuccessful' ? (
                        <ViewResultLinkButton
                          assetBaseRoute={assetBaseRoute}
                          linkColor={'secondary'}
                          linkLabel={'view rendered asset'}
                        />
                      ) : clientGraphicsRendererProcessState.graphicsRendererProcessStatus ===
                        'processFailed' ? (
                        <ViewResultLinkButton
                          assetBaseRoute={assetBaseRoute}
                          linkColor={'error'}
                          linkLabel={'view render error'}
                        />
                      ) : null
                    }
                  />
                }
              />
            )
        }
      }}
    />
  )
}

interface AnimationDevelopmentLogsDisplayProps
  extends Pick<
    ClientGraphicsRendererProcessValidBuildState,
    'buildVersion' | 'graphicsRendererProcessStdoutLog'
  > {
  resultLink: ReactNode
}

function AnimationDevelopmentLogsDisplay(
  props: AnimationDevelopmentLogsDisplayProps
) {
  const { buildVersion, graphicsRendererProcessStdoutLog, resultLink } = props
  const { managedScrollContainerRef } = useManagedScrollContainerRef({
    buildVersion,
    graphicsRendererProcessStdoutLog,
    resultLink,
    localStorageKey: 'animation-development-logs-display',
  })
  const styles = useAnimationDevelopmentLogsDisplayStyles()
  return (
    <div
      ref={managedScrollContainerRef}
      className={styles.logsDisplayContainer}
    >
      {graphicsRendererProcessStdoutLog}
      {resultLink}
    </div>
  )
}

const useAnimationDevelopmentLogsDisplayStyles = makeStyles((theme) => ({
  logsDisplayContainer: {
    flexShrink: 1,
    flexGrow: 1,
    padding: theme.spacing(1),
    overflow: 'auto',
    lineHeight: '1.25rem',
    whiteSpace: 'pre-wrap',
    fontSize: 12,
  },
}))

interface UseManagedScrollContainerRefApi
  extends Pick<
    AnimationDevelopmentLogsDisplayProps,
    'buildVersion' | 'graphicsRendererProcessStdoutLog' | 'resultLink'
  > {
  localStorageKey: string
}

function useManagedScrollContainerRef(api: UseManagedScrollContainerRefApi) {
  const {
    buildVersion,
    localStorageKey,
    graphicsRendererProcessStdoutLog,
    resultLink,
  } = api
  const managedScrollContainerRef = useRef<HTMLDivElement>(null)
  const managedScrollStateRef = useRef<ManagedScrollState>({
    buildVersion,
    automatedScrollEnabled: true,
    previousContainerScrollTop: null,
  })
  const scrollEventHandlerRef = useRef(() => {
    const currentManagedScrollState = managedScrollStateRef.current
    const currentManagedScrollContainer = managedScrollContainerRef.current
    if (currentManagedScrollContainer) {
      const userScrolledUp =
        currentManagedScrollState.previousContainerScrollTop !== null &&
        currentManagedScrollContainer.scrollTop <
          currentManagedScrollState.previousContainerScrollTop
      const currentScrollContainerScrollBottom =
        currentManagedScrollContainer.scrollTop +
        (currentManagedScrollContainer.getBoundingClientRect().height /
          currentManagedScrollContainer.scrollHeight) *
          currentManagedScrollContainer.scrollHeight
      const userScrolledToBottomOfContainer =
        currentScrollContainerScrollBottom /
          currentManagedScrollContainer.scrollHeight >
        0.975
      if (userScrolledUp) {
        currentManagedScrollState.automatedScrollEnabled = false
        currentManagedScrollState.previousContainerScrollTop =
          currentManagedScrollContainer.scrollTop
      } else if (userScrolledToBottomOfContainer) {
        currentManagedScrollState.automatedScrollEnabled = true
        currentManagedScrollState.previousContainerScrollTop = null
      } else {
        currentManagedScrollState.previousContainerScrollTop =
          currentManagedScrollContainer.scrollTop
      }
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(currentManagedScrollState)
      )
    }
  })
  useEffect(() => {
    const currentManagedScrollContainer = managedScrollContainerRef.current
    if (currentManagedScrollContainer) {
      currentManagedScrollContainer.addEventListener(
        'scroll',
        scrollEventHandlerRef.current
      )
      const cachedManagedScrollStateJson = localStorage.getItem(localStorageKey)
      const cachedManagedScrollState = cachedManagedScrollStateJson
        ? (JSON.parse(
            cachedManagedScrollStateJson
          ) as unknown as ManagedScrollState) || null
        : null
      if (buildVersion === cachedManagedScrollState?.buildVersion) {
        currentManagedScrollContainer.scroll({
          top: cachedManagedScrollState.previousContainerScrollTop || 0,
        })
        managedScrollStateRef.current = cachedManagedScrollState
      }
      return () => {
        currentManagedScrollContainer.removeEventListener(
          'scroll',
          scrollEventHandlerRef.current
        )
      }
    }
  }, [])
  useEffect(() => {
    const currentManagedScrollState = managedScrollStateRef.current
    if (buildVersion !== currentManagedScrollState.buildVersion) {
      currentManagedScrollState.buildVersion = buildVersion
      currentManagedScrollState.automatedScrollEnabled = true
      currentManagedScrollState.previousContainerScrollTop = null
    }
    const currentManagedScrollContainer = managedScrollContainerRef.current
    if (
      currentManagedScrollContainer &&
      currentManagedScrollState.automatedScrollEnabled
    ) {
      currentManagedScrollContainer.scroll({
        top: currentManagedScrollContainer.scrollHeight,
      })
    }
  }, [buildVersion, graphicsRendererProcessStdoutLog, resultLink])
  return { managedScrollContainerRef }
}

interface ManagedScrollState
  extends Pick<UseManagedScrollContainerRefApi, 'buildVersion'> {
  automatedScrollEnabled: boolean
  previousContainerScrollTop: number | null
}

interface ViewResultLinkButtonProps<SomeAssetBaseRoute extends AssetBaseRoute>
  extends Pick<
    AnimationDevelopmentLogsPageProps<SomeAssetBaseRoute>,
    'assetBaseRoute'
  > {
  linkLabel: string
  linkColor: LinkProps['color']
}

function ViewResultLinkButton<SomeAssetBaseRoute extends AssetBaseRoute>(
  props: ViewResultLinkButtonProps<SomeAssetBaseRoute>
) {
  const { assetBaseRoute, linkColor, linkLabel } = props
  return (
    <Link
      color={linkColor}
      href={`${assetBaseRoute}/result`}
      style={{
        fontWeight: 700,
      }}
    >
      {`${linkLabel} >`}
    </Link>
  )
}

interface AnimationDevelopmentPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> {
  assetBaseRoute: SomeAssetBaseRoute
  viewSubRoute: SomeViewSubRoute
  graphicsRendererProcessKey: GraphicsRendererProcessKey
  SomeClientGraphicsRendererProcessPage: (
    props: SomeClientGraphicsRendererProcessPageProps
  ) => JSX.Element
}

interface SomeClientGraphicsRendererProcessPageProps
  extends Pick<
    PollClientGraphicsRendererProcessStateSuccessResponse,
    'clientGraphicsRendererProcessState'
  > {}

function AnimationDevelopmentPage<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(props: AnimationDevelopmentPageProps<SomeAssetBaseRoute, SomeViewSubRoute>) {
  const { graphicsRendererProcessKey, SomeClientGraphicsRendererProcessPage } =
    props
  const { pollClientGraphicsRendererProcessStateResponse } =
    usePollClientGraphicsRendererProcessStateResponse({
      graphicsRendererProcessKey,
      staticPollRate: 500,
    })
  const styles = useAnimationDevelopmentPageStyles()
  switch (pollClientGraphicsRendererProcessStateResponse.responseStatus) {
    case 'serverInitializing':
      return (
        <Page
          assetRouteSelect={null}
          pageBody={
            <div className={styles.responseStatusDisplayContainer}>
              initializing...
            </div>
          }
        />
      )
    case 'serverError':
      return (
        <Page
          assetRouteSelect={null}
          pageBody={
            <div
              className={`${styles.responseStatusDisplayContainer} ${styles.responseStatusError}`}
            >
              wtf? server
            </div>
          }
        />
      )
    case 'fetchError':
      return (
        <Page
          assetRouteSelect={null}
          pageBody={
            <div
              className={`${styles.responseStatusDisplayContainer} ${styles.responseStatusError}`}
            >
              {
                pollClientGraphicsRendererProcessStateResponse.responseErrorMessage
              }
            </div>
          }
        />
      )
    case 'fetchSuccessful':
      const { clientGraphicsRendererProcessState } =
        pollClientGraphicsRendererProcessStateResponse
      return (
        <SomeClientGraphicsRendererProcessPage
          clientGraphicsRendererProcessState={
            clientGraphicsRendererProcessState
          }
        />
      )
  }
}

const useAnimationDevelopmentPageStyles = makeStyles((theme) => ({
  responseStatusDisplayContainer: {
    padding: theme.spacing(1),
  },
  responseStatusError: {
    color: theme.palette.error.main,
  },
}))

interface UsePollClientGraphicsRendererProcessStateResponseApi
  extends Pick<
    AnimationDevelopmentPageProps<AssetBaseRoute, ViewSubRoute>,
    'graphicsRendererProcessKey'
  > {
  staticPollRate: number
}

type PollClientGraphicsRendererProcessStateResponse =
  | PollClientGraphicsRendererProcessStateServerInitializingResponse
  | PollClientGraphicsRendererProcessStateSuccessResponse
  | PollClientGraphicsRendererProcessStateClientErrorResponse
  | PollClientGraphicsRendererProcessStateServerErrorResponse

interface PollClientGraphicsRendererProcessStateServerInitializingResponse
  extends PollClientGraphicsRendererProcessStateBase<
    'serverInitializing',
    204
  > {}

interface PollClientGraphicsRendererProcessStateSuccessResponse
  extends PollClientGraphicsRendererProcessStateBase<'fetchSuccessful', 200> {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessState
}

interface PollClientGraphicsRendererProcessStateClientErrorResponse
  extends PollClientGraphicsRendererProcessStateBase<'fetchError', 400> {
  responseErrorMessage: string
}

interface PollClientGraphicsRendererProcessStateServerErrorResponse
  extends PollClientGraphicsRendererProcessStateBase<'serverError', 500> {}

interface PollClientGraphicsRendererProcessStateBase<
  ResponseStatus extends string,
  ResponseStatusCode extends number
> {
  responseStatus: ResponseStatus
  responseStatusCode: ResponseStatusCode
}

function usePollClientGraphicsRendererProcessStateResponse(
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

interface InvalidBuildClientGraphicsRendererProcessPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
    ClientGraphicsRendererProcessPageProps<
      SomeAssetBaseRoute,
      SomeViewSubRoute
    >,
    'assetBaseRoute' | 'viewSubRoute' | 'viewRouteContent'
  > {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessInvalidBuildState
}

function InvalidBuildClientGraphicsRendererProcessPage<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(
  props: InvalidBuildClientGraphicsRendererProcessPageProps<
    SomeAssetBaseRoute,
    SomeViewSubRoute
  >
) {
  const {
    assetBaseRoute,
    viewSubRoute,
    viewRouteContent,
    clientGraphicsRendererProcessState,
  } = props
  return (
    <ClientGraphicsRendererProcessPage
      assetBaseRoute={assetBaseRoute}
      viewSubRoute={viewSubRoute}
      viewRouteContent={viewRouteContent}
      buildStatusDisplayValue={'invalid'}
      moduleNameDisplayValue={'-'}
      targetAssetDisplayValue={'-'}
      renderStatusDisplayValue={'-'}
      buildVersionDisplayValue={`${clientGraphicsRendererProcessState.buildVersion}`}
    />
  )
}

interface ValidBuildClientGraphicsRendererProcessPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
    ClientGraphicsRendererProcessPageProps<
      SomeAssetBaseRoute,
      SomeViewSubRoute
    >,
    'assetBaseRoute' | 'viewSubRoute' | 'viewRouteContent'
  > {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessValidBuildState
}

function ValidBuildClientGraphicsRendererProcessPage<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(
  props: ValidBuildClientGraphicsRendererProcessPageProps<
    SomeAssetBaseRoute,
    SomeViewSubRoute
  >
) {
  const {
    assetBaseRoute,
    viewSubRoute,
    viewRouteContent,
    clientGraphicsRendererProcessState,
  } = props
  return (
    <ClientGraphicsRendererProcessPage
      assetBaseRoute={assetBaseRoute}
      viewSubRoute={viewSubRoute}
      viewRouteContent={viewRouteContent}
      moduleNameDisplayValue={
        clientGraphicsRendererProcessState.animationModule.moduleName
      }
      targetAssetDisplayValue={
        clientGraphicsRendererProcessState.graphicsRendererProcessKey
      }
      buildStatusDisplayValue={'valid'}
      buildVersionDisplayValue={`${clientGraphicsRendererProcessState.buildVersion}`}
      renderStatusDisplayValue={getProcessStatusDisplayValue({
        graphicsRendererProcessStatus:
          clientGraphicsRendererProcessState.graphicsRendererProcessStatus,
      })}
    />
  )
}

interface GetProcessStatusDisplayValueApi
  extends Pick<
    ValidBuildClientGraphicsRendererProcessPageProps<
      AssetBaseRoute,
      ViewSubRoute
    >['clientGraphicsRendererProcessState'],
    'graphicsRendererProcessStatus'
  > {}

function getProcessStatusDisplayValue(api: GetProcessStatusDisplayValueApi) {
  const { graphicsRendererProcessStatus } = api
  switch (graphicsRendererProcessStatus) {
    case 'processInitializing':
    case 'processActive':
      return 'in progress...'
    case 'processSuccessful':
      return 'success'
    case 'processFailed':
      return 'error'
  }
}

interface ClientGraphicsRendererProcessPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
    AnimationDevelopmentPageProps<SomeAssetBaseRoute, SomeViewSubRoute>,
    'assetBaseRoute' | 'viewSubRoute'
  > {
  buildVersionDisplayValue: string
  buildStatusDisplayValue: string
  moduleNameDisplayValue: string
  targetAssetDisplayValue: string
  renderStatusDisplayValue: string
  viewRouteContent: ReactNode
}

function ClientGraphicsRendererProcessPage<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(
  props: ClientGraphicsRendererProcessPageProps<
    SomeAssetBaseRoute,
    SomeViewSubRoute
  >
) {
  const {
    viewSubRoute,
    assetBaseRoute,
    buildVersionDisplayValue,
    buildStatusDisplayValue,
    moduleNameDisplayValue,
    targetAssetDisplayValue,
    renderStatusDisplayValue,
    viewRouteContent,
  } = props
  const navigateToRoute = useNavigate()
  const styles = useClientGraphicsRendererProcessPageStyles()
  return (
    <Page
      assetRouteSelect={
        <AssetRouteSelect
          assetBaseRoute={assetBaseRoute}
          viewSubRoute={viewSubRoute}
          frameCount={todo}
        />
      }
      pageBody={
        <Fragment>
          <div className={styles.pageOverviewContainer}>
            <div className={styles.pageNavigationContainer}>
              <OptionField
                optionLabel={'logs'}
                optionSelected={viewSubRoute === '/logs'}
                onClick={() => {
                  navigateToRoute(`${assetBaseRoute}/logs`)
                }}
              />
              <OptionField
                optionLabel={'result'}
                optionSelected={viewSubRoute === '/result'}
                onClick={() => {
                  navigateToRoute(`${assetBaseRoute}/result`)
                }}
              />
            </div>
            <div className={styles.pageDetailsContainer}>
              <FieldDisplay
                fieldLabel={'build version'}
                fieldValue={buildVersionDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'build status'}
                fieldValue={buildStatusDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'module name'}
                fieldValue={moduleNameDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'target asset'}
                fieldValue={targetAssetDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'render status'}
                fieldValue={renderStatusDisplayValue}
              />
            </div>
          </div>
          {viewRouteContent}
        </Fragment>
      }
    />
  )
}

const useClientGraphicsRendererProcessPageStyles = makeStyles((theme) => ({
  pageOverviewContainer: {
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
  },
  pageNavigationContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageDetailsContainer: {
    paddingLeft: theme.spacing(3),
  },
}))

interface AssetRouteSelectProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
    ClientGraphicsRendererProcessPageProps<
      SomeAssetBaseRoute,
      SomeViewSubRoute
    >,
    'assetBaseRoute' | 'viewSubRoute'
  > {
  frameCount: number
}

function AssetRouteSelect<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(props: AssetRouteSelectProps<SomeAssetBaseRoute, SomeViewSubRoute>) {
  const { assetBaseRoute, viewSubRoute, frameCount } = props
  const [assetRouteSearchQuery, setAssetRouteSearchQuery] = useState('')
  const [selectingAssetRoute, setSelectingAssetRoute] = useState(false)
  const assetRouteBaseOptions = useMemo<GraphicsRendererProcessKey[]>(
    () => [
      'animation',
      ...new Array(frameCount)
        .fill(undefined)
        .map<GraphicsRendererProcessKey>(
          (_, someFrameIndex) => `frame/${someFrameIndex}`
        ),
    ],
    [frameCount]
  )
  const filteredAssetRouteOptions = useMemo(
    () =>
      assetRouteBaseOptions.filter((someAssetRouteBaseOption) =>
        someAssetRouteBaseOption.includes(assetRouteSearchQuery)
      ),
    [assetRouteSearchQuery, assetRouteBaseOptions]
  )
  const [focusedAssetRouteOptionIndex, setFocusedAssetRouteOptionIndex] =
    useState(0)
  useEffect(() => {
    setFocusedAssetRouteOptionIndex(0)
  }, [filteredAssetRouteOptions])
  const targetAssetLabelRef = useRef<HTMLDivElement>(null)
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const focusedLinkRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const optionsContainerBoundingClientRect =
      optionsContainerRef.current?.getBoundingClientRect()
    const focusedLinkBoundingClientRect =
      focusedLinkRef.current?.getBoundingClientRect()
    if (
      optionsContainerBoundingClientRect &&
      focusedLinkBoundingClientRect &&
      (focusedLinkBoundingClientRect.bottom >
        optionsContainerBoundingClientRect.bottom ||
        focusedLinkBoundingClientRect.top <
          optionsContainerBoundingClientRect.top)
    ) {
      focusedLinkRef.current!.scrollIntoView()
    }
  }, [focusedAssetRouteOptionIndex])
  const theme = useTheme()
  const navigateToRoute = useNavigate()
  const styles = useAssetRouteSelectStyles()
  return (
    <div>
      <div
        ref={targetAssetLabelRef}
        className={styles.selectedAssetRouteDisplay}
        onClick={() => {
          setSelectingAssetRoute(true)
        }}
      >
        {assetBaseRoute.slice(1)}
        <ArrowDropDownSharp />
      </div>
      <Popover
        transitionDuration={0}
        anchorEl={targetAssetLabelRef.current}
        open={selectingAssetRoute}
        PaperProps={{
          square: true,
          elevation: 3,
          style: {},
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={() => {
          setSelectingAssetRoute(false)
        }}
      >
        <div
          className={styles.dropdownContainer}
          onKeyDown={(someKeyDownEvent) => {
            switch (someKeyDownEvent.key) {
              case 'ArrowDown':
                if (
                  focusedAssetRouteOptionIndex <
                  filteredAssetRouteOptions.length - 1
                ) {
                  setFocusedAssetRouteOptionIndex(
                    focusedAssetRouteOptionIndex + 1
                  )
                }
                break
              case 'ArrowUp':
                if (focusedAssetRouteOptionIndex > 0) {
                  setFocusedAssetRouteOptionIndex(
                    focusedAssetRouteOptionIndex - 1
                  )
                }
                break
              case 'Enter':
                navigateToRoute(
                  `/${filteredAssetRouteOptions[
                    focusedAssetRouteOptionIndex
                  ]!}${viewSubRoute}`
                )
                break
            }
          }}
        >
          <div className={styles.searchInputContainer}>
            <Input
              fullWidth={true}
              disableUnderline={true}
              autoFocus={true}
              placeholder={'select target asset'}
              onChange={(someChangeEvent) => {
                setAssetRouteSearchQuery(someChangeEvent.currentTarget.value)
              }}
            />
          </div>
          <div className={styles.searchInputDivider} />
          <div ref={optionsContainerRef} className={styles.optionsContainer}>
            {filteredAssetRouteOptions.length > 0 ? (
              filteredAssetRouteOptions.map(
                (
                  someFilteredAssetRouteOption,
                  filteredAssetRouteOptionIndex
                ) => (
                  <Link
                    ref={
                      filteredAssetRouteOptionIndex ===
                      focusedAssetRouteOptionIndex
                        ? focusedLinkRef
                        : null
                    }
                    tabIndex={-1}
                    key={someFilteredAssetRouteOption}
                    color={'secondary'}
                    className={`${styles.optionLink} ${
                      filteredAssetRouteOptionIndex ===
                      focusedAssetRouteOptionIndex
                        ? 'focused-option'
                        : ''
                    } ${
                      someFilteredAssetRouteOption === assetBaseRoute.slice(1)
                        ? 'current-option'
                        : ''
                    }`}
                    href={`/${someFilteredAssetRouteOption}${viewSubRoute}`}
                  >
                    {someFilteredAssetRouteOption}
                  </Link>
                )
              )
            ) : (
              <div className={styles.noOptionsDisplay}>no options match</div>
            )}
          </div>
        </div>
      </Popover>
    </div>
  )
}

const useAssetRouteSelectStyles = makeStyles((theme) => ({
  selectedAssetRouteDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: theme.palette.primary.light,
  },
  searchInputContainer: {
    padding: theme.spacing(1),
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.5),
  },
  searchInputDivider: {
    margin: '0 -9999rem',
    height: 2,
    backgroundColor: theme.palette.primary.light,
  },
  optionsContainer: {
    flexBasis: 252,
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
  },
  optionLink: {
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(1.25),
    color: theme.palette.secondary.main,
    fontWeight: 700,
    '&.focused-option': {
      backgroundColor: theme.palette.grey[100],
      textDecoration: 'underline',
    },
    '&.current-option': {
      fontStyle: 'italic',
    },
    '&:focus': {
      outline: 'none',
    },
  },
  noOptionsDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    fontStyle: 'italic',
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.palette.text.hint,
  },
}))

interface OptionFieldProps extends Pick<HTMLAttributes<SVGElement>, 'onClick'> {
  optionLabel: string
  optionSelected: boolean
}

function OptionField(props: OptionFieldProps) {
  const { optionLabel, optionSelected, onClick } = props
  const theme = useTheme()
  const styles = useOptionFieldStyles(props)
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.optionInputContainer}>
        <svg
          viewBox={`0 0 1 1`}
          className={styles.optionInput}
          onClick={onClick}
        >
          <rect
            fill={theme.palette.secondary.main}
            x={0}
            y={0}
            width={1}
            height={1}
          />
          <rect
            fill={theme.palette.common.white}
            x={0.05}
            y={0.05}
            width={0.9}
            height={0.9}
          />
          <rect
            fill={optionSelected ? theme.palette.secondary.main : 'transparent'}
            x={0.2}
            y={0.2}
            width={0.6}
            height={0.6}
          />
        </svg>
      </div>
      <div className={styles.optionLabel}>{optionLabel}</div>
    </div>
  )
}

const useOptionFieldStyles = makeStyles<Theme, OptionFieldProps>((theme) => ({
  fieldContainer: {
    marginBottom: theme.spacing(0.25),
    display: 'flex',
    flexDirection: 'row',
  },
  optionInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: theme.spacing(1),
  },
  optionInput: {
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  optionLabel: {
    fontWeight: 600,
  },
}))

interface FieldDisplayProps {
  fieldLabel: string
  fieldValue: string
}

function FieldDisplay(props: FieldDisplayProps) {
  const { fieldLabel, fieldValue } = props
  const styles = useFieldDisplayStyles()
  return (
    <div className={styles.displayContainer}>
      <div className={styles.fieldLabel}>{fieldLabel.toLowerCase()}:</div>
      <div className={styles.fieldValue}>{fieldValue.toLowerCase()}</div>
    </div>
  )
}

const useFieldDisplayStyles = makeStyles((theme) => ({
  displayContainer: {
    marginBottom: theme.spacing(0.25),
    display: 'flex',
    flexDirection: 'row',
  },
  fieldLabel: {
    fontWeight: 300,
    fontSize: 14,
  },
  fieldValue: {
    fontWeight: 500,
    fontSize: 14,
    marginLeft: theme.spacing(1),
  },
}))

export interface PageProps {
  assetRouteSelect: ReactNode
  pageBody: ReactNode
}

export function Page(props: PageProps) {
  const { assetRouteSelect, pageBody } = props
  const styles = usePageStyles()
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleContainer}>
          <div className={styles.pageTitle}>graphics-renderer</div>
        </div>
        <div className={styles.selectContainer}>{assetRouteSelect}</div>
      </div>
      {pageBody}
    </div>
  )
}

export const usePageStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      fontFamily: theme.typography.fontFamily,
    },
  },
  pageContainer: {
    border: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1.5),
  },
  titleContainer: {
    flexGrow: 1,
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  selectContainer: {
    flexShrink: 0,
  },
}))

type AssetBaseRoute = `/${GraphicsRendererProcessKey}`

type ViewSubRoute = '/logs' | '/result'
