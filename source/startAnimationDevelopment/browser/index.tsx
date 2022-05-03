import { createTheme, ThemeProvider } from '@material-ui/core'
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { FetchGraphicsRendererProcessStatePage } from './FetchGraphicsRendererProcessStatePage'
import { ProcessLogsPage } from './ProcessLogsPage'
import { ProcessResultPage } from './ProcessResultPage'

const appContainer = document.createElement('div')
document.body.append(appContainer)
const appTheme = createTheme({
  typography: {
    fontFamily: "'IBM Plex Mono', 'monospace'",
  },
})
ReactDom.render(
  <ThemeProvider theme={appTheme}>
    <BrowserRouter>
      <GraphicsRendererApp />
    </BrowserRouter>
  </ThemeProvider>,
  appContainer
)

function GraphicsRendererApp() {
  return (
    <Routes>
      <Route path={'/animation/logs'} element={<AnimationProcessLogsPage />} />
      <Route
        path={'/animation/result'}
        element={<AnimationProcessResultPage />}
      />
      <Route
        path={'/frame/:frameIndex/logs'}
        element={<FrameProcessLogsPage />}
      />
      <Route
        path={'/frame/:frameIndex/result'}
        element={<FrameProcessResultPage />}
      />
    </Routes>
  )
}

function AnimationProcessLogsPage() {
  return (
    <FetchGraphicsRendererProcessStatePage
      graphicsRendererProcessKey={'animation'}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessLogsPage
            baseRoute={'/animation'}
            animationName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            graphicsRendererProcessKey={
              fetchedGraphicsRendererProcessState.graphicsRendererProcessKey
            }
            processStatus={fetchedGraphicsRendererProcessState.processStatus}
            processStdoutLog={
              fetchedGraphicsRendererProcessState.processStdoutLog
            }
          />
        )
      }}
    />
  )
}

function AnimationProcessResultPage() {
  return (
    <FetchGraphicsRendererProcessStatePage
      graphicsRendererProcessKey={'animation'}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessResultPage
            baseRoute={'/animation'}
            fetchedGraphicsRendererProcessState={
              fetchedGraphicsRendererProcessState
            }
            animationName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            graphicsRendererProcessKey={
              fetchedGraphicsRendererProcessState.graphicsRendererProcessKey
            }
            processStatus={fetchedGraphicsRendererProcessState.processStatus}
            AssetDisplay={({ graphicAssetUrl }) => (
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
                <source type={'video/mp4'} src={graphicAssetUrl} />
              </video>
            )}
          />
        )
      }}
    />
  )
}

function FrameProcessLogsPage() {
  const routeParams = useParams()
  return (
    <FetchGraphicsRendererProcessStatePage
      graphicsRendererProcessKey={`frame/${
        routeParams.frameIndex as unknown as number
      }`}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessLogsPage
            baseRoute={`/frame/${routeParams.frameIndex as unknown as number}`}
            animationName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            graphicsRendererProcessKey={
              fetchedGraphicsRendererProcessState.graphicsRendererProcessKey
            }
            processStatus={fetchedGraphicsRendererProcessState.processStatus}
            processStdoutLog={
              fetchedGraphicsRendererProcessState.processStdoutLog
            }
          />
        )
      }}
    />
  )
}

function FrameProcessResultPage() {
  const routeParams = useParams()
  return (
    <FetchGraphicsRendererProcessStatePage
      graphicsRendererProcessKey={`frame/${
        routeParams.frameIndex as unknown as number
      }`}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessResultPage
            baseRoute={`/frame/${routeParams.frameIndex as unknown as number}`}
            fetchedGraphicsRendererProcessState={
              fetchedGraphicsRendererProcessState
            }
            animationName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            graphicsRendererProcessKey={
              fetchedGraphicsRendererProcessState.graphicsRendererProcessKey
            }
            processStatus={fetchedGraphicsRendererProcessState.processStatus}
            AssetDisplay={({ graphicAssetUrl }) => (
              <img
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                src={graphicAssetUrl}
              />
            )}
          />
        )
      }}
    />
  )
}
