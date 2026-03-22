import { faBasketShopping, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'
import { useShoppingQuery } from '../../hooks/useShopping'

const COLS = 2
const ITEM_HEIGHT_PX = 60 // approximate height of each item row including gap

export default function ShoppingListCard() {
  const shopping = useShoppingQuery();
  const gridRef = useRef<HTMLDivElement>(null);
  const [maxItems, setMaxItems] = useState(10);

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      const rows = Math.floor(el.clientHeight / ITEM_HEIGHT_PX)
      setMaxItems(Math.max(2, rows) * COLS)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, []);

  const all = shopping.data ?? [];
  const visible = all.slice(0, maxItems);
  const overflow = all.length - visible.length;

  console.log(shopping);

  return (
    <section className="glass-panel rounded-[2rem] p-8 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border"
            style={{ backgroundColor: 'rgba(255,98,0,0.1)', borderColor: 'rgba(255,98,0,0.2)', color: '#FF6200' }}
          >
            <FontAwesomeIcon icon={faBasketShopping} className="text-xl" />
          </div>
          <h3 className="font-headline font-bold text-2xl text-white">Shopping List</h3>
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 transition-all hover:border-primary/40"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#FF6200' }}
        >
          <FontAwesomeIcon icon={faPlus} className="text-sm" />
        </button>
      </div>

      {/* Items grid — fills remaining space */}
      <div ref={gridRef} className="flex-1 min-h-0">
        <div className="grid grid-cols-2 gap-3 content-start h-full">
          {shopping.isPending && (
            <p className="col-span-2 text-center py-8 text-outline text-sm">Loading...</p>
          )}
          {shopping.isError && (
            <p className="col-span-2 text-center py-8 text-error text-sm">Failed to load items</p>
          )}
          {all.length === 0 && shopping.isSuccess && (
            <p className="col-span-2 text-center py-8 text-outline text-sm">No items yet</p>
          )}
          {visible.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-all hover:border-primary/30"
              style={{ backgroundColor: 'rgba(13,13,18,0.8)' }}
            >
              <div
                className="w-5 h-5 rounded border-2 shrink-0"
                style={{ borderColor: 'rgba(255,98,0,0.4)' }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{item.item}</p>
                {item.quantity && (
                  <p className="text-[10px] uppercase tracking-widest text-outline truncate">{item.quantity}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overflow indicator */}
      {overflow > 0 && (
        <p className="mt-3 text-center text-xs text-outline shrink-0">
          and {overflow} more item{overflow !== 1 ? 's' : ''}
        </p>
      )}
    </section>
  )
}
