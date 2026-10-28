import { useTranslation } from 'react-i18next'
import { SegmentedControl } from './SegmentedControl'

export function PersonToggle({ value, onChange }: { value: 1 | 2; onChange: (v: 1 | 2) => void }) {
  const { t } = useTranslation()
  return (
    <SegmentedControl
      options={([1, 2] as const).map((n) => ({ value: n, label: t('common.people', { count: n }) }))}
      value={value}
      onChange={onChange}
    />
  )
}
