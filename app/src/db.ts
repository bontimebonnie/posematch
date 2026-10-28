import Dexie, { type EntityTable, type Transaction } from 'dexie'

export type PersonCount = 1 | 2

// Every cartoon image is its own record. Shooting picks any four of them,
// so there is no "set" any more (v1 had one; v2 unpacks it, see below).
export interface StoredImage {
  id: number
  blob: Blob
  personCount: PersonCount
  characterName: string
  // Images cropped from the same source share this, so they can be shown
  // together later.
  sourceId?: string
  createdAt: number
}

// v1 only; kept so the v2 upgrade can read it.
interface LegacySet {
  id: number
  name: string
  personCount: PersonCount
  imageIds: number[]
  createdAt: number
}

export const db = new Dexie('post-match') as Dexie & {
  images: EntityTable<StoredImage, 'id'>
}

db.version(1).stores({
  images: '++id, createdAt',
  sets: '++id, personCount, createdAt',
})

export const V2_STORES = {
  images: '++id, createdAt, personCount, characterName, [personCount+characterName]',
  sets: null,
}

// Each v1 set becomes N standalone images tagged with the set's name.
export async function upgradeV1toV2(tx: Transaction) {
  const sets = (await tx.table('sets').toArray()) as LegacySet[]
  const meta = new Map<number, { personCount: PersonCount; characterName: string }>()
  for (const set of sets) {
    for (const id of set.imageIds) meta.set(id, { personCount: set.personCount, characterName: set.name })
  }
  await tx
    .table('images')
    .toCollection()
    .modify((img: Partial<StoredImage> & { id: number }) => {
      const m = meta.get(img.id)
      img.personCount = m?.personCount ?? 2
      img.characterName = m?.characterName ?? ''
    })
}

db.version(2).stores(V2_STORES).upgrade(upgradeV1toV2)

export const SHOTS_PER_SET = 4

export interface ImageMeta {
  personCount: PersonCount
  characterName: string
  sourceId?: string
}

export interface ImportItem {
  blob: Blob
  // Shared by every crop taken from the same original.
  sourceId: string
}

export async function addImageBatch(items: ImportItem[], meta: Omit<ImageMeta, 'sourceId'>): Promise<number[]> {
  const now = Date.now()
  const name = meta.characterName.trim()
  return (await db.images.bulkAdd(
    items.map(({ blob, sourceId }) => ({ blob, personCount: meta.personCount, characterName: name, sourceId, createdAt: now })),
    { allKeys: true },
  )) as number[]
}

export function addImages(blobs: Blob[], meta: ImageMeta): Promise<number[]> {
  const sourceId = meta.sourceId ?? crypto.randomUUID()
  return addImageBatch(
    blobs.map((blob) => ({ blob, sourceId })),
    meta,
  )
}

export async function updateImage(id: number, changes: Partial<ImageMeta>) {
  if (changes.characterName !== undefined) changes = { ...changes, characterName: changes.characterName.trim() }
  await db.images.update(id, changes)
}

export async function deleteImages(ids: number[]) {
  await db.images.bulkDelete(ids)
}

// Blobs for the given ids, in the same order as `ids`.
export async function loadImages(ids: number[]): Promise<Blob[]> {
  const images = await db.images.bulkGet(ids)
  return images.map((img) => img!.blob)
}

// Distinct names, most recently used first, for filter chips and autocomplete.
export async function listCharacterNames(): Promise<string[]> {
  const seen = new Set<string>()
  const names: string[] = []
  await db.images.orderBy('createdAt').reverse().each((img) => {
    if (img.characterName && !seen.has(img.characterName)) {
      seen.add(img.characterName)
      names.push(img.characterName)
    }
  })
  return names
}
