import { faListCheck, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTodosQuery } from '../../hooks/useTodos'

const priorityStyles: Record<string, { border: string; label: string; labelColor: string }> = {
  high:   { border: '#ff4d4d', label: 'Priority Alpha', labelColor: '#ff4d4d' },
  medium: { border: '#FF6200', label: 'Priority Beta',  labelColor: '#FF6200' },
  low:    { border: 'rgba(255,255,255,0.15)', label: 'Routine Task', labelColor: '#737783' },
}

export default function TodosCard() {
  const todos = useTodosQuery()

  return (
    <section className="glass-panel rounded-[2rem] p-10 relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: 'rgba(255,98,0,0.1)', borderColor: 'rgba(255,98,0,0.2)', color: '#FF6200' }}
          >
            <FontAwesomeIcon icon={faListCheck} className="text-xl" />
          </div>
          <h3 className="font-headline font-bold text-2xl text-white">Active Tasks</h3>
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 transition-all hover:border-primary/40"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FF6200' }}
        >
          <FontAwesomeIcon icon={faPlus} className="text-sm" />
        </button>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {todos.isPending && (
          <p className="text-center py-8 text-outline text-sm">Loading...</p>
        )}
        {todos.isError && (
          <p className="text-center py-8 text-error text-sm">Failed to load tasks</p>
        )}
        {todos.data?.length === 0 && (
          <p className="text-center py-8 text-outline text-sm">No tasks yet</p>
        )}
        {todos.data?.filter(t => !t.completed).map(todo => {
          const style = priorityStyles[todo.priority] ?? priorityStyles.low
          return (
            <div
              key={todo.id}
              className="flex items-start gap-5 p-5 rounded-2xl border-y border-r border-white/5 transition-all hover:bg-surface-container cursor-pointer"
              style={{
                backgroundColor: 'rgba(13,13,18,0.8)',
                borderLeft: `4px solid ${style.border}`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: style.labelColor }}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-base font-bold text-white leading-snug mb-2">{todo.text}</p>
                {todo.due_date && (
                  <p className="text-xs text-outline">
                    Due {new Date(todo.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
