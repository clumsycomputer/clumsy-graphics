import makeStyles from '@material-ui/core/styles/makeStyles'
import React, { Fragment } from 'react'
import { ReactNode } from 'react'
import { FieldDisplay } from './FieldDisplay'
import { OptionField } from './OptionField'
import { Page, PageProps } from './Page'

export interface ClientGraphicsRendererProcessPageProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
      AnimationDevelopmentPageProps<SomeAssetBaseRoute, SomeViewSubRoute>,
      'assetBaseRoute' | 'viewSubRoute'
    >,
    Pick<PageProps, 'assetRouteSelect'> {
  buildVersionDisplayValue: string
  buildStatusDisplayValue: string
  moduleNameDisplayValue: string
  targetAssetDisplayValue: string
  renderStatusDisplayValue: string
  viewRouteContent: ReactNode
}

export function ClientGraphicsRendererProcessPage<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(
  props: ClientGraphicsRendererProcessPageProps<
    SomeAssetBaseRoute,
    SomeViewSubRoute
  >
) {
  const {
    assetRouteSelect,
    viewSubRoute,
    assetBaseRoute,
    buildVersionDisplayValue,
    buildStatusDisplayValue,
    moduleNameDisplayValue,
    targetAssetDisplayValue,
    renderStatusDisplayValue,
    viewRouteContent,
  } = props
  const styles = useClientGraphicsRendererProcessPageStyles()
  return (
    <Page
      assetRouteSelect={assetRouteSelect}
      pageBody={
        <Fragment>
          <div className={styles.pageOverviewContainer}>
            <div className={styles.pageNavigationContainer}>
              <OptionField
                optionLabel={'logs'}
                optionSelected={viewSubRoute === '/logs'}
                href={`${assetBaseRoute}/logs`}
              />
              <OptionField
                optionLabel={'result'}
                optionSelected={viewSubRoute === '/result'}
                href={`${assetBaseRoute}/result`}
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
