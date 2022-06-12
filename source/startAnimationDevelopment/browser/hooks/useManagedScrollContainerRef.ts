import { useEffect, useRef } from 'react'
import { AnimationDevelopmentLogsDisplayProps } from '../AnimationDevelopmentLogsPage'

export interface UseManagedScrollContainerRefApi
  extends Pick<
    AnimationDevelopmentLogsDisplayProps,
    'buildVersion' | 'graphicsRendererProcessStdoutLog' | 'resultLink'
  > {
  localStorageKey: string
}

export function useManagedScrollContainerRef(
  api: UseManagedScrollContainerRefApi
) {
  const {
    buildVersion,
    localStorageKey,
    graphicsRendererProcessStdoutLog,
    resultLink,
  } = api
  const managedScrollContainerRef = useRef<HTMLDivElement>(null)
  const managedScrollStateRef = useRef<ManagedScrollState>({
    buildVersion,
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
      if (buildVersion === cachedManagedScrollState?.buildVersion) {
        currentManagedScrollContainer.scroll({
          top: cachedManagedScrollState.previousContainerScrollTop || 0,
        })
        managedScrollStateRef.current = cachedManagedScrollState
      }
      return () => {
        currentManagedScrollContainer.removeEventListener(
          'scroll',
          scrollEventHandlerRef.current
        )
      }
    }
  }, [])
  useEffect(() => {
    const currentManagedScrollState = managedScrollStateRef.current
    if (buildVersion !== currentManagedScrollState.buildVersion) {
      currentManagedScrollState.buildVersion = buildVersion
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
  }, [buildVersion, graphicsRendererProcessStdoutLog, resultLink])
  return { managedScrollContainerRef }
}

interface ManagedScrollState
  extends Pick<UseManagedScrollContainerRefApi, 'buildVersion'> {
  automatedScrollEnabled: boolean
  previousContainerScrollTop: number | null
}
