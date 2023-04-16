import React from "react";

interface SpacerProps {
  size: number;
  axis?: "horizontal" | "vertical";
  style?: React.CSSProperties;
}

const Spacer: React.FC<SpacerProps> = ({
  size,
  axis,
  style = {},
  ...delegated
}) => {
  const width = axis === "vertical" ? 1 : size;
  const height = axis === "horizontal" ? 1 : size;
  return (
    <span
      style={{
        display: "block",
        width,
        minWidth: width,
        height,
        minHeight: height,
        ...style,
      }}
      {...delegated}
    />
  );
};

export default Spacer;
