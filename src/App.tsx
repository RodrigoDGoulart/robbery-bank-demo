import './App.scss'
import GridBoard from './components/GridBoard'

function App() {
  const handleLeftGreenButton = () => {}
  const handleRedButton = () => {}
  const handleRightGreenButton = () => {}

  return (
    <div className="app-shell">
      <GridBoard
        onLeftGreenClick={handleLeftGreenButton}
        onRedClick={handleRedButton}
        onRightGreenClick={handleRightGreenButton}
      />
    </div>
  )
}

export default App
