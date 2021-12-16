import { GifPicker } from "../src/components/GifPicker/GifPicker";

const GifsPage = () => {
    return (
        <GifPicker
            onShare={url => {
                console.log("Shared GIF: ", url);
            }}
        />
    );
};

export default GifsPage;
