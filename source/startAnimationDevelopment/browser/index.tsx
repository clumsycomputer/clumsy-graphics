import React, { ReactNode, useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter,
  Route,
  Routes,
  useParams as useRouteParams,
} from 'react-router-dom'

const appContainer = document.createElement('div')
document.body.append(appContainer)
ReactDom.render(
  <BrowserRouter>
    <ClientApp />
  </BrowserRouter>,
  appContainer
)

function ClientApp() {
  return (
    <Routes>
      <Route
        path={'/latestAnimationModule/animation'}
        element={<AnimationPage />}
      />
      <Route
        path={'/latestAnimationModule/frame/:frameIndex'}
        element={<FramePage />}
      />
    </Routes>
  )
}

function AnimationPage() {
  const [animationRenderProcessState, setAnimationRenderProcessState] =
    useState<any>(null)
  useEffect(() => {
    setInterval(() => {
      fetch('/api/latestAnimationModule/animationRenderProcessState')
        .then((fetchResult) => fetchResult.json())
        .then((nextAnimationRenderProcessState) => {
          setAnimationRenderProcessState(nextAnimationRenderProcessState)
        })
    }, 500)
  }, [])
  if (animationRenderProcessState?.processStatus === 'processSuccessful') {
    return (
      <PageContainer>
        <div
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <video
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            controls={true}
            autoPlay={true}
            loop={true}
          >
            <source
              type={'video/mp4'}
              src={animationRenderProcessState.animationAssetUrl}
            />
          </video>
        </div>
      </PageContainer>
    )
  } else {
    return null
  }
}

function FramePage() {
  const framePageParams = useRouteParams()
  const [frameRenderProcessState, setFrameRenderProcessState] =
    useState<any>(null)
  useEffect(() => {
    setInterval(() => {
      fetch(
        `/api/latestAnimationModule/frameRenderProcessState/${framePageParams.frameIndex}`
      )
        .then((fetchResult) => fetchResult.json())
        .then((nextFrameRenderProcessState) => {
          setFrameRenderProcessState(nextFrameRenderProcessState)
        })
    }, 500)
  }, [])

  if (frameRenderProcessState?.processStatus === 'processSuccessful') {
    return (
      <PageContainer>
        <div
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <img
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            src={frameRenderProcessState.frameAssetUrl}
          />
        </div>
      </PageContainer>
    )
  } else {
    return null
  }
}

interface PageContainerProps {
  children: ReactNode
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
