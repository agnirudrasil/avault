import { NextPage } from "next";
import { MeLayout } from "../../../src/components/layouts/MeLayout";
import { MessageContainer } from "../../../src/components/message-container";

const MyPrivateChannelsPage: NextPage = () => {
    return (
        <MeLayout>
            <MessageContainer />
        </MeLayout>
    );
};

export default MyPrivateChannelsPage;
