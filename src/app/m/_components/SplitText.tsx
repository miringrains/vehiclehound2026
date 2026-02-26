"use client";

import { motion } from "framer-motion";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

export function SplitText({
  text,
  className = "",
  delay = 0,
  as: Tag = "h1",
}: SplitTextProps) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04, delayChildren: delay } },
        }}
        aria-label={text}
      >
        {words.map((word, wi) => (
          <span key={wi} className="inline-block whitespace-pre">
            {word.split("").map((char, ci) => (
              <motion.span
                key={`${wi}-${ci}`}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                {char}
              </motion.span>
            ))}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
