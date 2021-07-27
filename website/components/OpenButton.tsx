import { motion } from "framer-motion";
import { useState } from "react";

const rotate = {
    open: {
        rotate: 90,
    },
    closed: {
        rotate: 0,
    },
};

const pathLength = {
    open: {
        pathLength: 0.5,
    },
    closed: {
        pathLength: 1,
    },
};

export const OpenButton: React.FC<
    React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
> = ({ onClick, ...props }) => {
    const [isOpen, toggleOpen] = useState(false);
    return (
        <button
            onClick={e => {
                toggleOpen(prevOpen => !prevOpen);
                onClick && onClick(e);
            }}
            {...props}
        >
            <motion.svg
                width="205"
                height="205"
                viewBox="0 0 205 205"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                variants={rotate}
                animate={isOpen ? "closed" : "open"}
            >
                <motion.path
                    d="M6 199.222L199.04 6.18167"
                    stroke="black"
                    strokeWidth="11"
                    strokeLinecap="round"
                    variants={pathLength}
                    animate={isOpen ? "closed" : "open"}
                />
                <motion.path
                    d="M6 6L199.222 199.222"
                    stroke="black"
                    strokeWidth="11"
                    strokeLinecap="round"
                    variants={pathLength}
                    animate={isOpen ? "closed" : "open"}
                />
            </motion.svg>
        </button>
    );
};
