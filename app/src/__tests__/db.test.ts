// @vitest-environment node
// db.ts never touches the DOM, and Node's structuredClone keeps Blob intact
// (jsdom's does not), so this file runs in the node environment.
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { addImages, db, deleteImages, listCharacterNames, loadImages, updateImage, upgradeV1toV2, V2_STORES } from '../db'

const blob = (text: string) => new Blob([text], { type: 'text/plain' })
const four = (p = '') => ['a', 'b', 'c', 'd'].map((t) => blob(p + t))
const texts = (blobs: Blob[]) => Promise.all(blobs.map((b) => b.text()))

beforeEach(async () => {
  await db.images.clear()
})

describe('addImages / loadImages', () => {
  it('stores each blob with its metadata and returns them in order', async () => {
    const ids = await addImages(four(), { personCount: 2, characterName: '  Tom & Jerry ' })
    expect(ids).toHaveLength(4)
    const rows = await db.images.bulkGet(ids)
    expect(rows.every((r) => r!.personCount === 2 && r!.characterName === 'Tom & Jerry')).toBe(true)
    expect(await texts(await loadImages([ids[3], ids[0]]))).toEqual(['d', 'a'])
  })
})

describe('updateImage / deleteImages', () => {
  it('edits metadata and deletes only the given ids', async () => {
    const [a, b] = await addImages(four(), { personCount: 1, characterName: 'x' })
    await updateImage(a, { characterName: ' y ', personCount: 2 })
    expect(await db.images.get(a)).toMatchObject({ characterName: 'y', personCount: 2 })
    await deleteImages([b])
    expect(await db.images.count()).toBe(3)
  })
})

describe('listCharacterNames', () => {
  it('returns distinct non-empty names, newest first', async () => {
    await addImages(four(), { personCount: 1, characterName: 'Chiikawa' })
    await new Promise((r) => setTimeout(r, 2))
    await addImages(four(), { personCount: 2, characterName: '' })
    await new Promise((r) => setTimeout(r, 2))
    await addImages(four(), { personCount: 2, characterName: 'Kuromi' })
    expect(await listCharacterNames()).toEqual(['Kuromi', 'Chiikawa'])
  })
})

describe('v1 → v2 upgrade', () => {
  it('unpacks sets into standalone images tagged with the set name', async () => {
    const name = 'post-match-upgrade-test'
    await Dexie.delete(name)
    // Write a v1 database the way the old app did.
    const v1 = new Dexie(name)
    v1.version(1).stores({ images: '++id, createdAt', sets: '++id, personCount, createdAt' })
    const ids = (await v1.table('images').bulkAdd(
      four().map((b) => ({ blob: b, createdAt: 1 })),
      { allKeys: true },
    )) as number[]
    await v1.table('sets').add({ name: 'Tom & Jerry', personCount: 1, imageIds: ids, createdAt: 1 })
    v1.close()

    // Open it with the current schema.
    const v2 = new Dexie(name)
    v2.version(1).stores({ images: '++id, createdAt', sets: '++id, personCount, createdAt' })
    v2.version(2).stores(V2_STORES).upgrade(upgradeV1toV2)
    await v2.open()
    const rows = await v2.table('images').toArray()
    expect(rows).toHaveLength(4)
    expect(rows.every((r) => r.personCount === 1 && r.characterName === 'Tom & Jerry')).toBe(true)
    expect(v2.tables.map((t) => t.name)).not.toContain('sets')
    v2.close()
    await Dexie.delete(name)
  })
})
