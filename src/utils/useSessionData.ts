import { useState, useEffect } from 'react'
import type { Session, SessionMeta } from '@/types'

// Cache in-memory to avoid repeated fetches
const sessionCache = new Map<string, Session>()
let indexCache: SessionMeta[] | null = null

export async function fetchSessionIndex(): Promise<SessionMeta[]> {
  if (indexCache) return indexCache
  const res = await fetch('/data/index.json')
  if (!res.ok) throw new Error('Kunde inte ladda provindex')
  indexCache = await res.json()
  return indexCache!
}

export async function fetchSession(id: string): Promise<Session> {
  if (sessionCache.has(id)) return sessionCache.get(id)!
  const res = await fetch(`/data/sessions/${id}.json`)
  if (!res.ok) throw new Error(`Kunde inte ladda prov: ${id}`)
  const data: Session = await res.json()
  sessionCache.set(id, data)
  return data
}

export function useSessionIndex() {
  const [data, setData] = useState<SessionMeta[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessionIndex()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  return { data, error, loading }
}

export function useSession(id: string | undefined) {
  const [data, setData] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchSession(id)
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [id])

  return { data, error, loading }
}
