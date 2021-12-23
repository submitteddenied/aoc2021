export function zeroPad(n: number, l: number): string {
    let result = '' + n
    while (result.length < l) {
        result = '0' + result
    }

    return result
}