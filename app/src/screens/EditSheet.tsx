import { EditPencil, Trash } from 'iconoir-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { deleteImages, updateImage, type PersonCount, type StoredImage } from '../db'
import { Button, PersonToggle, Sheet, TextField } from '../ui'

// Edit one image's metadata, or delete it.
export function EditSheet({ image, names, onClose }: { image: StoredImage; names: string[]; onClose: () => void }) {
  const { t } = useTranslation()
  const [personCount, setPersonCount] = useState<PersonCount>(image.personCount)
  const [name, setName] = useState(image.characterName)
  const save = async () => {
    await updateImage(image.id, { personCount, characterName: name })
    onClose()
  }
  const remove = async () => {
    if (!confirm(t('library.confirm_delete', { count: 1 }))) return
    await deleteImages([image.id])
    onClose()
  }
  return (
    <Sheet
      title={
        <>
          <EditPencil width={18} height={18} />
          {t('library.edit')}
        </>
      }
      onClose={onClose}
    >
      <PersonToggle value={personCount} onChange={setPersonCount} />
      <CharacterNameInput value={name} onChange={setName} names={names} />
      <div className="flex gap-3">
        <Button variant="secondary" onClick={remove} className="flex flex-1 items-center justify-center gap-2 text-berry">
          <Trash width={18} height={18} />
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
