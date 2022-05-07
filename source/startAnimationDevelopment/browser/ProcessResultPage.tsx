import { makeStyles } from '@material-ui/core'
import React, { useMemo } from 'react'
import { ClientGraphicsRendererProcessSuccessfulState } from '../models/ClientGraphicsRendererProcessState'
import { ProcessPage, ProcessPageProps } from './ProcessPage'
import { FetchGraphicsRendererProcessSuccessState } from './useFetchGraphicsRendererProcessState'

export interface ProcessResultPageProps
  extends Pick<
      ProcessPageProps,
      | 'baseRoute'
      | 'animationName'
      | 'bundleSessionVersion'
      | 'graphicsRendererProcessKey'
      | 'graphicsRendererProcessStatus'
    >,
    Pick<
      FetchGraphicsRendererProcessSuccessState,
      'fetchedGraphicsRendererProcessState'
    > {
  AssetDisplay: (
    api: Pick<ClientGraphicsRendererProcessSuccessfulState, 'graphicAssetUrl'>
  ) => JSX.Element
}

export function ProcessResultPage(props: ProcessResultPageProps) {
  const {
    fetchedGraphicsRendererProcessState,
    AssetDisplay,
    ...processPageProps
  } = props
  const styles = useStyles()
  const processResultContent = useMemo(() => {
    if (
      fetchedGraphicsRendererProcessState.latestBundleStatus === 'bundleInvalid'
    ) {
      return (
        <div className={styles.errorMessageContainer}>
          <div className={styles.processErrorMessage}>
            {fetchedGraphicsRendererProcessState.bundleErrorMessage}
          </div>
        </div>
      )
    } else if (
      fetchedGraphicsRendererProcessState.graphicsRendererProcessStatus ===
        'processInitializing' ||
      fetchedGraphicsRendererProcessState.graphicsRendererProcessStatus ===
        'processActive'
    ) {
      return <div className={styles.inProgressContainer}>in progress...</div>
    } else if (
      fetchedGraphicsRendererProcessState.graphicsRendererProcessStatus ===
      'processSuccessful'
    ) {
      return (
        <div className={styles.assetContainer}>
          <AssetDisplay
            graphicAssetUrl={
              fetchedGraphicsRendererProcessState.graphicAssetUrl
            }
          />
        </div>
      )
    } else if (
      fetchedGraphicsRendererProcessState.graphicsRendererProcessStatus ===
      'processFailed'
    ) {
      return (
        <div className={styles.errorMessageContainer}>
          <div className={styles.processErrorMessage}>
            {fetchedGraphicsRendererProcessState.processErrorMessage}
          </div>
        </div>
      )
    }
  }, [fetchedGraphicsRendererProcessState])
  return (
    <ProcessPage
      {...processPageProps}
      childRoute={'/result'}
      childContent={processResultContent}
    />
  )
}

const useStyles = makeStyles((theme) => ({
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
  errorMessageContainer: {
    flexShrink: 1,
    flexGrow: 1,
    overflow: 'scroll',
    padding: theme.spacing(1),
  },
  processErrorMessage: {
    backgroundColor: theme.palette.error.main,
    maxWidth: 600,
    padding: theme.spacing(1),
    whiteSpace: 'pre-wrap',
    color: theme.palette.getContrastText(theme.palette.error.main),
    fontSize: 14,
  },
}))
