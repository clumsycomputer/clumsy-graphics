import React from 'react'
import { ClientGraphicsRendererProcessState } from '../models/GraphicsRendererProcessState'
import { Page } from './Page'
import {
  useFetchGraphicsRendererProcessState,
  UseFetchGraphicsRendererProcessStateApi,
} from './useFetchGraphicsRendererProcessState'

export interface FetchGraphicsRendererProcessStatePageProps
  extends Pick<UseFetchGraphicsRendererProcessStateApi, 'renderTargetParams'> {
  GraphicsRendererProcessStateFetchedPage: (api: {
    fetchedGraphicsRendererProcessState: ClientGraphicsRendererProcessState
  }) => JSX.Element
}

export function FetchGraphicsRendererProcessStatePage(
  props: FetchGraphicsRendererProcessStatePageProps
) {
  const { renderTargetParams, GraphicsRendererProcessStateFetchedPage } = props
  const { fetchGraphicsRendererProcessState } =
    useFetchGraphicsRendererProcessState({
      renderTargetParams,
    })
  if (fetchGraphicsRendererProcessState.fetchStatus === 'serverInitializing') {
    return <Page pageBody={'initializing...'} />
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
