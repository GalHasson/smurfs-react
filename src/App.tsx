import SmurfsTable from './components/SmurfsTable'

function App() {
  return (
    <main className="flex min-h-svh flex-col">
      <header className="px-6 pt-8 text-center">
        <h1 className="m-0 mb-2 text-[2.5rem]">Smurf Directory</h1>
        <p>A registry of every Smurf in the village.</p>
      </header>
      <SmurfsTable />
    </main>
  )
}

export default App
