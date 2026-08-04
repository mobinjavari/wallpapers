import type { WallpaperMeta, WallpaperDetail, WallpaperAuthor } from '~/types/wallpaper'

export type { WallpaperMeta, WallpaperDetail, WallpaperAuthor }

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const REPO_OWNER = 'mobinjavari'
const REPO_NAME = 'wallpapers'
const BRANCH = 'main'
const WALLPAPERS_DIR = 'wallpapers'
const VALID_FORMATS = /\.(jpg|jpeg|png|webp|gif|avif)$/i
const CACHE_TTL = 5 * 60 * 1000

let wallpapersCache: CacheEntry<WallpaperMeta[]> | null = null
let starsCache: CacheEntry<number> | null = null
let creationDatesCache: CacheEntry<Map<string, string>> | null = null
const detailCache = new Map<string, CacheEntry<WallpaperDetail>>()

type GQLEntry = {
  name: string
  type: string
  object: { byteSize?: number, oid?: string } | null
}

function isValid<T>(cache: CacheEntry<T> | null): cache is CacheEntry<T> {
  return cache !== null && Date.now() < cache.expiresAt
}

async function gql<T>(token: string, query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub GraphQL ${res.status}: ${body || res.statusText}`)
  }
  const json = (await res.json()) as { data?: T, errors?: Array<{ message: string }> }
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join('; '))
  if (json.data === undefined) throw new Error('Empty GraphQL response')
  return json.data as T
}

function buildRawUrl(relPath: string): string {
  return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${WALLPAPERS_DIR}/${relPath}`
}

function parseBlob(
  filename: string,
  byteSize: number,
  parentTags: string[],
  oid: string,
): WallpaperMeta | null {
  if (!VALID_FORMATS.test(filename)) return null
  const dot = filename.lastIndexOf('.')
  const name = dot !== -1 ? filename.slice(0, dot) : filename
  const ext = dot !== -1 ? filename.slice(dot + 1).toLowerCase() : 'img'
  const relPath = [...parentTags, filename].join('/')
  return {
    name,
    ext,
    hashtags: parentTags,
    rawUrl: buildRawUrl(relPath),
    size: byteSize,
    path: `${WALLPAPERS_DIR}/${relPath}`,
    oid,
    createdAt: null,
  }
}

async function fetchTreeByOid(token: string, oid: string): Promise<GQLEntry[]> {
  const data = await gql<{
    repository: { object: { entries: GQLEntry[] } | null } | null
  }>(
    token,
    `query GetTree($owner: String!, $name: String!, $oid: GitObjectID!) {
      repository(owner: $owner, name: $name) {
        object(oid: $oid) {
          ... on Tree {
            entries {
              name type
              object {
                ... on Blob { byteSize oid }
                ... on Tree { oid }
              }
            }
          }
        }
      }
    }`,
    { owner: REPO_OWNER, name: REPO_NAME, oid },
  )
  return data.repository?.object?.entries ?? []
}

async function collectItems(
  token: string,
  entries: GQLEntry[],
  parentTags: string[],
): Promise<WallpaperMeta[]> {
  const items: WallpaperMeta[] = []
  const subFetches: Promise<WallpaperMeta[]>[] = []

  for (const entry of entries) {
    if (entry.type === 'blob') {
      const item = parseBlob(entry.name, entry.object?.byteSize ?? 0, parentTags, entry.object?.oid ?? '')
      if (item) items.push(item)
    }
    else if (entry.type === 'tree' && entry.object?.oid) {
      const treeOid = entry.object.oid
      const tag = entry.name
      subFetches.push(
        fetchTreeByOid(token, treeOid).then(sub =>
          collectItems(token, sub, [...parentTags, tag]),
        ),
      )
    }
  }

  const nested = await Promise.all(subFetches)
  return [...items, ...nested.flat()]
}

type RestCommitListEntry = {
  sha: string
}

type RestCommitFile = {
  filename: string
  status: string
  sha: string
}

type RestCommitDetail = {
  commit: {
    author: { date: string } | null
  }
  files?: RestCommitFile[]
}

async function restGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'wallpapers-gallery',
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub REST ${res.status}: ${body || res.statusText}`)
  }
  return (await res.json()) as T
}

export async function fetchCreationDates(token: string): Promise<Map<string, string>> {
  if (isValid(creationDatesCache)) return creationDatesCache.data

  try {
    const shas: string[] = []
    let page = 1
    const perPage = 100
    for (;;) {
      const commits = await restGet<RestCommitListEntry[]>(
        `/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=${WALLPAPERS_DIR}&per_page=${perPage}&page=${page}`,
        token,
      )
      shas.push(...commits.map(c => c.sha))
      if (commits.length < perPage) break
      page += 1
    }

    const details = await Promise.all(
      shas.map(sha =>
        restGet<RestCommitDetail>(`/repos/${REPO_OWNER}/${REPO_NAME}/commits/${sha}`, token),
      ),
    )

    // Reverse to chronological (oldest-first) order so the first time a blob
    // sha is seen corresponds to its original addition date, even if it was
    // later renamed (same content, new path, same blob sha).
    const chronological = [...details].reverse()

    const map = new Map<string, string>()
    for (const detail of chronological) {
      const date = detail.commit.author?.date
      if (!date) continue
      for (const file of detail.files ?? []) {
        if (!file.filename.startsWith(`${WALLPAPERS_DIR}/`)) continue
        if (!map.has(file.sha)) map.set(file.sha, date)
      }
    }

    creationDatesCache = { data: map, expiresAt: Date.now() + CACHE_TTL }
    return map
  }
  catch (err) {
    console.error('[github] fetchCreationDates:', err instanceof Error ? err.message : err)
    const empty = new Map<string, string>()
    creationDatesCache = { data: empty, expiresAt: Date.now() + CACHE_TTL }
    return empty
  }
}

export async function fetchWallpapers(): Promise<WallpaperMeta[]> {
  if (isValid(wallpapersCache)) return wallpapersCache.data

  const { githubToken: token } = useRuntimeConfig()

  const data = await gql<{
    repository: { object: { entries: GQLEntry[] } | null } | null
  }>(
    token,
    `query GetWallpapers($owner: String!, $name: String!, $expr: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: $expr) {
          ... on Tree {
            entries {
              name type
              object {
                ... on Blob { byteSize oid }
                ... on Tree { oid }
              }
            }
          }
        }
      }
    }`,
    { owner: REPO_OWNER, name: REPO_NAME, expr: `${BRANCH}:${WALLPAPERS_DIR}` },
  )

  if (!data.repository) throw new Error('repository is null — check PAT permissions or repo name')

  const rootEntries = data.repository.object?.entries ?? []
  const rawItems = await collectItems(token, rootEntries, [])

  const dateMap = await fetchCreationDates(token)
  const items = rawItems.map(item => ({
    ...item,
    createdAt: dateMap.get(item.oid) ?? null,
  }))

  const byNameDesc = (a: WallpaperMeta, b: WallpaperMeta) =>
    b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })

  items.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      const diff = Date.parse(b.createdAt) - Date.parse(a.createdAt)
      if (diff !== 0) return diff
      return byNameDesc(a, b)
    }
    // Fall back to the name-based comparator when a creation date is
    // missing on one or both sides (e.g. no token configured, or the
    // REST calls failed), so ordering degrades gracefully instead of
    // throwing or producing a nonsensical order.
    return byNameDesc(a, b)
  })
  wallpapersCache = { data: items, expiresAt: Date.now() + CACHE_TTL }
  return items
}

type CommitNode = {
  committedDate: string
  author: {
    name: string
    user: { login: string, avatarUrl: string, url: string } | null
  } | null
}

function parseAuthor(node: CommitNode | undefined): WallpaperAuthor | null {
  if (!node?.author) return null
  const { name, user } = node.author
  return {
    name,
    login: user?.login ?? null,
    avatarUrl: user?.avatarUrl ?? null,
    profileUrl: user?.url ?? null,
  }
}

export async function fetchWallpaperByName(name: string): Promise<WallpaperDetail | null> {
  const cached = detailCache.get(name) ?? null
  if (isValid(cached)) return cached.data

  const all = await fetchWallpapers()
  const wallpaper = all.find(w => w.name === name)
  if (!wallpaper) return null

  const { githubToken: token } = useRuntimeConfig()
  if (!token) {
    const detail: WallpaperDetail = { ...wallpaper, lastModified: null, author: null }
    detailCache.set(name, { data: detail, expiresAt: Date.now() + CACHE_TTL })
    return detail
  }

  try {
    const data = await gql<{
      repository: {
        ref: {
          target: { history: { nodes: CommitNode[] } }
        } | null
      }
    }>(
      token,
      `query GetLastCommit($owner: String!, $name: String!, $path: String!) {
        repository(owner: $owner, name: $name) {
          ref(qualifiedName: "main") {
            target {
              ... on Commit {
                history(first: 1, path: $path) {
                  nodes {
                    committedDate
                    author {
                      name
                      user { login avatarUrl url }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
      { owner: REPO_OWNER, name: REPO_NAME, path: wallpaper.path },
    )

    const node = data.repository.ref?.target?.history?.nodes?.[0]
    const detail: WallpaperDetail = {
      ...wallpaper,
      lastModified: node?.committedDate ?? null,
      author: parseAuthor(node),
    }
    detailCache.set(name, { data: detail, expiresAt: Date.now() + CACHE_TTL })
    return detail
  }
  catch {
    const detail: WallpaperDetail = { ...wallpaper, lastModified: null, author: null }
    detailCache.set(name, { data: detail, expiresAt: Date.now() + CACHE_TTL })
    return detail
  }
}

export async function fetchStarCount(): Promise<number> {
  if (isValid(starsCache)) return starsCache.data

  const { githubToken: token } = useRuntimeConfig()
  if (!token) {
    starsCache = { data: 0, expiresAt: Date.now() + CACHE_TTL }
    return 0
  }

  try {
    const data = await gql<{
      repository: { stargazerCount: number } | null
    }>(
      token,
      `query GetStars($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) { stargazerCount }
      }`,
      { owner: REPO_OWNER, name: REPO_NAME },
    )

    if (!data.repository) throw new Error('repository is null — check PAT permissions')
    const count = data.repository.stargazerCount
    starsCache = { data: count, expiresAt: Date.now() + CACHE_TTL }
    return count
  }
  catch (err) {
    console.error('[github] fetchStarCount:', err instanceof Error ? err.message : err)
    starsCache = { data: 0, expiresAt: Date.now() + CACHE_TTL }
    return 0
  }
}
