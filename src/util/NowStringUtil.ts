

export class NowStringUtil{

    public static isStringEmpty(value: string | null | undefined) : boolean {
        return !(value !== undefined && value !== null && value !== "" && (value + "").trim() !== "");
    }
}