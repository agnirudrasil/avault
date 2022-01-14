import { useEffect, useState } from "react";
import isEqual from "lodash.isequal";

export const useUnsaved = <T>(data: T) => {
    const [ogData, setOgdata] = useState<T>({} as T);
    const [unsaved, setUnsaved] = useState(false);

    useEffect(() => {
        if (isEqual(data, ogData)) {
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
