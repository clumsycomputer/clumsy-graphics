import makeStyles from '@material-ui/core/styles/makeStyles'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientGraphicsRendererProcessSuccessfulState } from '../models/ClientGraphicsRendererProcessState'
import {
  AnimationDevelopmentPage,
  AnimationDevelopmentPageProps,
} from './components/AnimationDevelopmentPage'
import { InvalidBuildClientGraphicsRendererProcessPage } from './components/InvalidBuildClientGraphicsRendererProcessPage'
import { ValidBuildClientGraphicsRendererProcessPage } from './components/ValidBuildClientGraphicsRendererProcessPage'
import { AssetBaseRoute } from './models'

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
  const navigateToRoute = useNavigate()
  return (
    <AnimationDevelopmentPage
      key={graphicsRendererProcessKey}
      graphicsRendererProcessKey={graphicsRendererProcessKey}
      assetBaseRoute={assetBaseRoute}
      viewSubRoute={viewSubRoute}
      SomeClientGraphicsRendererProcessPage={({
        clientGraphicsRendererProcessState,
        previousClientGraphicsRendererProcessState,
        cachedPollClientGraphicsRendererProcessStateResponseData,
      }) => {
        useEffect(() => {
          if (
            clientGraphicsRendererProcessState.buildVersion !==
            previousClientGraphicsRendererProcessState?.buildVersion
          ) {
            navigateToRoute(`${assetBaseRoute}/logs`)
          }
        }, [
          clientGraphicsRendererProcessState,
          previousClientGraphicsRendererProcessState,
        ])
        switch (clientGraphicsRendererProcessState.buildStatus) {
          case 'invalidBuild':
            return (
              <InvalidBuildClientGraphicsRendererProcessPage
                assetBaseRoute={assetBaseRoute}
                viewSubRoute={viewSubRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                cachedPollClientGraphicsRendererProcessStateResponseData={
                  cachedPollClientGraphicsRendererProcessStateResponseData
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
                    cachedPollClientGraphicsRendererProcessStateResponseData={
                      cachedPollClientGraphicsRendererProcessStateResponseData
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
                    cachedPollClientGraphicsRendererProcessStateResponseData={
                      cachedPollClientGraphicsRendererProcessStateResponseData
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
                    cachedPollClientGraphicsRendererProcessStateResponseData={
                      cachedPollClientGraphicsRendererProcessStateResponseData
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
