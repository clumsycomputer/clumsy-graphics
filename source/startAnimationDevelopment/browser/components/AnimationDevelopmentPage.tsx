import { makeStyles } from '@material-ui/core/styles'
import React from 'react'
import { GraphicsRendererProcessKey } from '../../models/GraphicsRendererProcessKey'
import { Page } from './Page'
import {
  PollClientGraphicsRendererProcessStateSuccessResponse,
  usePollClientGraphicsRendererProcessStateResponse,
} from '../hooks/usePollClientGraphicRendererProcessStateResponse'
import { AssetBaseRoute, ViewSubRoute } from '../models'

export interface AnimationDevelopmentPageProps<
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

export function AnimationDevelopmentPage<
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
