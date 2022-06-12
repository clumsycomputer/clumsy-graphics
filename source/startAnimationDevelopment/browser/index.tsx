import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import React, { useEffect } from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams as useRouteParams,
} from 'react-router-dom'
import { AnimationDevelopmentLogsPage } from './AnimationDevelopmentLogsPage'
import { AnimationDevelopmentResultPage } from './AnimationDevelopmentResultPage'

const appContainer = document.createElement('div')
document.body.append(appContainer)
const appTheme = createTheme({
  typography: {
    fontFamily: "'IBM Plex Mono', 'monospace'",
  },
  palette: {
    primary: {
      main: '#2a6e98',
      light: '#609cc9',
      dark: '#00436a',
    },
    secondary: {
      main: '#a05d17',
      light: '#d58a45',
      dark: '#6d3300',
    },
    error: {
      main: '#e45752',
      light: '#ff897e',
      dark: '#ac2229',
    },
  },
})
ReactDom.render(
  <BrowserRouter>
    <ThemeProvider theme={appTheme}>
      <AnimationDevelopmentApp />
    </ThemeProvider>
  </BrowserRouter>,
  appContainer
)

function AnimationDevelopmentApp() {
  return (
    <Routes>
      <Route
        path={'/animation/logs'}
        element={
          <AnimationDevelopmentLogsPage
            graphicsRendererProcessKey={'animation'}
            assetBaseRoute={'/animation'}
            viewSubRoute={'/logs'}
          />
        }
      />
      <Route
        path={'/animation/result'}
        element={
          <AnimationDevelopmentResultPage
            graphicsRendererProcessKey={'animation'}
            assetBaseRoute={'/animation'}
            viewSubRoute={'/result'}
            SomeAssetDisplay={({ graphicAssetUrl }) => {
              return (
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
              )
            }}
          />
        }
      />
      <Route
        path={'/frame/:frameIndex/logs'}
        element={<AnimationDevelopmentFrameLogsPage />}
      />
      <Route
        path={'/frame/:frameIndex/result'}
        element={<AnimationDevelopmentFrameResultPage />}
      />
      <Route path={'*'} element={<RedirectToAnimationLogsPage />} />
    </Routes>
  )
}

function AnimationDevelopmentFrameLogsPage() {
  const routeParams = useRouteParams()
  return (
    <AnimationDevelopmentLogsPage
      graphicsRendererProcessKey={`frame/${
        routeParams.frameIndex as unknown as number
      }`}
      assetBaseRoute={`/frame/${routeParams.frameIndex as unknown as number}`}
      viewSubRoute={'/logs'}
    />
  )
}

function AnimationDevelopmentFrameResultPage() {
  const routeParams = useRouteParams()
  return (
    <AnimationDevelopmentResultPage
      graphicsRendererProcessKey={`frame/${
        routeParams.frameIndex as unknown as number
      }`}
      assetBaseRoute={`/frame/${routeParams.frameIndex as unknown as number}`}
      viewSubRoute={'/result'}
      SomeAssetDisplay={({ graphicAssetUrl }) => {
        return (
          <img
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            src={graphicAssetUrl}
          />
        )
      }}
    />
  )
}

function RedirectToAnimationLogsPage() {
  const navigateToRoute = useNavigate()
  useEffect(() => {
    navigateToRoute('/animation/logs')
  }, [])
  return null
}
