import Dexie, { type EntityTable } from 'dexie'

export type PersonCount = 1 | 2

// Images are stored individually so a later "mix and match" library can reuse
// them; a set just points at four of them in order.
export interface StoredImage {
  id: number
  blob: Blob
  createdAt: number
}

export interface CartoonSet {
  id: number
  name: string
  personCount: PersonCount
  imageIds: number[]
  createdAt: number
}

export const db = new Dexie('post-match') as Dexie & {
  images: EntityTable<StoredImage, 'id'>
  sets: EntityTable<CartoonSet, 'id'>
}

db.version(1).stores({
  images: '++id, createdAt',
  sets: '++id, personCount, createdAt',
})

export const SHOTS_PER_SET = 4

export async function saveSet(name: string, personCount: PersonCount, files: Blob[]) {
  return db.transaction('rw', db.images, db.sets, async () => {
    const now = Date.now()
    const imageIds = (await db.images.bulkAdd(
      files.map((blob) => ({ blob, createdAt: now })),
      { allKeys: true },
    )) as number[]
    const id = await db.sets.add({ name, personCount, imageIds, createdAt: now })
    return (await db.sets.get(id))!
  })
}

export async function loadSetImages(set: CartoonSet): Promise<Blob[]> {
  const images = await db.images.bulkGet(set.imageIds)
  return images.map((img) => img!.blob)
}

export async function deleteSet(set: CartoonSet) {
  await db.transaction('rw', db.images, db.sets, async () => {
    await db.images.bulkDelete(set.imageIds)
    await db.sets.delete(set.id)
  })
}
