import Prism from "prismjs";

(Prism.languages.markdown = Prism.languages.extend("markup", {})),
    Prism.languages.insertBefore("markdown", "prolog", {
        blockquote: {pattern: /^>(?:[\t ]*>)*/m, alias: "punctuation"},
        code: [
            {pattern: /^(?: {4}|\t).+/m, alias: "keyword"},
            {pattern: /``.+?``|`[^`\n]+`/, alias: "keyword"},
        ],
        title: [
            {
                pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
                alias: "important",
                inside: {punctuation: /==+$|--+$/},
            },
            {
                pattern: /(^\s*)#+.+/m,
                lookbehind: !0,
                alias: "important",
                inside: {punctuation: /^#+|#+$/},
            },
        ],
        hr: {
            pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
            lookbehind: !0,
            alias: "punctuation",
        },
        list: {
            pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
            lookbehind: !0,
            alias: "punctuation",
        },
        "url-reference": {
            pattern:
                /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
            inside: {
                variable: {pattern: /^(!?\[)[^\]]+/, lookbehind: !0},
                string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
                punctuation: /^[\[\]!:]|[<>]/,
            },
            alias: "url",
        },
        strong: {
            pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
            lookbehind: !0,
            inside: {punctuation: /^\*\*|^__|\*\*$|__$/},
        },
        del: {
            pattern: /(^|[^\\])(~~)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
            lookbehind: !0,
            inside: {punctuation: /^~~|~~$/},
        },
        spoiler: {
            pattern: /(^|[^\\])(\|\|)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
            lookbehind: !0,
            inside: {punctuation: /^\|\||\|\|$/},
        },
        em: {
            pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
            lookbehind: !0,
            inside: {punctuation: /^[*_]|[*_]$/},
        },
        url: {
            pattern:
                /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
            inside: {
                variable: {pattern: /(!?\[)[^\]]+(?=\]$)/, lookbehind: !0},
                string: {pattern: /"(?:\\.|[^"\\])*"(?=\)$)/},
            },
        },
    }),
    ((Prism.languages.markdown.strong as any).inside.url = Prism.util.clone(
        Prism.languages.markdown.url
    )),
    ((Prism.languages.markdown.em as any).inside.url = Prism.util.clone(
        Prism.languages.markdown.url
    )),
    ((Prism.languages.markdown.strong as any).inside.em = Prism.util.clone(
        Prism.languages.markdown.em
    )),
    ((Prism.languages.markdown.em as any).inside.strong = Prism.util.clone(
        Prism.languages.markdown.strong
    ));
