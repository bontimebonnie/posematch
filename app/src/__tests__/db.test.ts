// @vitest-environment node
// db.ts never touches the DOM, and Node's structuredClone keeps Blob intact
// (jsdom's does not), so this file runs in the node environment.
import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db, deleteSet, loadSetImages, saveSet } from '../db'

const blob = (text: string) => new Blob([text], { type: 'text/plain' })
const four = () => ['a', 'b', 'c', 'd'].map(blob)
const texts = (blobs: Blob[]) => Promise.all(blobs.map((b) => b.text()))

beforeEach(async () => {
  await db.images.clear()
  await db.sets.clear()
})

describe('saveSet', () => {
  it('stores four images and one set pointing at them', async () => {
    const set = await saveSet('Tom & Jerry', 2, four())
    expect(set.name).toBe('Tom & Jerry')
    expect(set.personCount).toBe(2)
    expect(set.imageIds).toHaveLength(4)
    expect(await db.images.count()).toBe(4)
    expect(await db.sets.count()).toBe(1)
  })
})

describe('loadSetImages', () => {
  it('returns the blobs in the same order they were saved', async () => {
    const set = await saveSet('order', 1, four())
    const blobs = await loadSetImages(set)
    expect(await texts(blobs)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('deleteSet', () => {
  it('removes the set and its images, leaving other sets alone', async () => {
    const keep = await saveSet('keep', 2, four())
    const gone = await saveSet('gone', 2, four())
    await deleteSet(gone)
    expect(await db.sets.get(gone.id)).toBeUndefined()
    expect(await db.sets.get(keep.id)).toBeDefined()
    expect(await db.images.count()).toBe(4)
    expect(await texts(await loadSetImages(keep))).toEqual(['a', 'b', 'c', 'd'])
  })
})
