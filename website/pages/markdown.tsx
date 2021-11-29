import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(
    () => import("../src/components/MarkdownEditor"),
    {
        ssr: false,
    }
);

export default () => <DynamicComponentWithNoSSR />;
