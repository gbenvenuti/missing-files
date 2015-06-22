require('./tasks');

var test = require('tape'),
    Fraudster = require('fraudster'),
    fraudster = new Fraudster(),
    kgo = require('kgo'),
    pathToObjectUnderTest = '../index';

fraudster.registerAllowables([pathToObjectUnderTest]);

function resetMocks() {
    fraudster.registerMock('./tasks', {});
    fraudster.registerMock('kgo', kgo);
    fraudster.registerMock('recursive-readdir', function(){});
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    fraudster.enable();
    var objectUnderTest = require(pathToObjectUnderTest);
    fraudster.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('missingFiles Exists', function (t) {
    t.plan(2);
    var missingFiles = getCleanTestObject();
    t.ok(missingFiles, 'tasks Exists');
    t.equal(typeof missingFiles, 'function',  'missingFiles is a function');
});

test('missingFiles handles success', function (t) {
    t.plan(4);

    var missingFiles,
        excludes = ['bad'],
        masterFiles = ['1.txt', '2.txt'],
        compareFiles = ['1.txt', '3.txt'];

    fraudster.registerMock('recursive-readdir', function(path, callback) {
        callback(null, path);
    });
    fraudster.registerMock('./tasks', {
        masterVsCompare: function(master, compare, callback) {
            t.deepEqual(master, masterFiles, 'master files pass through');
            t.deepEqual(compare, compareFiles, 'compare files pass through');
            callback(null, 'mVc');
        },
        cleaner: function() {
            return function(data, callback) {
                callback(null, data);
            };
        }
    });

    missingFiles = getCleanTestObject();

    missingFiles(masterFiles, compareFiles, excludes, function(error, result) {
        t.notOk(error, 'no error');
        t.equal(result, 'mVc', 'result passed back');
    });
});

test('missingFiles handles error', function (t) {
    t.plan(2);

    var missingFiles,
        excludes = ['bad'],
        masterFiles = ['1.txt', '2.txt'],
        compareFiles = ['1.txt', '3.txt'];

    fraudster.registerMock('recursive-readdir', function(path, callback) {
        callback('error');
    });
    fraudster.registerMock('./tasks', {
        masterVsCompare: function() {
        },
        cleaner: function() {
            return function(data, callback) {
                callback('error');
            };
        }
    });

    missingFiles = getCleanTestObject();

    missingFiles(masterFiles, compareFiles, excludes, function(error, result) {
        t.equal(error, 'error', 'error passed back');
        t.notOk(result, 'no result');
    });
});