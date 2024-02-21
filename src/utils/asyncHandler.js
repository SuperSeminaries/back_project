
export const asyncHandler = (fu) => (req, res, next) => {
    return Promise.resolve (fu(req, res, next))
    .catch((error) => {
        next(error)
    })
}