import { useQueryStates } from "nuqs"
import { shortUrlParams } from "../params"

export const useShortUrlParams = () => {
    return useQueryStates(shortUrlParams)
}
