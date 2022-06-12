import React from 'react'
import { ClientGraphicsRendererProcessValidBuildState } from '../../models/ClientGraphicsRendererProcessState'
import { AssetBaseRoute, ViewSubRoute } from '../models'
import { AssetRouteSelect } from './AssetRouteSelect'
import {
  ClientGraphicsRendererProcessPage,
  ClientGraphicsRendererProcessPageProps,
} from './ClientGraphicsRendererProcessPage'

export interface ValidBuildClientGraphicsRendererProcessPageProps<
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

export function ValidBuildClientGraphicsRendererProcessPage<
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
      assetRouteSelect={
        <AssetRouteSelect
          assetBaseRoute={assetBaseRoute}
          viewSubRoute={viewSubRoute}
          frameCount={
            clientGraphicsRendererProcessState.animationModule.frameCount
          }
        />
      }
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
