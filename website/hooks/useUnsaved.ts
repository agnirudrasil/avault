import { useEffect, useState } from "react";

export const useUnsaved = <T>(data: T) => {
    const [ogData, setOgdata] = useState<T>({} as T);
    const [unsaved, setUnsaved] = useState(false);

    useEffect(() => {
        if (JSON.stringify(ogData) === JSON.stringify(data)) {
            setUnsaved(false);
        } else {
            if (!unsaved) {
                setUnsaved(true);
            }
        }
    }, [ogData, data]);

    useEffect(() => {
        setOgdata(data);
    }, [data]);

    const handleReset = () => setOgdata(data);

    return { unsaved, handleReset, ogData, setOgdata };
};
