import './App.scss'
import JackpotButtons from './components/JackpotButtons'

const staticImagePath = '/static_images'

function App() {
  const handleLeftGreenButton = () => {}
  const handleRedButton = () => {}
  const handleRightGreenButton = () => {}

  return (
    <div className="app-shell">
      <div className="game-board-container">
        <img
          className="grid-board"
          src={`${staticImagePath}/grid-board.png`}
          alt="Jackpot grid board"
        />
        
        <JackpotButtons
          onLeftGreenClick={handleLeftGreenButton}
          onRedClick={handleRedButton}
          onRightGreenClick={handleRightGreenButton}
        />
      </div>
    </div>
  )
}

export default App
