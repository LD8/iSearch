'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.css'
import { FC, useEffect, useState } from 'react'
import { llmResponse, relatedQuestions, sources } from '@/components/resSample'
import Image from 'next/image'
import useStream from '@/hooks/useStream'
import events from 'events'

const getLogoFromUrl = async (url: string) => {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const linkTags = doc.querySelectorAll('link[rel*="icon"]')
    const logoUrl = (Array.from(linkTags) as HTMLLinkElement[])
      .map((link) => link.href)
      .find((href) => href !== '')
    const result = logoUrl ? new URL(logoUrl, url).href : null
    console.log({ result })
    return result
  } catch (error) {
    console.error('Error fetching website logo:', error)
    return null
  }
}
const IconFromUrl: React.FC<{ url: string }> = ({ url }) => {
  const [src, setSrc] = useState('')
  useEffect(() => {
    getLogoFromUrl(url).then((result) => result && setSrc(result))
  }, [url])
  return src.startsWith('http') ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt='website-icon' width={18} height={18} />
  ) : (
    <div className={styles.iconFromUrlPlaceholder} />
  )
}

const Search = () => {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')
  const recordId = searchParams.get('recordId')
  const { sources, markdown, relates, error } = useStream(q, recordId)

  return (
    <section className={styles.qaSection}>
      <div className={styles.queryDiv}>
        <h3>{q}</h3>
      </div>

      <div>
        <p>{markdown}</p>

        <br />

        <ul>
          {sources.map(({ name, snippet, url }, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>

        <br />

        <ul>
          {relates?.map(({ question }, index) => (
            <li key={index}>{question}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Search
