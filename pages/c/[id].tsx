import { Avatar, Icon, SEO, Tooltip } from 'components'
import type {
  GetStaticPaths,
  GetStaticProps,
  NextPage,
  InferGetStaticPropsType
} from 'next'
import { useEffect, useMemo } from 'react'
import { share, supabase, useObjectState } from 'services'
import * as cheerio from 'cheerio'
import { HomeIcon, LinkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import classnames from 'classnames'
import { EnvelopeIcon } from '@heroicons/react/24/solid'
import { Modal } from 'containers'

interface Props {
  title: string
  avatar_url: string
  content: string
}
interface State {
  isShareOpen: boolean
}

const ConversationIdPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ title, avatar_url, content }) => {
  const [{ isShareOpen }, setState] = useObjectState<State>({
    isShareOpen: false
  })
  const { query, locale } = useRouter()
  const items: Array<{ from: 'human' | 'gpt'; value: string }> = useMemo(
    () => JSON.parse(content),
    [content]
  )

  const t: string = useMemo(() => title.split('\n')[0], [title])

  const d: string = useMemo(() => {
    const value = cheerio
      .load(
        items[1].value,
        null,
        false
      )('*')
      .find('*')
      .first()
      .text()
    return value.length > 210 ? `${value.slice(0, 210)}...` : value
  }, [items])

  useEffect(() => {
    window.addEventListener('message', function (e) {
      if (e.data.embedgpt === 'true') {
        window.parent.postMessage(
          { height: document.documentElement.scrollHeight, embedgpt: 'true' },
          e.origin
        )
      }
    })
  }, [])
  return (
    <>
      <SEO
        title={t}
        description={d}
        image={`${process.env.NEXT_PUBLIC_BASE_URL}/api/t?t=${t}&d=${d}&a=${avatar_url}&l=${locale}`}
      />
      <div className="flex min-h-screen flex-col items-center bg-primary">
        {items.map((item, key) => (
          <div
            key={key}
            className={classnames(
              'w-full border-b border-gray-900/50 text-gray-100',
              item.from === 'human' ? 'bg-primary' : 'bg-secondary'
            )}
          >
            <div className="m-auto flex gap-4 p-4 md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
              <div className="relative flex w-[30px] flex-col items-end">
                <div
                  className={classnames('relative flex', {
                    'h-[30px] w-[30px] items-center justify-center rounded-sm bg-brand p-1 text-white':
                      item.from === 'gpt'
                  })}
                >
                  {item.from === 'human' ? (
                    <Avatar url={avatar_url} />
                  ) : (
                    <Icon.ChatGPT />
                  )}
                </div>
              </div>
              <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                <div className="flex flex-grow flex-col gap-3">
                  <div className="flex min-h-[20px] flex-col items-start gap-4 whitespace-pre-wrap break-words text-[#ececf1]">
                    {item.from === 'human' ? (
                      item.value
                    ) : (
                      <div
                        className="w-full"
                        dangerouslySetInnerHTML={{ __html: item.value }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-between"></div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center bg-primary py-10 lg:hidden">
          <div>
            <div className="flex items-center gap-4">
              <Tooltip content="Home">
                <button
                  onClick={() =>
                    window.open('https://embedgpt.vercel.app', '_blank')
                  }
                >
                  <HomeIcon className="h-6 w-6 text-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="Copy URL">
                <button onClick={() => share.url(query.id as string)}>
                  <LinkIcon className="h-6 w-6 text-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="Embed">
                <button onClick={() => setState({ isShareOpen: true })}>
                  <Icon.Embed className="h-6 w-6 fill-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="Email">
                <button onClick={() => share.email(query.id as string)}>
                  <EnvelopeIcon className="h-6 w-6 text-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="Twitter">
                <button onClick={() => share.twitter(query.id as string)}>
                  <Icon.Twitter className="h-6 w-6 fill-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="Facebook">
                <button onClick={() => share.facebook(query.id as string)}>
                  <Icon.Facebook className="h-6 w-6 fill-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="카카오톡">
                <button onClick={() => share.kakaotalk(query.id as string)}>
                  <Icon.KakaoTalk className="h-6 w-6 fill-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="Reddit">
                <button onClick={() => share.reddit(query.id as string)}>
                  <Icon.Reddit className="h-6 w-6 fill-[#d1d5db]" />
                </button>
              </Tooltip>
              <Tooltip content="LinkedIn">
                <button onClick={() => share.linkedin(query.id as string)}>
                  <Icon.LinkedIn className="h-6 w-6 fill-[#d1d5db]" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="fixed top-16 left-[calc((100vw-768px)/2+768px)] hidden lg:block">
          <ul className="share-floating">
            <li>
              <Tooltip position="left" content="Copy URL">
                <button onClick={() => share.url(query.id as string)}>
                  <LinkIcon className="text-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="Embed">
                <button onClick={() => setState({ isShareOpen: true })}>
                  <Icon.Embed className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="Email">
                <button onClick={() => share.email(query.id as string)}>
                  <EnvelopeIcon className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="Twitter">
                <button onClick={() => share.twitter(query.id as string)}>
                  <Icon.Twitter className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="Facebook">
                <button onClick={() => share.facebook(query.id as string)}>
                  <Icon.Facebook className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="카카오톡">
                <button onClick={() => share.kakaotalk(query.id as string)}>
                  <Icon.KakaoTalk className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="Reddit">
                <button onClick={() => share.reddit(query.id as string)}>
                  <Icon.Reddit className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
            <li>
              <Tooltip position="left" content="LinkedIn">
                <button onClick={() => share.linkedin(query.id as string)}>
                  <Icon.LinkedIn className="fill-neutral-300" />
                </button>
              </Tooltip>
            </li>
          </ul>
        </div>
      </div>
      <span className="prose prose-invert ml-auto hidden h-4 w-4 overflow-y-auto !whitespace-pre font-sans text-xs">
        <span className="w-full" />
      </span>
      {isShareOpen && (
        <Modal.Share
          isOpen={isShareOpen}
          onClose={() => setState({ isShareOpen: false })}
          id={query.id as string}
          title={title}
          avatarUrl={avatar_url}
        />
      )}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await supabase.from('conversations').select('id')
  return {
    paths: data?.map((item) => ({ params: { id: item.id } })) || [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', params.id)
    .single()
  if (data) {
    return { props: data, revalidate: 60 }
  } else {
    return { redirect: { destination: '/', statusCode: 301 } }
  }
}

export default ConversationIdPage
