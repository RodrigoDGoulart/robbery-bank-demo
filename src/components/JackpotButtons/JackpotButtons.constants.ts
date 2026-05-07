const staticImagePath = "/static_images";

export const buttonAdjustments = {
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

export const buttonImages = {
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
