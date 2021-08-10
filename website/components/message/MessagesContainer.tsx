import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { CustomPaper } from "../../styles/util-components";
import { Message } from "./Message";
import { MessageInput } from "./MessageInput";

const MessagesConatinerStyled = styled.div`
    width: 100%;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 2rem;
`;

const MessagesStyled = styled.div`
    width: calc(100% - 2rem);
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    overflow-y: auto;
    margin: 0 1rem 1.75rem 1rem;
    display: flex;
    flex-direction: column-reverse;
`;

export const MessagesContainer: React.FC = () => {
    const [messages, setMessages] = useState<number[]>([]);
    useEffect(() => {
        const a = setInterval(
            () => setMessages(prevMessage => [...prevMessage, Date.now()]),
            5000
        );
        () => {
            clearInterval(a);
        };
    }, []);
    return (
        <MessagesConatinerStyled>
            <CustomPaper>
                <span># channel</span>
            </CustomPaper>
            <MessagesStyled>
                {messages.map(i => (
                    <Message date={new Date(i).toLocaleString("en-IN")} />
                ))}
            </MessagesStyled>
            <MessageInput />
        </MessagesConatinerStyled>
    );
};
