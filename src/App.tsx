import SmurfsTable from './components/SmurfsTable'
import './App.css'

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1>Smurf Directory</h1>
        <p>A registry of every Smurf in the village.</p>
      </header>
      <SmurfsTable />
    </main>
  )
}

export default App
