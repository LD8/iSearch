'use client'
import Image from 'next/image'
import styles from './page.module.css'
import SVG from '@/components/SVG'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { genUUID } from '@/utils'

const PH = [
  'Who said live long and prosper',
  'When did human first land on the moon?',
  'liquid vs solid vs gas?',
]
// ←↑→↓

export default function Home() {
  const [v, setV] = useState('')
  const [phIndex, setPhIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    setPhIndex(0)
  }, [])

  const search = useCallback(() => {
    const searchValue = v || PH[phIndex]
    console.log('searching: ', searchValue)
    router.push(`/search?q=${searchValue}&recordId=${genUUID()}`)
  }, [phIndex, router, v])

  return (
    <main className={styles.main}>
      <section className={styles.inputSection}>
        <h1>
          <small>i</small>
          <span>Search</span>
        </h1>
        <div className={styles.inputDiv}>
          <input
            type='text'
            placeholder={PH[phIndex]}
            autoFocus
            value={v}
            onChange={(e) => setV(e.target.value.trim())}
            onKeyDown={(e) =>
              e.shiftKey && e.key === 'Enter' ? search() : null
            }
            onKeyUp={(e) => {
              if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                setPhIndex((prev) => {
                  const countValue =
                    e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0
                  const newValue = prev + countValue
                  return newValue < 0 || newValue > PH.length - 1
                    ? prev
                    : newValue
                })
              }
            }}
          />
          <button onClick={search}>Search</button>
        </div>
        <div className={styles.descDiv}>
          <small>
            ⇧ + Enter to search | Press ↑↓ to flick through hot questions
          </small>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href='#'>
          <small>
            <SVG.ExternalLink />
            Documentation
          </small>
        </a>
        <a href='#'>
          <small>
            <SVG.GitHub />
            Source code
          </small>
        </a>
      </footer>
    </main>
  )
}
