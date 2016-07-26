var express = require('express');
var app = express();
var request = require('request');
var Xray = require('x-ray');
var x = Xray();

var TARGET_HOST = 'http://seasonvar.ru/';

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('pages/index');
});

app.get('/list', function (req, res) {
    x(TARGET_HOST, '.alf-block', [{
        letter: '.alf-letter span',
        items: x('.betterT', [{
            href: 'a@href',
            title: 'a'
        }])
    }])(function (err, json) {
        if (err) {
            res.status(500).send('Error: ' + err);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(json));
        }
    });
});

app.get('/playlist', function (req, res) {
    var url = req.query.url,
        seasons = [],
        requestList = function (err, response, body) {
            var json = null;

            if (err) {
                res.status(500).send('Error: ' + err);
            } else {
                json = JSON.parse(body);

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    playlist: json,
                    seasons: seasons
                }));
            }
        },
        requestTargetUrl = function (err, response, body) {
            var result = null;

            if (err) {
                res.status(500).send('Error: ' + err);
            } else {
                result = /pl0 = "(.*?)";\n?\r?.+if/g.exec(body);

                if (result) {
                    x(body, '.svtabr_wrap h2', [{
                        href: 'a@href',
                        title: 'a'
                    }])(function (err, json) {
                        if (err) {
                            res.status(500).send('Error: ' + err);
                        } else {
                            seasons = json;

                            request(TARGET_HOST + result[1], requestList);
                        }
                    });
                }
            }
        };

    if (url) {
        request(url, {
            headers: {
                'Cookie': 'html5default=1;'
            }
        }, requestTargetUrl);
    } else {
        res.status(500).send('Error: query parameter "url" must be specified');
    }
});

app.use('/video', function (req, res) {
    var url = req.query.url;

    req.pipe(request(url)).pipe(res);
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


