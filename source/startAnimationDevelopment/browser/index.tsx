import React, { ReactNode, useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import { decodeData } from '../../helpers/decodeData'
import {
  ClientGraphicsRendererProcessActiveState,
  ClientGraphicsRendererProcessState,
  ClientGraphicsRendererProcessStateCodec,
  ClientGraphicsRendererProcessSuccessfulState,
} from '../models/GraphicsRendererProcessState'

const appContainer = document.createElement('div')
document.body.append(appContainer)
ReactDom.render(<GraphicsRendererProcessStatePage />, appContainer)

function GraphicsRendererProcessStatePage() {
  const [pageContent, setPageContent] = useState<ReactNode>(null)
  useEffect(() => {
    setInterval(async () => {
      const fetchResult = await fetch(
        `/api/latestAnimationModule/graphicsRendererProcessState${window.location.search}`
      )
      switch (fetchResult.status) {
        case 204:
          // server initializing...
          break
        case 200:
          const fetchResultData = await fetchResult.json()
          const currentGraphicsRendererProcessState =
            await decodeData<ClientGraphicsRendererProcessState>({
              inputData: fetchResultData,
              targetCodec: ClientGraphicsRendererProcessStateCodec,
            })
          switch (currentGraphicsRendererProcessState.processStatus) {
            case 'processActive':
              setPageContent(
                <GraphicsRendererProcessActiveDisplay
                  graphicsRendererProcessState={
                    currentGraphicsRendererProcessState
                  }
                />
              )
              break
            case 'processSuccessful':
              const [_, graphicAssetType] =
                currentGraphicsRendererProcessState.graphicAssetUrl.split('.')
              switch (graphicAssetType) {
                case 'mp4':
                  setPageContent(
                    <AnimationAssetDisplay
                      graphicsRendererProcessState={
                        currentGraphicsRendererProcessState
                      }
                    />
                  )
                  break
                case 'png':
                  setPageContent(
                    <FrameAssetDisplay
                      graphicsRendererProcessState={
                        currentGraphicsRendererProcessState
                      }
                    />
                  )
                  break
                default:
                  throw new Error('wtf? graphicAssetType')
              }
              break
            case 'processFailed':
              setPageContent(
                <ErrorMessageDisplay
                  errorMessage={
                    currentGraphicsRendererProcessState.processErrorMessage
                  }
                />
              )
              break
          }
          break
        case 400:
          const fetchErrorMessage = await fetchResult.text()
          setPageContent(
            <ErrorMessageDisplay errorMessage={fetchErrorMessage} />
          )
          break
        case 500:
          setPageContent(<ErrorMessageDisplay errorMessage={'wtf? server'} />)
          break
        default:
          setPageContent(
            <ErrorMessageDisplay errorMessage={'wtf? fetchResult'} />
          )
          break
      }
    }, 500)
  }, [])
  return <PageContainer>{pageContent}</PageContainer>
}

interface PageContainerProps {
  children: ReactNode
}

interface GraphicsRendererProcessActiveDisplayProps {
  graphicsRendererProcessState: ClientGraphicsRendererProcessActiveState
}

function GraphicsRendererProcessActiveDisplay(
  props: GraphicsRendererProcessActiveDisplayProps
) {
  const { graphicsRendererProcessState } = props
  return (
    <div style={{ padding: 8 }}>
      {graphicsRendererProcessState.processProgressInfo}
    </div>
  )
}

interface AnimationAssetDisplayProps {
  graphicsRendererProcessState: ClientGraphicsRendererProcessSuccessfulState
}

function AnimationAssetDisplay(props: AnimationAssetDisplayProps) {
  const { graphicsRendererProcessState } = props
  return (
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
}

interface FrameAssetDisplayProps {
  graphicsRendererProcessState: ClientGraphicsRendererProcessSuccessfulState
}

function FrameAssetDisplay(props: FrameAssetDisplayProps) {
  const { graphicsRendererProcessState } = props
  return (
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
}

interface ErrorMessageDisplayProps {
  errorMessage: string
}

function ErrorMessageDisplay(props: ErrorMessageDisplayProps) {
  const { errorMessage } = props
  return (
    <div
      style={{
        whiteSpace: 'pre-wrap',
        backgroundColor: 'red',
        color: 'white',
        padding: 8,
      }}
    >
      {errorMessage}
    </div>
  )
}

function PageContainer(props: PageContainerProps) {
  const { children } = props
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
      {children}
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
