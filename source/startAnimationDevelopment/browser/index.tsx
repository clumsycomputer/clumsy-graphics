import { createTheme, ThemeProvider } from '@material-ui/core'
import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
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
      renderTargetParams={{
        renderType: 'animation',
      }}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessLogsPage
            animationModuleName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            processStdoutLog={
              fetchedGraphicsRendererProcessState.processStdoutLog
            }
            renderTarget={'animation'}
            baseRoute={'/animation'}
          />
        )
      }}
    />
  )
}

function AnimationProcessResultPage() {
  return (
    <FetchGraphicsRendererProcessStatePage
      renderTargetParams={{
        renderType: 'animation',
      }}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessResultPage
            fetchedGraphicsRendererProcessState={
              fetchedGraphicsRendererProcessState
            }
            animationModuleName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            renderTarget={'animation'}
            baseRoute={'/animation'}
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
  return (
    <FetchGraphicsRendererProcessStatePage
      renderTargetParams={{
        renderType: 'frame',
        frameIndex: `${-1}`,
      }}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessLogsPage
            animationModuleName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            processStdoutLog={
              fetchedGraphicsRendererProcessState.processStdoutLog
            }
            renderTarget={'frame/-1'}
            baseRoute={'/frame/-1'}
          />
        )
      }}
    />
  )
}

function FrameProcessResultPage() {
  return (
    <FetchGraphicsRendererProcessStatePage
      renderTargetParams={{
        renderType: 'frame',
        frameIndex: `${-1}`,
      }}
      GraphicsRendererProcessStateFetchedPage={({
        fetchedGraphicsRendererProcessState,
      }) => {
        return (
          <ProcessResultPage
            fetchedGraphicsRendererProcessState={
              fetchedGraphicsRendererProcessState
            }
            animationModuleName={
              fetchedGraphicsRendererProcessState.animationModule.animationName
            }
            animationModuleSessionVersion={
              fetchedGraphicsRendererProcessState.animationModuleSessionVersion
            }
            renderTarget={`frame/-1`}
            baseRoute={'/frame/-1'}
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
