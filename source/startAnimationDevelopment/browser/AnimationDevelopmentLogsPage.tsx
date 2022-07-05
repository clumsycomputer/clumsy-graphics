import makeStyles from '@material-ui/core/styles/makeStyles'
import React, { useEffect } from 'react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientGraphicsRendererProcessValidBuildState } from '../models/ClientGraphicsRendererProcessState'
import {
  AnimationDevelopmentPage,
  AnimationDevelopmentPageProps,
} from './components/AnimationDevelopmentPage'
import { InvalidBuildClientGraphicsRendererProcessPage } from './components/InvalidBuildClientGraphicsRendererProcessPage'
import { ValidBuildClientGraphicsRendererProcessPage } from './components/ValidBuildClientGraphicsRendererProcessPage'
import { ViewResultLinkButton } from './components/ViewResultLinkButton'
import { useManagedScrollContainerRef } from './hooks/useManagedScrollContainerRef'
import { AssetBaseRoute } from './models'

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
        previousClientGraphicsRendererProcessState,
        cachedPollClientGraphicsRendererProcessStateResponseData,
      }) => {
        const { managedScrollContainerRef, automatedScrollEnabled } =
          useManagedScrollContainerRef({
            graphicsRendererProcessKey,
            clientGraphicsRendererProcessState,
            localStorageKey: 'animation-development-logs-display',
          })
        const navigateToRoute = useNavigate()
        useEffect(() => {
          if (
            automatedScrollEnabled &&
            ((clientGraphicsRendererProcessState.buildStatus ===
              'invalidBuild' &&
              clientGraphicsRendererProcessState.buildVersion !==
                previousClientGraphicsRendererProcessState?.buildVersion) ||
              (clientGraphicsRendererProcessState.buildStatus ===
                'validBuild' &&
                previousClientGraphicsRendererProcessState?.buildStatus ===
                  'validBuild' &&
                (clientGraphicsRendererProcessState.graphicsRendererProcessStatus ===
                  'processSuccessful' ||
                  clientGraphicsRendererProcessState.graphicsRendererProcessStatus ===
                    'processFailed') &&
                clientGraphicsRendererProcessState.graphicsRendererProcessStatus !==
                  previousClientGraphicsRendererProcessState?.graphicsRendererProcessStatus))
          ) {
            navigateToRoute(`${assetBaseRoute}/result`)
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
                  <AnimationDevelopmentLogsDisplay
                    managedScrollContainerRef={managedScrollContainerRef}
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
                cachedPollClientGraphicsRendererProcessStateResponseData={
                  cachedPollClientGraphicsRendererProcessStateResponseData
                }
                viewRouteContent={
                  <AnimationDevelopmentLogsDisplay
                    managedScrollContainerRef={managedScrollContainerRef}
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

export interface AnimationDevelopmentLogsDisplayProps
  extends Pick<
      ClientGraphicsRendererProcessValidBuildState,
      'graphicsRendererProcessStdoutLog'
    >,
    Pick<
      ReturnType<typeof useManagedScrollContainerRef>,
      'managedScrollContainerRef'
    > {
  resultLink: ReactNode
}

function AnimationDevelopmentLogsDisplay(
  props: AnimationDevelopmentLogsDisplayProps
) {
  const {
    managedScrollContainerRef,
    graphicsRendererProcessStdoutLog,
    resultLink,
  } = props
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
