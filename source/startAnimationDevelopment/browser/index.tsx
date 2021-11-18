import React, { ReactNode, useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import { ClientGraphicsRendererProcessState } from '../sagas/clientServerEventHandlerSaga'

const appContainer = document.createElement('div')
document.body.append(appContainer)
ReactDom.render(<GraphicsRendererProcessStatePage />, appContainer)

function GraphicsRendererProcessStatePage() {
  const [graphicsRendererProcessState, setGraphicsRendererProcessState] =
    useState<ClientGraphicsRendererProcessState | null>(null)
  useEffect(() => {
    setInterval(() => {
      fetch(
        `/api/latestAnimationModule/graphicsRendererProcessState${window.location.search}`
      )
        .then((fetchResult) => fetchResult.json())
        .then((nextGraphicsRendererProcessState) => {
          setGraphicsRendererProcessState(nextGraphicsRendererProcessState)
        })
        .catch((fetchGraphicsRenderProcessStateError) => {
          console.error(fetchGraphicsRenderProcessStateError)
        })
    }, 500)
  }, [])
  const [pageContent, setPageContent] = useState<ReactNode>(null)
  useEffect(() => {
    switch (graphicsRendererProcessState?.processStatus) {
      case 'processActive':
        setPageContent(
          <div style={{ padding: 8 }}>
            {graphicsRendererProcessState.processProgressInfo}
          </div>
        )
        break
      case 'processSuccessful':
        const [_, graphicAssetType] =
          graphicsRendererProcessState.graphicAssetUrl.split('.')
        switch (graphicAssetType) {
          case 'mp4':
            setPageContent(
              <AssetContainer>
                <video
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  controls={true}
                  loop={true}
                  autoPlay={true}
                >
                  <source
                    type={'video/mp4'}
                    src={graphicsRendererProcessState.graphicAssetUrl}
                  />
                </video>
              </AssetContainer>
            )
            break
          case 'png':
            setPageContent(
              <AssetContainer>
                <img
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  src={graphicsRendererProcessState.graphicAssetUrl}
                />
              </AssetContainer>
            )
            break
          default:
            throw new Error('wtf? graphicAssetType')
        }
        break
      case 'processFailed':
        setPageContent(
          <div
            style={{
              whiteSpace: 'pre-wrap',
              backgroundColor: 'red',
              color: 'white',
              padding: 8,
            }}
          >
            {graphicsRendererProcessState.processErrorMessage}
          </div>
        )
        break
    }
  }, [graphicsRendererProcessState])
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {pageContent}
    </div>
  )
}

interface AssetContainerProps {
  children: ReactNode
}

function AssetContainer(props: AssetContainerProps) {
  const { children } = props
  return (
    <div
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {children}
    </div>
  )
}
