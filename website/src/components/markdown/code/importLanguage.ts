import type { HLJSApi, LanguageDetail } from "highlight.js";
import hljs from "highlight.js/lib/core";
import { getLanguageFromAlias } from "./getLanguageFromAlias";

const importRawLanguage = async () =>
    import(`highlight.js/lib/languages/1c`).then(
        module => module.default as (hljs?: HLJSApi) => LanguageDetail
    );

export const importLanguage = async (alias: string) => {
    const language = getLanguageFromAlias(alias);
    if (!language) return;

    console.log(language);

    if (language.dependencies) {
        await Promise.all(
            language.dependencies.map(async dependency => {
                await importLanguage(dependency);
            })
        );
    }

    hljs.registerLanguage(language.name, await importRawLanguage());

    if (typeof window !== "undefined") {
        console.log("Registered highlight.js language:", language.name);
    }
};
