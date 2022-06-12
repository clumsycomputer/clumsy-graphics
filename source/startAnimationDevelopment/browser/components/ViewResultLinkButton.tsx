import Link, { LinkProps } from '@material-ui/core/Link'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimationDevelopmentLogsPageProps } from '../AnimationDevelopmentLogsPage'
import { AssetBaseRoute } from '../models'

export interface ViewResultLinkButtonProps<
  SomeAssetBaseRoute extends AssetBaseRoute
> extends Pick<
    AnimationDevelopmentLogsPageProps<SomeAssetBaseRoute>,
    'assetBaseRoute'
  > {
  linkLabel: string
  linkColor: LinkProps['color']
}

export function ViewResultLinkButton<SomeAssetBaseRoute extends AssetBaseRoute>(
  props: ViewResultLinkButtonProps<SomeAssetBaseRoute>
) {
  const { assetBaseRoute, linkColor, linkLabel } = props
  const navigateToRoute = useNavigate()
  return (
    <Link
      style={{ fontWeight: 700 }}
      color={linkColor}
      href={`${assetBaseRoute}/result`}
      onClick={() => {
        navigateToRoute(`${assetBaseRoute}/result`)
      }}
    >
      {`${linkLabel} >`}
    </Link>
  )
}
