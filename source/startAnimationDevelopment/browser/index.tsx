import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import React from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter,
  Route,
  Routes,
  useParams as useRouteParams,
} from 'react-router-dom'
import {
  AnimationDevelopmentLogsPage,
  AnimationDevelopmentResultPage,
} from './AnimationDevelopmentPage'

const appContainer = document.createElement('div')
document.body.append(appContainer)
const appTheme = createTheme({
  typography: {
    fontFamily: "'IBM Plex Mono', 'monospace'",
  },
  palette: {
    primary: {
      main: '#827717',
      light: '#b4a647',
      dark: '#524c00',
    },
    secondary: {
      main: '#172282',
      light: '#524ab2',
      dark: '#000054',
    },
    error: {
      main: '#c62828',
      light: '#ff5f52',
      dark: '#8e0000',
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
            assetRoute={'/animation'}
            viewRoute={'/logs'}
          />
        }
      />
      <Route
        path={'/animation/result'}
        element={
          <AnimationDevelopmentResultPage
            graphicsRendererProcessKey={'animation'}
            assetRoute={'/animation'}
            viewRoute={'/result'}
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
      assetRoute={`/frame/${routeParams.frameIndex as unknown as number}`}
      viewRoute={'/logs'}
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
      assetRoute={`/frame/${routeParams.frameIndex as unknown as number}`}
      viewRoute={'/result'}
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
