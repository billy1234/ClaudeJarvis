import Header from './Header'
import ShoppingListCard from './DataCards/ShoppingListCard'
import RemindersCard from './DataCards/RemindersCard'
import TodosCard from './DataCards/TodosCard'

export default function Dashboard() {
  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header />

      <main className="flex-1 overflow-hidden p-10 xl:p-14 max-w-[2400px] mx-auto w-full flex flex-col">
        {/* Page heading */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide text-outline font-headline uppercase">
            Dashboard
          </h1>
          <p className="text-sm text-outline">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* 3-column bento grid */}
        <div className="grid grid-cols-12 gap-8 xl:gap-10 flex-1 min-h-0">
          <div className="col-span-12 lg:col-span-4 min-h-0">
            <ShoppingListCard />
          </div>
          <div className="col-span-12 lg:col-span-4 min-h-0">
            <TodosCard />
          </div>
          <div className="col-span-12 lg:col-span-4 min-h-0">
            <RemindersCard />
          </div>
        </div>
      </main>

    </div>
  )
}
