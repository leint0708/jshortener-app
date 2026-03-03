import { z } from "zod";
import { createParser } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const searchParamsSchema = z.object({
    page: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE),
    pageSize: z.coerce.number().int().positive().default(PAGINATION.DEFAULT_PAGE_SIZE),
    search: z.string().optional().default(""),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const shortUrlParams = {
    page: createParser({
        parse: (value) => searchParamsSchema.shape.page.parse(value),
        serialize: (value) => String(value),
    }).withDefault(PAGINATION.DEFAULT_PAGE).withOptions({ clearOnDefault: true }),

    pageSize: createParser({
        parse: (value) => searchParamsSchema.shape.pageSize.parse(value),
        serialize: (value) => String(value),
    }).withDefault(PAGINATION.DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),

    search: createParser({
        parse: (value) => searchParamsSchema.shape.search.parse(value),
        serialize: (value) => value ?? "",
    }).withDefault("").withOptions({ clearOnDefault: true }),
};
