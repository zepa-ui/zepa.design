"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

interface TextScrambleProps {
  text: string;
  className?: string;
}

export default function TextScramble({ text, className = "" }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  const scramble = useCallback(() => {
    setIsScrambling(true);
    frameRef.current = 0;

    const duration = text.length * 3;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      frameRef.current++;

      const progress = frameRef.current / duration;
      const revealedLength = Math.floor(progress * text.length);

      const newText = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedLength) return text[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(newText);

      if (frameRef.current >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, 30);
  }, [text]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    scramble();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={`group relative inline-flex flex-col cursor-pointer select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative font-mono text-[13px] tracking-[0.08em] uppercase">
        {displayText.split("").map((char, i) => (
          <span
            key={i}
            className={`inline-block transition-all duration-150 ${
              isScrambling && char !== text[i]
                ? "text-[#143f42] scale-110"
                : "text-[#143f42]"
            }`}
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* underline */}
      <span className="relative h-px w-full mt-1 overflow-hidden">
        <span
          className={`absolute inset-0 bg-[#143f42] transition-transform duration-300 origin-left ${
            isHovering ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </span>
    </div>
  );
}