/**
 * Created by Thomas on 30-3-2015.
 */

var ConnectRoles = require('connect-roles');

module.exports = function(){
    var roles = new ConnectRoles({
        failureHandler: function (req, res, action) {
            res.statusCode = 403;
            res.json( { StatusCode: 403, message: "Access denied" });
            // res.render('access-denied', {action: action});
        }
    });

    // Admins can do everything
    roles.use(function (req) {
            if (req.user.hasAnyRole('admin')) {
                console.log("is admin");
                return true;
            }
    });

    return roles;
};
