import { EditPencil, Trash } from 'iconoir-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteImages, updateImage, type PersonCount, type StoredImage } from '../db'
import { Button, ConfirmSheet, PersonToggle, Sheet, TextField } from '../ui'

// Edit one image's metadata, or delete it.
export function EditSheet({ image, names, onClose }: { image: StoredImage; names: string[]; onClose: () => void }) {
  const { t } = useTranslation()
  const [personCount, setPersonCount] = useState<PersonCount>(image.personCount)
  const [name, setName] = useState(image.characterName)
  const [confirming, setConfirming] = useState(false)
  const save = async () => {
    await updateImage(image.id, { personCount, characterName: name })
    onClose()
  }
  const remove = async () => {
    await deleteImages([image.id])
    onClose()
  }
  if (confirming) {
    return (
      <ConfirmSheet
        title={t('library.confirm_delete_title', { count: 1 })}
        body={t('library.confirm_delete_body')}
        confirmLabel={t('common.delete')}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    )
  }
  return (
    <Sheet
      title={
        <>
          <EditPencil width={24} height={24} />
          {t('library.edit')}
        </>
      }
      onClose={onClose}
    >
      <PersonToggle value={personCount} onChange={setPersonCount} />
      <CharacterNameInput value={name} onChange={setName} names={names} />
      <div className="flex gap-2">
        <Button variant="danger" onClick={() => setConfirming(true)} className="flex-1">
          <Trash width={20} height={20} />
          {t('common.delete')}
        </Button>
        <Button onClick={save} className="flex-1">
          {t('common.save')}
        </Button>
      </div>
    </Sheet>
  )
}

export function CharacterNameInput({ value, onChange, names }: { value: string; onChange: (v: string) => void; names: string[] }) {
  const { t } = useTranslation()
  return (
    <TextField
      label={`${t('library.character_label')}（${t('library.character_hint')}）`}
      value={value}
      onChange={onChange}
      placeholder={t('library.character_placeholder')}
      suggestions={{ id: 'character-names', values: names }}
    />
  )
}
