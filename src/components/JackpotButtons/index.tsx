import { JackpotButton } from "./JackpotButtons.components";
import { buttonAdjustments, buttonImages } from "./JackpotButtons.constants";
import "./JackpotButtons.scss";

type JackpotButtonsProps = {
  onLeftGreenClick: () => void;
  onRedClick: () => void;
  onRightGreenClick: () => void;
  redDisabled?: boolean;
};

function JackpotButtons({
  onLeftGreenClick,
  onRedClick,
  onRightGreenClick,
  redDisabled = false,
}: JackpotButtonsProps) {
  return (
    <>
      <JackpotButton
        adjustments={buttonAdjustments.leftGreen}
        ariaLabel="Left green button"
        className="left-green-button"
        images={buttonImages.leftGreen}
        onClick={onLeftGreenClick}
      />
      <JackpotButton
        adjustments={buttonAdjustments.red}
        ariaLabel="Red button"
        className="red-button"
        disabled={redDisabled}
        images={buttonImages.red}
        onClick={onRedClick}
      />
      <JackpotButton
        adjustments={buttonAdjustments.rightGreen}
        ariaLabel="Right green button"
        className="right-green-button"
        images={buttonImages.rightGreen}
        onClick={onRightGreenClick}
      />
    </>
  );
}

export default JackpotButtons;
