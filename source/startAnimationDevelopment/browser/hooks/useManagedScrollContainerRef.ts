import { useEffect, useRef } from 'react'
import { AnimationDevelopmentPageProps } from '../components/AnimationDevelopmentPage'

export interface UseManagedScrollContainerRefApi
  extends Pick<
      AnimationDevelopmentPageProps<any, '/logs'>,
      'graphicsRendererProcessKey'
    >,
    Pick<
      Parameters<
        AnimationDevelopmentPageProps<
          any,
          '/logs'
        >['SomeClientGraphicsRendererProcessPage']
      >[0],
      'clientGraphicsRendererProcessState'
      // | 'previousClientGraphicsRendererProcessState'
    > {
  localStorageKey: string
}

export function useManagedScrollContainerRef(
  api: UseManagedScrollContainerRefApi
) {
  const {
    graphicsRendererProcessKey,
    clientGraphicsRendererProcessState,
    // previousClientGraphicsRendererProcessState,
    localStorageKey,
  } = api
  const managedScrollContainerRef = useRef<HTMLDivElement>(null)
  const managedScrollStateRef = useRef<ManagedScrollState>({
    graphicsRendererProcessKey,
    buildVersion: clientGraphicsRendererProcessState.buildVersion,
    automatedScrollEnabled: true,
    previousContainerScrollTop: null,
  })
  const scrollEventHandlerRef = useRef(() => {
    const currentManagedScrollState = managedScrollStateRef.current
    const currentManagedScrollContainer = managedScrollContainerRef.current
    if (currentManagedScrollContainer) {
      const userScrolledUp =
        currentManagedScrollState.previousContainerScrollTop !== null &&
        currentManagedScrollContainer.scrollTop <
          currentManagedScrollState.previousContainerScrollTop
      const currentScrollContainerScrollBottom =
        currentManagedScrollContainer.scrollTop +
        (currentManagedScrollContainer.getBoundingClientRect().height /
          currentManagedScrollContainer.scrollHeight) *
          currentManagedScrollContainer.scrollHeight
      const userScrolledToBottomOfContainer =
        currentScrollContainerScrollBottom /
          currentManagedScrollContainer.scrollHeight >
        0.975
      if (userScrolledUp) {
        currentManagedScrollState.automatedScrollEnabled = false
        currentManagedScrollState.previousContainerScrollTop =
          currentManagedScrollContainer.scrollTop
      } else if (userScrolledToBottomOfContainer) {
        currentManagedScrollState.automatedScrollEnabled = true
        currentManagedScrollState.previousContainerScrollTop = null
      } else {
        currentManagedScrollState.previousContainerScrollTop =
          currentManagedScrollContainer.scrollTop
      }
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(currentManagedScrollState)
      )
    }
  })
  useEffect(() => {
    const currentManagedScrollContainer = managedScrollContainerRef.current
    if (currentManagedScrollContainer) {
      currentManagedScrollContainer.addEventListener(
        'scroll',
        scrollEventHandlerRef.current
      )
      const cachedManagedScrollStateJson = localStorage.getItem(localStorageKey)
      const cachedManagedScrollState = cachedManagedScrollStateJson
        ? (JSON.parse(
            cachedManagedScrollStateJson
          ) as unknown as ManagedScrollState) || null
        : null
      if (
        clientGraphicsRendererProcessState.buildVersion ===
          cachedManagedScrollState?.buildVersion &&
        graphicsRendererProcessKey ===
          cachedManagedScrollState.graphicsRendererProcessKey
      ) {
        currentManagedScrollContainer.scroll({
          top: cachedManagedScrollState.previousContainerScrollTop || 0,
        })
        managedScrollStateRef.current = cachedManagedScrollState
      }
    }
    localStorage.setItem(
      localStorageKey,
      JSON.stringify(managedScrollStateRef.current)
    )
    return () => {
      const currentManagedScrollContainer = managedScrollContainerRef.current
      if (currentManagedScrollContainer) {
        currentManagedScrollContainer.removeEventListener(
          'scroll',
          scrollEventHandlerRef.current
        )
      }
    }
  }, [])
  useEffect(() => {
    const currentManagedScrollState = managedScrollStateRef.current
    if (
      clientGraphicsRendererProcessState.buildVersion !==
        currentManagedScrollState.buildVersion ||
      graphicsRendererProcessKey !==
        currentManagedScrollState.graphicsRendererProcessKey
    ) {
      currentManagedScrollState.buildVersion =
        clientGraphicsRendererProcessState.buildVersion
      currentManagedScrollState.automatedScrollEnabled = true
      currentManagedScrollState.previousContainerScrollTop = null
    }
    const currentManagedScrollContainer = managedScrollContainerRef.current
    if (
      currentManagedScrollContainer &&
      currentManagedScrollState.automatedScrollEnabled
    ) {
      currentManagedScrollContainer.scroll({
        top: currentManagedScrollContainer.scrollHeight,
      })
    }
  }, [clientGraphicsRendererProcessState])
  return {
    managedScrollContainerRef,
    automatedScrollEnabled:
      managedScrollStateRef.current.automatedScrollEnabled,
  }
}

interface ManagedScrollState
  extends Pick<UseManagedScrollContainerRefApi, 'graphicsRendererProcessKey'>,
    Pick<
      UseManagedScrollContainerRefApi['clientGraphicsRendererProcessState'],
      'buildVersion'
    > {
  automatedScrollEnabled: boolean
  previousContainerScrollTop: number | null
}
