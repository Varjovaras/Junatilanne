import { redirect } from "@tanstack/react-router";

export const toTrainsRedirect = (id: string) => {
    throw redirect({
        to: "/trains/$id",
        params: { id },
        statusCode: 308,
    });
};

export const getTrainsRedirectResponse = (id: string): Response =>
    new Response(null, {
        status: 308,
        headers: {
            Location: `/trains/${id}`,
        },
    });
