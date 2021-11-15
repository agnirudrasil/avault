import { useEffect, useState } from "react";

export const useUnsaved = (data: any) => {
    const [ogData, setOgdata] = useState<any>({});
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
