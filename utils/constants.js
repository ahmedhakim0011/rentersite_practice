exports.STATUS_CODE = Object.freeze({
    OK: 200,
    CREATED: 201,
    BAD_REQUEST : 400,
    UNAUTHORIZED: 401,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,



});


exports.ROLES = Object.freeze({
    ADMIN  : 'admin',
    OWNER: "tenant",
    TENANT: "owner"
})