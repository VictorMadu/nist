import { Duplex } from "stream";

export const endSocket = (socket: Duplex, errMsg = "HTTP/1.1 500 Error\r\n\r\n") => {
    socket.write(errMsg);
    socket.destroy();
};
