import { NextPage } from "next";
import { useGetApplication } from "../../../../hooks/requests/useGetApplication";
import { ApplicationLayout } from "../../../../src/components/layouts/ApplicationLayout";

export const ApplicationOAuth2Page: NextPage<{ id: string }> = ({ id }) => {
    const { data } = useGetApplication(id);
    return (
        <ApplicationLayout id={id}>
            <pre>{JSON.stringify(data || {}, null, 4)}</pre>
        </ApplicationLayout>
    );
};

ApplicationOAuth2Page.getInitialProps = async ({ query }) => {
    return {
        id: query.id as string,
    };
};

export default ApplicationOAuth2Page;
