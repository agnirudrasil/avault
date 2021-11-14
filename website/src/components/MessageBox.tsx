import { Paper, IconButton, Divider } from "@mui/material";
import { AddCircle, EmojiEmotions, Send } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { MessageField } from "./CustomTextField";
import { useQueryClient } from "react-query";

export const MessageBox: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const channels = (
        queryClient.getQueryData(["guild", router.query.server_id]) as any
    ).guild.channels;
    const [currentChannel, setCurrentChannel] = useState<any>("");

    useEffect(() => {
        setCurrentChannel(
            channels.find((v: any) => v.id === router.query.channel)!
        );
    }, [channels, router]);

    return (
        <Formik
            initialValues={{
                content: "",
            }}
            onSubmit={({ content }, { setSubmitting, setValues }) => {
                content = content.trim();
                if (!content) return;
                setValues({ content: "" });
                setSubmitting(false);
            }}
        >
            {({ submitForm }) => (
                <Form
                    onKeyDown={e => {
                        if (e.key === "Enter" && e.shiftKey === false) {
                            submitForm();
                        }
                    }}
                    style={{ width: "100%" }}
                >
                    <Paper
                        component="div"
                        sx={{
                            p: "2px 4px",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            marginTop: "2rem",
                            position: "sticky",
                            left: "0",
                            bottom: "0",
                        }}
                    >
                        <IconButton sx={{ p: "10px" }} aria-label="menu">
                            <AddCircle />
                        </IconButton>
                        <Field
                            component={MessageField}
                            name="content"
                            type="text"
                            placeholder={`Message #${currentChannel.name}`}
                        />
                        <IconButton
                            type="submit"
                            sx={{ p: "10px" }}
                            aria-label="search"
                        >
                            <EmojiEmotions />
                        </IconButton>
                        <Divider
                            sx={{ height: 28, m: 0.5 }}
                            orientation="vertical"
                        />
                        <IconButton
                            color="primary"
                            sx={{ p: "10px" }}
                            aria-label="directions"
                            type="submit"
                        >
                            <Send />
                        </IconButton>
                    </Paper>
                </Form>
            )}
        </Formik>
    );
};
