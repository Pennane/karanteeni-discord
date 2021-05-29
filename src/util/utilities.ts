export function arrayToChunks<T>(arr: T[], chunkSize: number): Array<T[]> {
    const chunks = []
    while (arr.length > 0) {
        const chunk = arr.splice(0, chunkSize)
        chunks.push(chunk)
    }
    return chunks
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]]
}[keyof T][]

export function entries<T>(obj: T): Entries<T> {
    return Object.entries(obj) as any
}
