'use client'

import * as React from 'react'
import { CacheProvider, EmotionCache } from '@emotion/react'
import createCache from '@emotion/cache'

// Client-side cache, shared for the whole session of the user in the browser.
const createEmotionCache = () =>
{
  return createCache({ key: 'css', prepend: true })
}

const clientSideEmotionCache = createEmotionCache()

interface EmotionCacheProviderProps
{
  children: React.ReactNode
  emotionCache?: EmotionCache
}

export default function EmotionCacheProvider ({
  children,
  emotionCache = clientSideEmotionCache,
}: EmotionCacheProviderProps)
{
  return <CacheProvider value={ emotionCache }>{ children }</CacheProvider>
}
