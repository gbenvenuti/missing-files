require('./tasks');

var test = require('grape'),
    mockery = require('mockery'),
    kgo = require('kgo'),
    pathToObjectUnderTest = '../index';

mockery.registerAllowables([pathToObjectUnderTest]);

function resetMocks() {
    mockery.registerMock('./tasks', {});
    mockery.registerMock('kgo', kgo);
    mockery.registerMock('recursive-readdir', function(){});
}

function getCleanTestObject(){
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    mockery.enable({ useCleanCache: true, warnOnReplace: false });
    var objectUnderTest = require(pathToObjectUnderTest);
    mockery.disable();
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
    t.plan(3);

    var missingFiles,
        excludes = ['bad'],
        masterFiles = ['1.txt', '2.txt'],
        compareFiles = ['1.txt', '3.txt'];

    mockery.registerMock('recursive-readdir', function(path, callback) {
        callback(null, path);
    });
    mockery.registerMock('./tasks', {
        masterVsCompare: function(master, compare, callback) {
            t.deepEqual(master, masterFiles, 'master files pass through');
            t.deepEqual(compare, compareFiles, 'compare files pass through');
            callback(null, 'mVc');
        },
        cleaner: function(directory, excludes) {
            return function(data, callback) {
                callback(null, data);
            };
        }
    });

    missingFiles = getCleanTestObject();

    missingFiles(masterFiles, compareFiles, excludes, function(error, result) {
        t.equal(result, 'mVc', 'result passed back');
    });
});

test('missingFiles handles error', function (t) {
    t.plan(1);

    var missingFiles,
        excludes = ['bad'],
        masterFiles = ['1.txt', '2.txt'],
        compareFiles = ['1.txt', '3.txt'];

    mockery.registerMock('recursive-readdir', function(path, callback) {
        callback('error');
    });
    mockery.registerMock('./tasks', {
        masterVsCompare: function() {
        },
        cleaner: function(directory, excludes) {
            return function(data, callback) {
                callback(null, data);
            };
        }
    });

    missingFiles = getCleanTestObject();

    missingFiles(masterFiles, compareFiles, excludes, function(error, result) {
        t.equal(error, 'error', 'error passed back');
    });
});