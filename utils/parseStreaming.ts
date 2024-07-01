import { Source, Relate } from '@/types'
import appConfigs from './app.configs'

async function pump(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  controller: ReadableStreamDefaultController,
  onChunk?: (chunk: Uint8Array) => void,
  onDone?: () => void,
): Promise<ReadableStreamReadResult<Uint8Array> | undefined> {
  const { done, value } = await reader.read()
  if (done) {
    onDone && onDone()
    controller.close()
    return
  }
  // TODO: delete this log
  console.log({ value })
  onChunk && onChunk(value)
  controller.enqueue(value)
  return pump(reader, controller, onChunk, onDone)
}

const fetchStream = (
  response: Response,
  onChunk?: (chunk: Uint8Array) => void,
  onDone?: () => void,
): ReadableStream<string> => {
  const reader = response.body!.getReader()
  return new ReadableStream({
    start: (controller) => pump(reader, controller, onChunk, onDone),
  })
}

const LLM_SPLIT = '__LLM_RESPONSE__'
const RELATED_SPLIT = '__RELATED_QUESTIONS__'

const parseStreaming = async (
  controller: AbortController,
  query: string,
  search_uuid: string,
  onSources: (value: Source[]) => void,
  onMarkdown: (value: string) => void,
  onRelates: (value: Relate[]) => void,
  onError?: (status: number) => void,
) => {
  const decoder = new TextDecoder()
  let uint8Array = new Uint8Array()
  let chunks = ''
  let sourcesEmitted = false
  const response = await fetch(appConfigs.streamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*./*',
    },
    signal: controller.signal,
    body: JSON.stringify({
      query,
      search_uuid,
      lang: 'en',
    }),
  })
  if (response.status !== 200) {
    onError?.(response.status)
    return
  }
  const markdownParse = (text: string) => {
    text = parseText(text)
    console.log({ text })
    onMarkdown(
      text
        .replace(/\[\[([cC])itation/g, '[citation')
        .replace(/[cC]itation:(\d+)]]/g, 'citation:$1]')
        .replace(/\[\[([cC]itation:\d+)]](?!])/g, `[$1]`)
        .replace(/\[[cC]itation:(\d+)]/g, '[citation]($1)'),
    )
  }
  fetchStream(
    response,
    (chunk) => {
      uint8Array = new Uint8Array([...uint8Array, ...chunk])
      chunks = decoder.decode(uint8Array, { stream: true })
      if (chunks.includes(LLM_SPLIT)) {
        const [sources, rest] = chunks.split(LLM_SPLIT)
        if (!sourcesEmitted) {
          try {
            onSources(JSON.parse(sources))
          } catch (e) {
            onSources([])
          }
        }
        sourcesEmitted = true
        if (rest.includes(RELATED_SPLIT)) {
          const [md] = rest.split(RELATED_SPLIT)
          console.log({ md })
          markdownParse(md)
        } else {
          markdownParse(rest)
        }
      }
    },
    () => {
      const [_, relates] = chunks.split(RELATED_SPLIT)
      try {
        onRelates(JSON.parse(relates))
      } catch (e) {
        onRelates([])
      }
    },
  )
}

export default parseStreaming

function parseText(t: string) {
  if (t.startsWith('\n')) {
    t = t.replace('\n', '')
    return parseText(t)
  }
  return t
}
