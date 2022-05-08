import { makeStyles, Theme, useTheme } from '@material-ui/core/styles'
import React, { Fragment, HTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClientGraphicsRendererProcessInvalidBundleState,
  ClientGraphicsRendererProcessState,
  ClientGraphicsRendererProcessSuccessfulState,
} from '../models/ClientGraphicsRendererProcessState'
import { Page } from './Page'

export interface AnimationDevelopmentPageProps {
  baseRoute: '/animation' | `/frame/${number}`
  subRoute: '/logs' | '/result'
  AssetDisplay: (props: AssetDisplayProps) => JSX.Element
}

export interface AssetDisplayProps
  extends Pick<
    ClientGraphicsRendererProcessSuccessfulState,
    'graphicAssetUrl'
  > {}

export function AnimationDevelopmentPage(props: AnimationDevelopmentPageProps) {
  const { baseRoute, subRoute, AssetDisplay } = props
  const { pollClientGraphicsRendererProcessStateResponse } =
    usePollClientGraphicsRendererProcessStateResponse()
  const styles = useAnimationDevelopmentPageStyles()
  switch (pollClientGraphicsRendererProcessStateResponse.responseStatus) {
    case 'serverInitializing':
      return (
        <Page
          pageBody={
            <div className={styles.initializingContainer}>initializing...</div>
          }
        />
      )
    case 'fetchError':
      return (
        <Page
          pageBody={
            <div>
              {pollClientGraphicsRendererProcessStateResponse.fetchErrorMessage}
            </div>
          }
        />
      )
    case 'serverError':
      return <Page pageBody={<div>wtf? server</div>} />
    case 'fetchSuccessful':
      const { clientGraphicsRendererProcessState } =
        pollClientGraphicsRendererProcessStateResponse
      switch (subRoute) {
        case '/logs':
          return
        case '/result':
          return
      }
      switch (clientGraphicsRendererProcessState.latestBundleStatus) {
        case 'bundleInvalid':
          switch (subRoute) {
            case '/logs':
              return (
                <ClientGraphicsRendererProcessInvalidBundlePage
                  baseRoute={baseRoute}
                  subRoute={subRoute}
                  clientGraphicsRendererProcessState={
                    clientGraphicsRendererProcessState
                  }
                  InvalidBundleSubRouteContent={todo}
                />
              )
            case '/result':
              return (
                <ClientGraphicsRendererProcessInvalidBundlePage
                  baseRoute={baseRoute}
                  subRoute={subRoute}
                  clientGraphicsRendererProcessState={
                    clientGraphicsRendererProcessState
                  }
                  InvalidBundleSubRouteContent={todo}
                />
              )
          }
        case 'bundleValid':
          switch (subRoute) {
            case '/logs':
              return (
                <ClientGraphicsRendererProcessPage
                  moduleStatusDisplayValue={'module valid'}
                  baseRoute={baseRoute}
                  subRoute={subRoute}
                  moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
                  animationNameDisplayValue={
                    clientGraphicsRendererProcessState.animationModule
                      .animationName
                  }
                  processKeyDisplayValue={
                    clientGraphicsRendererProcessState.graphicsRendererProcessKey
                  }
                  processStatusDisplayValue={
                    clientGraphicsRendererProcessState.graphicsRendererProcessStatus
                  }
                  subRouteContent={
                    <div className={styles.logsDisplayContainer}>
                      {clientGraphicsRendererProcessState.processStdoutLog}
                    </div>
                  }
                />
              )
            case '/result':
              switch (
                clientGraphicsRendererProcessState.graphicsRendererProcessStatus
              ) {
                case 'processInitializing':
                case 'processActive':
                  return (
                    <ClientGraphicsRendererProcessPage
                      moduleStatusDisplayValue={'module valid'}
                      baseRoute={baseRoute}
                      subRoute={subRoute}
                      moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
                      animationNameDisplayValue={
                        clientGraphicsRendererProcessState.animationModule
                          .animationName
                      }
                      processKeyDisplayValue={
                        clientGraphicsRendererProcessState.graphicsRendererProcessKey
                      }
                      processStatusDisplayValue={
                        clientGraphicsRendererProcessState.graphicsRendererProcessStatus
                      }
                      subRouteContent={<div>in progress...</div>}
                    />
                  )
                case 'processSuccessful':
                  return (
                    <ClientGraphicsRendererProcessPage
                      moduleStatusDisplayValue={'module valid'}
                      baseRoute={baseRoute}
                      subRoute={subRoute}
                      moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
                      animationNameDisplayValue={
                        clientGraphicsRendererProcessState.animationModule
                          .animationName
                      }
                      processKeyDisplayValue={
                        clientGraphicsRendererProcessState.graphicsRendererProcessKey
                      }
                      processStatusDisplayValue={
                        clientGraphicsRendererProcessState.graphicsRendererProcessStatus
                      }
                      subRouteContent={
                        <div className={styles.assetContainer}>
                          <AssetDisplay
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
                    <ClientGraphicsRendererProcessPage
                      moduleStatusDisplayValue={'module valid'}
                      baseRoute={baseRoute}
                      subRoute={subRoute}
                      moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
                      animationNameDisplayValue={
                        clientGraphicsRendererProcessState.animationModule
                          .animationName
                      }
                      processKeyDisplayValue={
                        clientGraphicsRendererProcessState.graphicsRendererProcessKey
                      }
                      processStatusDisplayValue={
                        clientGraphicsRendererProcessState.graphicsRendererProcessStatus
                      }
                      subRouteContent={
                        <div className={styles.errorMessageContainer}>
                          <div className={styles.processErrorMessage}>
                            {
                              clientGraphicsRendererProcessState.processErrorMessage
                            }
                          </div>
                        </div>
                      }
                    />
                  )
              }
          }
      }
  }
}

const useAnimationDevelopmentPageStyles = makeStyles((theme) => ({
  initializingContainer: {
    padding: theme.spacing(1),
  },
  logsDisplayContainer: {
    flexShrink: 1,
    flexGrow: 1,
    padding: theme.spacing(1),
    overflow: 'scroll',
    lineHeight: '1.25rem',
    whiteSpace: 'pre-wrap',
    fontSize: 12,
  },
}))

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
  fetchErrorMessage: string
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

function usePollClientGraphicsRendererProcessStateResponse(): {
  pollClientGraphicsRendererProcessStateResponse: PollClientGraphicsRendererProcessStateResponse
} {
  return null
}

interface ClientGraphicsRendererProcessInvalidBundlePageProps
  extends Pick<AnimationDevelopmentPageProps, 'baseRoute' | 'subRoute'> {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessInvalidBundleState
  InvalidBundleSubRouteContent: (
    props: InvalidBundleSubRouteContentProps
  ) => JSX.Element
}

interface InvalidBundleSubRouteContentProps
  extends Pick<
    ClientGraphicsRendererProcessInvalidBundlePageProps,
    'clientGraphicsRendererProcessState'
  > {}

function ClientGraphicsRendererProcessInvalidBundlePage(
  props: ClientGraphicsRendererProcessInvalidBundlePageProps
) {
  const {
    baseRoute,
    subRoute,
    InvalidBundleSubRouteContent,
    clientGraphicsRendererProcessState,
  } = props
  return (
    <ClientGraphicsRendererProcessPage
      moduleStatusDisplayValue={'module invalid'}
      animationNameDisplayValue={'-'}
      processKeyDisplayValue={'-'}
      processStatusDisplayValue={'-'}
      baseRoute={baseRoute}
      subRoute={subRoute}
      subRouteContent={
        <InvalidBundleSubRouteContent
          clientGraphicsRendererProcessState={
            clientGraphicsRendererProcessState
          }
        />
      }
      moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
    />
  )
}

interface ClientGraphicsRendererProcessLogsPageProps {}

function ClientGraphicsRendererProcessLogsPage(
  props: ClientGraphicsRendererProcessLogsPageProps
) {
  const {} = props
}

interface ClientGraphicsRendererProcessPageProps
  extends Pick<AnimationDevelopmentPageProps, 'baseRoute' | 'subRoute'> {
  moduleSessionVersionDisplayValue: string
  moduleStatusDisplayValue: string
  animationNameDisplayValue: string
  processKeyDisplayValue: string
  processStatusDisplayValue: string
  subRouteContent: ReactNode
}

function ClientGraphicsRendererProcessPage(
  props: ClientGraphicsRendererProcessPageProps
) {
  const {
    subRoute,
    baseRoute,
    moduleSessionVersionDisplayValue,
    moduleStatusDisplayValue,
    animationNameDisplayValue,
    processKeyDisplayValue,
    processStatusDisplayValue,
    subRouteContent,
  } = props
  const navigateToRoute = useNavigate()
  const styles = useClientGraphicsRendererProcessPageStyles()
  return (
    <Page
      pageBody={
        <Fragment>
          <div className={styles.pageOverviewContainer}>
            <div className={styles.pageNavigationContainer}>
              <OptionField
                optionLabel={'logs'}
                optionSelected={subRoute === '/logs'}
                onClick={() => {
                  navigateToRoute(`${baseRoute}/logs`)
                }}
              />
              <OptionField
                optionLabel={'result'}
                optionSelected={subRoute === '/result'}
                onClick={() => {
                  navigateToRoute(`${baseRoute}/result`)
                }}
              />
            </div>
            <div className={styles.pageDetailsContainer}>
              <FieldDisplay
                fieldLabel={'module session version'}
                fieldValue={moduleSessionVersionDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'module status'}
                fieldValue={moduleStatusDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'animation name'}
                fieldValue={animationNameDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'process key'}
                fieldValue={processKeyDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'process status'}
                fieldValue={processStatusDisplayValue}
              />
            </div>
          </div>
          {subRouteContent}
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
  pageDetailsContainer: {},
}))

interface OptionFieldProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick'> {
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
        <div className={styles.optionInput} onClick={onClick}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: optionSelected
                ? theme.palette.primary.main
                : theme.palette.common.white,
            }}
          />
        </div>
      </div>
      <div className={styles.optionLabel}>{optionLabel}</div>
    </div>
  )
}

const useOptionFieldStyles = makeStyles<Theme, OptionFieldProps>((theme) => ({
  fieldContainer: {
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
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ({ optionSelected }) =>
      optionSelected ? theme.palette.primary.main : theme.palette.primary.light,
    backgroundColor: theme.palette.common.white,
    width: theme.spacing(1.25),
    height: theme.spacing(1.25),
    padding: 2,
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
