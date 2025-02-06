import { LayoutBlock } from "yogurt-layout";

export type DebugLayoutProps = {
  layout: Record<string, LayoutBlock>;
};

export const DebugLayout = ({ layout }: DebugLayoutProps) => {
  // const debug = false;

  // if (!debug) return null;
  return (
    <>
      {Object.entries(layout).map(([id, block]) => (
        <g key={id}>
          <rect
            x={block.left}
            y={block.top}
            width={block.width}
            height={block.height}
            fill="none"
            stroke="red"
            strokeWidth={1}
          />
          <text
            x={block.left}
            y={block.top + 8}
            fill="white"
            fontSize={10}
            strokeWidth={2}
            stroke="white"
            textAnchor="start"
          >
            {id}
          </text>
          <text
            x={block.left}
            y={block.top + 8}
            fill="red"
            fontSize={10}
            textAnchor="start"
          >
            {id}
          </text>
        </g>
      ))}
    </>
  );
};
