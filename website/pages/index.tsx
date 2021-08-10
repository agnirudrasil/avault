import { Button } from "@material-ui/core";
import { NextPage } from "next";
import React from "react";
import { MessagesContainer } from "../components/message/MessagesContainer";
import { ChatSelection } from "../components/sidebar/ChatSelection";
import { Sidebar } from "../components/sidebar/Sidebar";
import { Container } from "../styles/util-components";

const Home: NextPage = () => {
    return (
        <Container>
            <Sidebar />
            <ChatSelection />
            <MessagesContainer />
        </Container>
    );
};

export default Home;
