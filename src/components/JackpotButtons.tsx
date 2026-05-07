import type { CSSProperties } from "react";

const staticImagePath = "/static_images";

const buttonAdjustments = {
  leftGreen: {
    right: "24%",
    bottom: "4.3%",
    width: "8.5%",
    height: "8%",
    normalFrame: {
      imageX: "0%",
      imageY: "0%",
      imageSize: "contain",
    },
    pressedFrame: {
      imageX: "0%",
      imageY: "0%",
      imageSize: "contain",
    },
  },
  red: {
    right: "12%",
    bottom: "2.3%",
    width: "12%",
    height: "15%",
    normalFrame: {
      imageX: "0%",
      imageY: "0%",
      imageSize: "contain",
    },
    pressedFrame: {
      imageX: "0%",
      imageY: "60%",
      imageSize: "contain",
    },
  },
  rightGreen: {
    right: "3.8%",
    bottom: "4.3%",
    width: "8.5%",
    height: "8%",
    normalFrame: {
      imageX: "0%",
      imageY: "0%",
      imageSize: "contain",
    },
    pressedFrame: {
      imageX: "0%",
      imageY: "0%",
      imageSize: "contain",
    },
  },
};

const buttonImages = {
  leftGreen: {
    normal: `${staticImagePath}/left-green-btn-unpressed.png`,
    pressed: `${staticImagePath}/left-green-btn-pressed.png`,
  },
  red: {
    normal: `${staticImagePath}/red-btn-unpressed.png`,
    pressed: `${staticImagePath}/red-btn-pressed.png`,
  },
  rightGreen: {
    normal: `${staticImagePath}/right-green-btn-unpressed.png`,
    pressed: `${staticImagePath}/right-green-btn-pressed.png`,
  },
};

type ButtonFrameAdjustments = {
  imageX: string;
  imageY: string;
  imageSize: string;
};

type ButtonAdjustments = {
  left?: string;
  right?: string;
  bottom: string;
  width: string;
  height: string;
  normalFrame: ButtonFrameAdjustments;
  pressedFrame: ButtonFrameAdjustments;
};

type ButtonImages = {
  normal: string;
  pressed: string;
};

type JackpotButtonProps = {
  adjustments: ButtonAdjustments;
  ariaLabel: string;
  className: string;
  images: ButtonImages;
  onClick: () => void;
};

type JackpotButtonsProps = {
  onLeftGreenClick: () => void;
  onRedClick: () => void;
  onRightGreenClick: () => void;
};

const getButtonStyle = (
  adjustments: ButtonAdjustments,
  images: ButtonImages,
): CSSProperties =>
  ({
    "--button-left": adjustments.left,
    "--button-right": adjustments.right,
    "--button-bottom": adjustments.bottom,
    "--button-width": adjustments.width,
    "--button-height": adjustments.height,
    "--button-normal-image": `url('${images.normal}')`,
    "--button-pressed-image": `url('${images.pressed}')`,
    "--button-normal-image-x": adjustments.normalFrame.imageX,
    "--button-normal-image-y": adjustments.normalFrame.imageY,
    "--button-normal-image-size": adjustments.normalFrame.imageSize,
    "--button-pressed-image-x": adjustments.pressedFrame.imageX,
    "--button-pressed-image-y": adjustments.pressedFrame.imageY,
    "--button-pressed-image-size": adjustments.pressedFrame.imageSize,
  }) as CSSProperties;

export function JackpotButton({
  adjustments,
  ariaLabel,
  className,
  images,
  onClick,
}: JackpotButtonProps) {
  return (
    <button
      className={`game-button ${className}`}
      style={getButtonStyle(adjustments, images)}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
    />
  );
}

function JackpotButtons({
  onLeftGreenClick,
  onRedClick,
  onRightGreenClick,
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
