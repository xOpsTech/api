exports.index = function(req, res) {
    res.render('index', { title: 'Express' });
};

exports.login = function(req, res) {
    res.render('login', { title: 'Express' });
};

exports.register = function(req, res) {
    res.render('register', { title: 'Express' });
};

exports.notallowed = function(req, res) {
    res.render('notallowed', { title: 'Express' });
};

exports.game = function(req, res) {
    res.render('game', { title: 'Express' });
};
