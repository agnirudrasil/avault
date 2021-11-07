import { useContext } from "react";
import { WebsocketContext } from "../contexts/WebsocketProvider";

export const useSocket = () => useContext(WebsocketContext);
