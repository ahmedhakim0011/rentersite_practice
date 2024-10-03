const { findUser } = require("../models/user");
const { STATUS_CODE } = require("../utils/constants");
const { verify } = require("jsonwebtoken");

module.exports = (roles) => {
    return (req, res, next) => {
        const token = req.header('token');
        if (!token) {
            return next({
                statusCode: STATUS_CODE.UNAUTHORIZED,
                message: 'unauthorized request!'
            });



        }
        verify(token, process.env.JWT_SECRET, async function (err, decode) {
            if (err)
                return next(new Error("Invalid Token"))
            else {
                const userObj = await findUser({ _id: decode.id });
                console.log(`user : ${userObj}`);
                if (!userObj) return next(new Error("user not found"));
                if (!userObj.isActive) return next({
                    statusCode: STATUS_CODE.FORBIDDEN,
                    message: 'Your account is deactivated, please contact admin',
                });
                req.user = decode;
                if (!roles.includes(req?.user.role)) return next({
                    data: { status: false },
                    statusCode: STATUS_CODE.UNAUTHORIZED,
                    message: 'Unauthorized access!'
                });
                next();
            }

        });
    }
}