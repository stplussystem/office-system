"use client";

import { cloneElement, ReactElement, ReactNode, useId } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  children: ReactElement<{
    "aria-describedby"?: string;
  }>;
  position?: TooltipPosition;
  className?: string;
}

const positionStyles: Record<
  TooltipPosition,
  {
    tooltip: string;
    arrow: string;
  }
> = {
  top: {
    tooltip: `
      bottom-full left-1/2 mb-2
      -translate-x-1/2 translate-y-1
      group-hover/tooltip:translate-y-0
      group-focus-within/tooltip:translate-y-0
    `,
    arrow: `
      -bottom-1 left-1/2
      -translate-x-1/2
    `,
  },

  bottom: {
    tooltip: `
      top-full left-1/2 mt-2
      -translate-x-1/2 -translate-y-1
      group-hover/tooltip:translate-y-0
      group-focus-within/tooltip:translate-y-0
    `,
    arrow: `
      -top-1 left-1/2
      -translate-x-1/2
    `,
  },

  left: {
    tooltip: `
      right-full top-1/2 mr-2
      -translate-y-1/2 translate-x-1
      group-hover/tooltip:translate-x-0
      group-focus-within/tooltip:translate-x-0
    `,
    arrow: `
      -right-1 top-1/2
      -translate-y-1/2
    `,
  },

  right: {
    tooltip: `
      left-full top-1/2 ml-2
      -translate-y-1/2 -translate-x-1
      group-hover/tooltip:translate-x-0
      group-focus-within/tooltip:translate-x-0
    `,
    arrow: `
      -left-1 top-1/2
      -translate-y-1/2
    `,
  },
};

export default function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const tooltipId = useId();
  const styles = positionStyles[position];

  return (
    <div className="group/tooltip relative inline-flex">
      {cloneElement(children, {
        "aria-describedby": tooltipId,
      })}

      <div
        id={tooltipId}
        role="tooltip"
        className={`
          pointer-events-none absolute z-50
          whitespace-nowrap rounded-lg
          bg-gray-900 px-3 py-1.5
          text-xs font-medium text-white
          opacity-0 shadow-lg
          scale-95
          transition-all duration-200
          group-hover/tooltip:scale-100
          group-hover/tooltip:opacity-100
          group-focus-within/tooltip:scale-100
          group-focus-within/tooltip:opacity-100
          ${styles.tooltip}
          ${className}
        `}
      >
        {content}

        <span
          className={`
            absolute h-2 w-2
            rotate-45 bg-gray-900
            ${styles.arrow}
          `}
        />
      </div>
    </div>
  );
}
