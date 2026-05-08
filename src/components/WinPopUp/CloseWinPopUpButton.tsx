import "./CloseWinPopUpButton.scss";

type CloseWinPopUpButtonProps = {
  onClick: () => void;
};

function CloseWinPopUpButton({ onClick }: CloseWinPopUpButtonProps) {
  return (
    <button
      aria-label="Close win popup"
      className="close-win-popup-button"
      type="button"
      onClick={onClick}
    >
      <span aria-hidden="true">x</span>
    </button>
  );
}

export default CloseWinPopUpButton;
