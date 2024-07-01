import { Source, Relate } from '@/types'
import parseStreaming from '@/utils/parseStreaming'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

/**
 * Use SSE hook
 */
const useStream = (query?: string | null, rid?: string | null) => {
  const [sources, setSources] = useState<Source[]>([])
  const [markdown, setMarkdown] = useState<string>('')
  const [relates, setRelates] = useState<Relate[] | null>(null)
  const [error, setError] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!query || !rid) {
      router.push('/')
      return
    }
    const controller = new AbortController()
    void parseStreaming(
      controller,
      query,
      rid,
      setSources,
      setMarkdown,
      setRelates,
      setError,
    )
    return () => {
      console.log({ env: process.env.NODE_ENV })
      if (process.env.NODE_ENV === 'development') return
      controller.abort()
    }
  }, [query, rid, router])

  return { sources, markdown, relates, error }
}

export default useStream
