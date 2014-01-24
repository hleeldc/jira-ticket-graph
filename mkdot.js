#! /usr/bin/env node

var fs = require('fs');
var child_process = require('child_process');

function make_issue_pipeline() {
    var procs = arguments;
    return function(issue) {
        for (var i=0; i < procs.length; ++i) {
            var proc = procs[i];
            proc(issue);
        }
    }
}

// Extract relations such as
//
//    issue1 -<relation>-> issue2
//
// where relation is one of
//
//   - has_child
//   - is_blocked_by
//   - project
//
// callback(issue1, issue2, relation)
function relation_extractor(callback) {
    return function(issue) {
        var flag = false; // whether it has a parent

        if (issue.fields.parent) {
            flag = true;
            callback(issue.fields.parent.key, issue.key, 'has_child');
        }

        if (issue.fields.issuelinks) {
            issue.fields.issuelinks.forEach(function(link) {
                if (link.outwardIssue && link.type.outward == 'is part of') {
                    callback(link.outwardIssue.key, issue.key, 'has_child');
                    flag = true;
                }
                if (link.outwardIssue && link.type.outward == 'blocks') {
                    callback(link.outwardIssue.key, issue.key, 'is_blocked_by');
                }
            });
        }

        if (!flag) {
            callback(issue.fields.project.key, issue.key, 'project');
        }
    }    
}

function f(issue1, issue2, relation) {
    if (!forward.hasOwnProperty(relation)) {
        forward[relation] = {};
    }
    if (!forward[relation].hasOwnProperty(issue1)) {
        forward[relation][issue1] = {};
    }
    forward[relation][issue1][issue2] = 1;

    if (!backward.hasOwnProperty(relation)) {
        backward[relation] = {};
    }
    if (!backward[relation].hasOwnProperty(issue2)) {
        backward[relation][issue2] = {};
    }
    backward[relation][issue2][issue1] = 1;
}

var p = make_issue_pipeline(
    relation_extractor(f)
);

var forward = {};
var backward = {};

fs.readdirSync('issue_db').forEach(function(filename) {
    if (/^file-\d+\.txt$/.test(filename)) {
        var data = fs.readFileSync('issue_db/' + filename);
        JSON.parse(data).issues.forEach(p);
    }
});

function fback(key, h, stream, rel, color) {
    var stack = [key];
    while (stack.length > 0) {
        var a = stack.pop();
        if (rel in backward && a in backward[rel]) {
            for (var b in backward[rel][a]) {
                var k = b + ' ' + a + ' ' + rel;
                if (!(k in h)) {
                    stack.push(b);
                    stream.write('"' + b + '" -> "' + a + '" [color=' + color + '];');
                    h[k] = 1;
                }
            }
        }
    }
}

/**
@param {object} h A hash table whose keys are a string combining
  ticket1, ticket2 and relation.
@param {Stream} stream An output stream to write the dot notation to.
*/
function make_forward_func(stack, h, stream) {
    return function(rel, color) {
        while (stack.length > 0) {
            var a = stack.pop();
            fback(a, h, stream, "is_blocked_by", "blue");
            fback(a, h, stream, "has_child", "black");
            ["is_blocked_by", "has_child"].forEach(function(rel) {
            if (rel in forward && a in forward[rel]) {
                for (var b in forward[rel][a]) {
                    var k = a + ' ' + b + ' ' + rel;
                    if (!(k in h)) {
                        stack.push(b);
                        stream.write('"' + a + '" -> "' + b + '" [color=' + color + '];');
                        h[k] = 1;
                    }
                }
            }
        });
        }
    }
}

/**
Generates a issue graph centered at the issue whose key is `key`. Passes the
generated graph using `callback`.

@param {String} key JIRA issue key.
@param {Function} callback Function with single string argument which is a
  fragment of an svg drawing. Called multiple times until the whole drawing
  is transferred.
**/
exports.make_graph = function(key, callback) {
    var dot = child_process.spawn('dot', ['-Tsvg']);

    dot.stdout.setEncoding('UTF-8');

    dot.stdout.on('data', callback);
    dot.stdout.on('end', callback);

    dot.stdin.write('digraph g {');
    dot.stdin.write('rankdir=LR;');
    dot.stdin.write('node [shape=plaintext];');
    dot.stdin.write('ranksep=2;');

    var stack = [key];
    var h = {};
    var ff = make_forward_func(stack, h, dot.stdin);
    ff('has_child', 'black');

    dot.stdin.write('"' + key + '" [fontcolor=red];');

    stack.push(key);
    h = {};
    ff('is_blocked_by', 'blue');

    dot.stdin.write('}');
    dot.stdin.end();
}
