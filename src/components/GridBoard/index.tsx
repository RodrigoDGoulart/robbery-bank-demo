import JackpotButtons from "../JackpotButtons";
import "./GridBoard.scss";

const staticImagePath = "/static_images";

type GridBoardProps = {
  onLeftGreenClick: () => void;
  onRedClick: () => void;
  onRightGreenClick: () => void;
};

function GridBoard({
  onLeftGreenClick,
  onRedClick,
  onRightGreenClick,
}: GridBoardProps) {
  return (
    <div className="game-board-container">
      <img
        className="grid-board"
        src={`${staticImagePath}/grid-board.png`}
        alt="Jackpot grid board"
      />

      <JackpotButtons
        onLeftGreenClick={onLeftGreenClick}
        onRedClick={onRedClick}
        onRightGreenClick={onRightGreenClick}
      />
    </div>
  );
}

export default GridBoard;
