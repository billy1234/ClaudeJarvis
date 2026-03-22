import { faBell, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRemindersQuery } from '../../hooks/useReminders'

export default function RemindersCard() {
  const reminders = useRemindersQuery()

  return (
    <section
      className="signature-gradient rounded-[2rem] p-10 relative overflow-hidden h-full flex flex-col"
      style={{ boxShadow: '0 20px 60px -20px rgba(255,98,0,0.35)' }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary/20 blur-[80px] -ml-24 -mb-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <FontAwesomeIcon icon={faBell} className="text-white text-xl" />
            </div>
            <h3 className="font-headline font-bold text-2xl text-white">Alerts &amp; Reminders</h3>
          </div>
          <button className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all border border-white/20 text-white">
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-8 flex-1">
          {reminders.isPending && (
            <p className="text-white/60 text-sm text-center py-8">Loading...</p>
          )}
          {reminders.isError && (
            <p className="text-white/60 text-sm text-center py-8">Failed to load reminders</p>
          )}
          {reminders.data?.length === 0 && (
            <p className="text-white/60 text-sm text-center py-8">No reminders</p>
          )}
          {reminders.data?.map((rem, i) => (
            <div
              key={rem.id}
              className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full"
              style={{ ['--tw-before-bg' as string]: i === 0 ? '#00f0ff' : 'rgba(255,255,255,0.2)' }}
            >
              {/* Left accent line */}
              <div
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                style={{ backgroundColor: i === 0 ? '#00f0ff' : 'rgba(255,255,255,0.25)' }}
              />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                {i === 0 ? 'Imminent' : `Sequence ${String(i + 1).padStart(2, '0')}`}
              </p>
              <p className="text-lg font-bold text-white mb-1 leading-snug">{rem.text}</p>
              <p
                className="text-sm font-black tracking-wider"
                style={{ color: i === 0 ? '#00f0ff' : 'rgba(255,255,255,0.8)' }}
              >
                {new Date(rem.remind_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
