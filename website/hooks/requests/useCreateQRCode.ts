import { toDataURL } from "qrcode";
import { useMutation } from "react-query";

interface Data {
    secret: string;
    email: string;
    scale?: number;
}

export const createQRCode = ({ email, secret, scale = 6 }: Data) => {
    return toDataURL(
        `otpauth://totp/AVAULT:${encodeURIComponent(
            email
        )}?secret=${secret}&issuer=AVAULT`,
        {
            margin: 1,
            scale,
        }
    );
};

export const useCreateQRCode = () => useMutation(createQRCode);
