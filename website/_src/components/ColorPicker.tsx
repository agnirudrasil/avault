import styled from "@emotion/styled";
import { Check, Colorize } from "@mui/icons-material";

const TOP_COLORS = [
    1752220, 3066993, 3447003, 10181046, 15277667, 15844367, 15105570, 15158332,
    9807270, 9807270,
];

const BOTTOM_COLORS = [
    1146986, 2067276, 2123412, 7419530, 11342935, 12745742, 11027200, 10038562,
    6323595, 9936031,
];

const BigButton = styled.button<{ color: string }>`
    border: 1px solid #ccc;
    background-color: ${props => props.color};
    border-radius: 5px;
    width: calc(40px + 2rem);
    cursor: pointer;
    height: calc(40px + 0.7rem);
    margin: 0.35rem;
`;

const SmallButton = styled.button<{ color: string }>`
    border: none;
    background-color: ${props => props.color};
    cursor: pointer;
    border-radius: 5px;
    width: 20px;
    height: 20px;
    margin: 0.35rem;
`;

export const ColorPicker: React.FC<{
    value: number;
    onChange: (value: number) => any;
}> = ({ value, onChange }) => {
    return (
        <div style={{ display: "flex", width: "100%", flexDirection: "row" }}>
            <BigButton onClick={() => onChange(0)} color={`#fff`}>
                {value === 0 && <Check />}
            </BigButton>
            <label style={{ position: "relative" }}>
                <input
                    style={{
                        opacity: 0,
                        display: "block",
                        width: "100%",
                        height: "100%",
                        border: "none",
                        position: "absolute",
                    }}
                    type={"color"}
                    value={`#${value?.toString(16)}`}
                    onChange={e => {
                        onChange(parseInt(e.target.value.substring(1), 16));
                    }}
                />
                <BigButton color={`#${value?.toString(16)}`}>
                    <Colorize />
                </BigButton>
            </label>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div>
                    {TOP_COLORS.map(color => (
                        <SmallButton
                            key={color}
                            color={`#${color.toString(16)}`}
                            onClick={() => onChange(color)}
                        ></SmallButton>
                    ))}
                </div>
                <div>
                    {BOTTOM_COLORS.map(color => (
                        <SmallButton
                            key={color}
                            color={`#${color.toString(16)}`}
                            onClick={() => onChange(color)}
                        ></SmallButton>
                    ))}
                </div>
            </div>
        </div>
    );
};
