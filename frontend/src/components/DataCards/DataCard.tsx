import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Children, type ReactNode } from 'react'

export default function DataCard({ children }: { children: ReactNode }) {
  const isEmpty = Children.count(children) === 0

  return (
    <div className="rounded-2xl bg-gray-900 p-4">
      {isEmpty
        ? <p className="py-6 text-center text-sm text-gray-500">No items yet</p>
        : <ul className="flex flex-col gap-2">{children}</ul>
      }
    </div>
  )
}

interface DataCardItemProps {
  children: ReactNode
  icon?: IconDefinition
  checklist?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function DataCardItem({ children, icon, checklist = false, checked = false, onCheckedChange }: DataCardItemProps) {

  return (
    <li className="flex items-center gap-3 rounded-xl bg-gray-800 px-4 py-3">
      {icon && (
        <FontAwesomeIcon icon={icon} className="w-4 shrink-0 text-gray-400" />
      )}

      <span className="flex-1 text-sm text-gray-100">{children}</span>

      {checklist && (
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onCheckedChange?.(e.target.checked)}
          className="h-4 w-4 shrink-0 accent-indigo-500 cursor-pointer"
        />
      )}
    </li>
  )
}
