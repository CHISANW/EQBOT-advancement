export function checkIsJson (value: any): boolean {
    try {
        JSON.parse(value);
        return true;
    } catch (error) {
        return false;
    }
}
