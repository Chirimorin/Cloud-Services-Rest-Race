/*

 */

var express = require('express');
var router = express();
var handleError;
var User;

/* GET users listing. */
function getUsers(req, res, next) {
    User.find({}, function (err, users) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            res.status(200);
            res.json(users);
        }
    });
}

function setNickname(req, res, next) {
    var user = req.user;
    user.nickname = (req.body.nickname != "" ? req.body.nickname : null);

    user.save(function (err, user) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            res.status(200);
            res.json({status: 200, message: "Nickname succesvol aangepast."});
        }
    });
}

function setUserNickname(req, res, next) {
    User.findByIdAndUpdate(req.params.id, {$set: {nickname: req.body.nickname}}, function (err, user) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            res.status(200);
            res.json({status: 200, message: "Nickname succesvol aangepast."});
        }
    });
}

function addUserRole(req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!user) {
                res.status(404);
                res.json({status: 404, message: "Gebruiker niet gevonden."});
            } else {
                if (user.roles.indexOf(req.body.role) == -1) {
                    user.roles.push(req.body.role);
                    user.save(function (err, user) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json({status: 200, message: "Gebruikersrol successvol toegevoegd."});
            }
        }
    });
}

function deleteUserRole(req, res, next) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!user) {
                res.status(404);
                res.json({status: 404, message: "Gebruiker niet gevonden."});
            } else {
                var roleIndex = user.roles.indexOf(req.body.role)
                if (roleIndex != -1) {
                    user.roles.splice(roleIndex, 1);
                    user.save(function (err, user) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json({status: 200, message: "Gebruikersrol successvol verwijderd."});
            }
        }
    });
}

module.exports = function (mongoose, passport, role, errCallback) {
    console.log("Loading users route...");

    User = mongoose.model('User');
    handleError = errCallback;

    router.route('/')
        .get(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), role.can('view user list'), getUsers);

    router.route('/nickname')
        .put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), setNickname);

    router.route('/:id/nickname')
        .put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), role.can('edit users'), setUserNickname);

    router.route('/:id/roles')
        .post(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), role.can('edit users'), addUserRole)
        .delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), role.can('edit users'), deleteUserRole);

    return router;
};
