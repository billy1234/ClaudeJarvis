import { useQuery } from '@tanstack/react-query'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface CatFact {
  fact: string
  length: number
}

async function fetchCatFact(): Promise<CatFact> {
  const response = await fetch('https://catfact.ninja/fact')
  if (!response.ok) {
    throw new Error('Failed to fetch cat fact')
  }
  return response.json()
}

function App() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['catFact'],
    queryFn: fetchCatFact,
  })

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Jarvis</h1>
      <div className="card">
        <h2>Random Cat Fact</h2>
        {isLoading && <p>Loading cat fact...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        {data && (
          <div>
            <p style={{ fontSize: '1.1em', lineHeight: '1.5' }}>{data.fact}</p>
            <p style={{ fontSize: '0.9em', opacity: 0.7 }}>Length: {data.length} characters</p>
          </div>
        )}
        <button onClick={() => refetch()} style={{ marginTop: '1rem' }}>
          Get Another Cat Fact
        </button>
      </div>
      <p className="read-the-docs">
        Click the button to fetch a new cat fact using TanStack Query
      </p>
    </>
  )
}

export default App
