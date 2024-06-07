'use client'
import Image from 'next/image'
import styles from './page.module.css'
import SVG from '@/components/SVG'
import { useCallback, useEffect, useState } from 'react'

const PH = [
  'Who said live long and prosper',
  'When did human first land on the moon?',
  'liquid vs solid vs gas?',
]

export default function Home() {
  const [v, setV] = useState('')
  const [phIndex, setPhIndex] = useState(0)
  const search = useCallback(() => {
    const searchValue = v || PH[phIndex]
    console.log('searching: ', searchValue)
  }, [phIndex, v])

  useEffect(() => {
    setPhIndex(0)
  }, [])
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
            onKeyUp={(e) => {
              setPhIndex((prev) => {
                const countValue =
                  e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0
                const newValue = prev + countValue
                return newValue < 0 || newValue > PH.length - 1
                  ? prev
                  : newValue
              })
            }}
            onKeyDown={(e) =>
              e.shiftKey && e.key === 'Enter' ? search() : null
            }
          />
          <button onClick={search}>Search</button>
        </div>
        <div className={styles.descDiv}>
          <small>⇧ + Enter to search</small>
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
