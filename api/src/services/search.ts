interface AzureSearchDocument {
    title: string;
    content: string;
}

interface AzureSearchResponse {
    value: AzureSearchDocument[];
}

export async function getSearchContext(message: string): Promise<string> {
    try {
        const url = `${process.env.AZURE_SEARCH_ENDPOINT}/indexes/${process.env.AZURE_SEARCH_INDEX}/docs/search?api-version=2024-07-01`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": process.env.AZURE_SEARCH_KEY!,
            },
            body: JSON.stringify({
                search: message,
                top: parseInt(
                    process.env.AZURE_SEARCH_NUMBER_OF_CHUNKS || "40",
                ),
            }),
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const json = (await response.json()) as AzureSearchResponse;

        const data = json.value || [];

        const contextText = data
            .map(
                (doc: { title: string; content: string }) =>
                    `${doc.title}\n${doc.content}`,
            )
            .join("\n\n");

        return contextText;
    } catch (error) {
        console.log("failed to fetch search context");
        return "ERROR: failed to get search context";
    }
}
