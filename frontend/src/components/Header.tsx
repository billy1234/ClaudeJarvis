import { faCloudSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-12 py-5 border-b border-white/5"
      style={{ backgroundColor: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(24px)' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center"
          style={{ boxShadow: '0 4px 16px -4px rgba(255,98,0,0.5)' }}
        >
          <span className="text-white font-black text-lg font-headline">J</span>
        </div>
        <span className="text-2xl font-black tracking-tighter text-white font-headline">JARVIS</span>
      </div>

      {/* Weather placeholder */}
      <div className="flex items-center gap-3 text-outline">
        <FontAwesomeIcon icon={faCloudSun} className="text-2xl" style={{ color: '#FF6200' }} />
        <div>
          <p className="text-sm font-semibold text-white">--°C</p>
          <p className="text-[10px] uppercase tracking-widest">Weather</p>
        </div>
      </div>
    </header>
  )
}
