import { useState, useEffect } from "react";

export const useCopy = () => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
    };
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => {
                setCopied(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [copied]);
    return { copied, copyToClipboard };
};
