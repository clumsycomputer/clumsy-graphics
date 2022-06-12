import makeStyles from '@material-ui/core/styles/makeStyles'
import React from 'react'
import { ReactNode } from 'react'
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

export interface AnimationDevelopmentLogsDisplayProps
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
