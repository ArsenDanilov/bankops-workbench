import { useEffect, useRef, useState } from 'react';
import styles from './ReviewQueueTable.module.css';

interface OverflowTooltipTextProps {
  text: string;
}

export const OverflowTooltipText = ({ text }: OverflowTooltipTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  useEffect(() => {
    const textElement = textRef.current;

    if (!textElement) {
      return undefined;
    }

    const updateTruncationState = () => {
      const nextIsTruncated = textElement.scrollWidth > textElement.clientWidth;
      setIsTruncated(nextIsTruncated);

      if (!nextIsTruncated) {
        setIsTooltipVisible(false);
      }
    };

    updateTruncationState();

    const resizeObserver = new ResizeObserver(updateTruncationState);
    resizeObserver.observe(textElement);

    return () => resizeObserver.disconnect();
  }, [text]);

  const showTooltip = () => {
    if (isTruncated) {
      setIsTooltipVisible(true);
    }
  };

  return (
    <span
      className={styles.overflowTooltipText}
      tabIndex={isTruncated ? 0 : undefined}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onFocus={showTooltip}
      onBlur={() => setIsTooltipVisible(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isTooltipVisible) {
          event.stopPropagation();
          setIsTooltipVisible(false);
        }
      }}
    >
      <span className={styles.nameText} ref={textRef}>
        {text}
      </span>
      {isTruncated && isTooltipVisible ? (
        <span className={styles.truncationTooltip} aria-hidden="true">
          {text}
        </span>
      ) : null}
    </span>
  );
};
