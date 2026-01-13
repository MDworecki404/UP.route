export const fetchJsonFile = async <T>(url: string): Promise<T> => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to fetch JSON file from ${url}: ${response.statusText}`)
    }

    const data: T = await response.json()
    return data
}
