import type { CSSProperties } from "react";

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
