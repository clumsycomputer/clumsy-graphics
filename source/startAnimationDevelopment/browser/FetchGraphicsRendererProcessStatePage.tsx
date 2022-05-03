import { makeStyles } from '@material-ui/core'
import React from 'react'
import { ClientGraphicsRendererProcessState } from '../models/GraphicsRendererProcessState'
import { Page } from './Page'
import {
  useFetchGraphicsRendererProcessState,
  UseFetchGraphicsRendererProcessStateApi,
} from './useFetchGraphicsRendererProcessState'

export interface FetchGraphicsRendererProcessStatePageProps
  extends Pick<
    UseFetchGraphicsRendererProcessStateApi,
    'graphicsRendererProcessKey'
  > {
  GraphicsRendererProcessStateFetchedPage: (api: {
    fetchedGraphicsRendererProcessState: ClientGraphicsRendererProcessState
  }) => JSX.Element
}

export function FetchGraphicsRendererProcessStatePage(
  props: FetchGraphicsRendererProcessStatePageProps
) {
  const {
    graphicsRendererProcessKey,
    GraphicsRendererProcessStateFetchedPage,
  } = props
  const { fetchGraphicsRendererProcessState } =
    useFetchGraphicsRendererProcessState({
      graphicsRendererProcessKey,
      staticPollRate: 500,
    })
  const styles = useStyles()
  if (fetchGraphicsRendererProcessState.fetchStatus === 'serverInitializing') {
    return (
      <Page
        pageBody={
          <div className={styles.initializingContainer}>initializing...</div>
        }
      />
    )
  } else if (
    fetchGraphicsRendererProcessState.fetchStatus === 'fetchSuccessful'
  ) {
    return (
      <GraphicsRendererProcessStateFetchedPage
        fetchedGraphicsRendererProcessState={
          fetchGraphicsRendererProcessState.fetchedGraphicsRendererProcessState
        }
      />
    )
  } else if (fetchGraphicsRendererProcessState.fetchStatus === 'fetchError') {
    return <div>todo</div>
  } else if (fetchGraphicsRendererProcessState.fetchStatus === 'serverError') {
    return <div>todo</div>
  } else {
    throw new Error('wtf? FetchGraphicsRendererProcessStatePage')
  }
}

const useStyles = makeStyles((theme) => ({
  initializingContainer: {
    padding: theme.spacing(1),
  },
}))
