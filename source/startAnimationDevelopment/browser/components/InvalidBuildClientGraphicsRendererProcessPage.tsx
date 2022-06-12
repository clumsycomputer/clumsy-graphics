import React from 'react'
import { ClientGraphicsRendererProcessInvalidBuildState } from '../../models/ClientGraphicsRendererProcessState'
import { AssetBaseRoute, ViewSubRoute } from '../models'
import { AssetRouteSelect } from './AssetRouteSelect'
import {
  ClientGraphicsRendererProcessPage,
  ClientGraphicsRendererProcessPageProps,
} from './ClientGraphicsRendererProcessPage'

export interface InvalidBuildClientGraphicsRendererProcessPageProps<
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

export function InvalidBuildClientGraphicsRendererProcessPage<
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
      assetRouteSelect={
        <AssetRouteSelect
          assetBaseRoute={assetBaseRoute}
          viewSubRoute={viewSubRoute}
          frameCount={1}
        />
      }
    />
  )
}
