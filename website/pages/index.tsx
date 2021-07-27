import { motion } from "framer-motion";
import { useState } from "react";
import { OpenButton } from "../components/OpenButton";
import styles from "../styles/Home.module.css";

export default function Home() {
    return (
        <div className={styles.container}>
            <motion.svg
                width="469"
                height="469"
                viewBox="0 0 469 469"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{
                    rotate: 0,
                }}
                animate={{
                    rotate: 180,
                }}
                transition={{
                    type: "spring",
                    duration: 1,
                }}
            >
                <motion.path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M69 165.052L0 234.052L69 303.052V399.052H165L234.052 468.105L303.105 399.052H400V302.157L468.105 234.052L400 165.948V68.0524H302.105L234.052 0L166 68.0524H69V165.052ZM234.5 358C302.707 358 358 302.707 358 234.5C358 166.293 302.707 111 234.5 111C166.293 111 111 166.293 111 234.5C111 302.707 166.293 358 234.5 358Z"
                    fill="rgb(0, 0, 0)"
                />
            </motion.svg>
        </div>
    );
}
