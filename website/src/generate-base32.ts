const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split("");

export const generateTOTPSecret = () => {
    let secret = "";
    for (let i = 0; i < 32; i++) {
        secret += CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    return secret;
};
