import { makeStyles } from '@material-ui/core'
import React, { useMemo } from 'react'
import { ClientGraphicsRendererProcessSuccessfulState } from '../models/GraphicsRendererProcessState'
import { ProcessPage, ProcessPageProps } from './ProcessPage'
import { FetchGraphicsRendererProcessSuccessState } from './useFetchGraphicsRendererProcessState'

export interface ProcessResultPageProps
  extends Pick<
      ProcessPageProps,
      | 'baseRoute'
      | 'animationModuleName'
      | 'animationModuleSessionVersion'
      | 'renderTarget'
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
    if (fetchedGraphicsRendererProcessState.processStatus === 'processActive') {
      return <div>in progress...</div>
    } else if (
      fetchedGraphicsRendererProcessState.processStatus === 'processSuccessful'
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
      fetchedGraphicsRendererProcessState.processStatus === 'processFailed'
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
