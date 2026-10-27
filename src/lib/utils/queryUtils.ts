export type GraphQLRequest = {
    query: string;
    variables?: Record<string, unknown>;
};

export const processGraphQLQuery = (query: string): string => {
    return query
        .replace(/#[^\n]*/g, "") // Remove GraphQL comments first
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\\/g, "") // Remove backslashes
        .trim(); // Remove leading/trailing whitespace
};
