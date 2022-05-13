import { deserializeSyntaxTree } from "../src/components/markdown/parsers/parseMessageContent";
import { deserialize } from "../src/components/message-container/message-box/editor/deserialize";

export const Test = () => {
    console.log(
        deserialize(
            deserializeSyntaxTree(`Hello world <@12345646> :+1: **bold**
	> Hey There
	> Hello World
	Is This Nice?
	`)
        )
    );
    return <button>Try</button>;
};

export default Test;
