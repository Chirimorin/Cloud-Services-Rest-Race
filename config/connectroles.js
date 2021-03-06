/**
 * Created by Thomas on 30-3-2015.
 */

var ConnectRoles = require('connect-roles');

module.exports = function(){
    /* istanbul ignore next  */
    var roles = new ConnectRoles({
        failureHandler: function (req, res, action) {
            res.statusCode = 403;
            res.json( { StatusCode: 403, message: "Access denied" });
            // res.render('access-denied', {action: action});
        }
    });

    // Admins can do everything
    /* istanbul ignore next  */
    roles.use(function (req) {
        if (req.user.hasAnyRole('admin')) {
            return true;
        }
    });

    return roles;
};
