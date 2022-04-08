export const AVAULT_EPOCH = 1627257600;
export const snowflakeTimestamp = (snowflake: string) => {
    return new Date(Number(BigInt(snowflake) >> BigInt(22)) + AVAULT_EPOCH);
};
