import { fromPairs, KeyValuePair } from "ramda"

export function urlQuery() {
  // return new URLSearchParams(location.search)
  const matchs = window.location.search.match(/\?(.+)/)
  if (!matchs) return {}
  const query = matchs[1]
  const entries: Array<KeyValuePair<string, string>> = []
  query.split('&').forEach(v => {
    entries.push(v.split('=') as KeyValuePair<string, string>)
  })
  return fromPairs(entries)
}
