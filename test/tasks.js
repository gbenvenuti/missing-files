var test = require('grape'),
    mockery = require('mockery'),
    pathToObjectUnderTest = '../tasks';

mockery.registerAllowables([pathToObjectUnderTest]);

function resetMocks() {
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

test('tasks Exists', function (t) {
    t.plan(5);
    var tasks = getCleanTestObject();
    t.ok(tasks, 'tasks Exists');
    t.equal(typeof tasks, 'object',  'tasks is an object');
    t.equal(typeof tasks.filterExcludes, 'function',  'tasks.filterExcludes is a function');
    t.equal(typeof tasks.masterVsCompare, 'function',  'tasks.masterVsCompare is a function');
    t.equal(typeof tasks.cleaner, 'function',  'tasks.cleaner is a function');
});

test('tasks.filterExcludes excludes', function (t) {
    var input = [
            ['/my/path', true],
            ['my/other/path', true],
            ['food.js', false],
            ['myfile.json', false]
        ],
        excludes = ['food.js', /.*.json/i],
        filterExcludes = getCleanTestObject().filterExcludes.bind(null, excludes);

    t.plan(input.length);

    input.forEach(function(item) {
        t.equal(filterExcludes(item[0]), item[1], 'expected result');
    });
});

test('tasks.masterVsCompare returns missing', function (t) {
    t.plan(1);
    var master = [
            '/index.js',
            '/lib/index.js',
            '/lib/files/a.js',
            '/lib/files/b.js',
            '/lib/files/c.js'
        ],
        compare = [
            '/index.js',
            '/lib/files/a.js',
            '/lib/files/c.js'
        ],
        expected = [
            '/lib/index.js',
            '/lib/files/b.js'
        ],
        masterVsCompare = getCleanTestObject().masterVsCompare;

    masterVsCompare(master, compare, function(error, success) {
        t.deepEqual(success, expected, 'result as expected');
    });
});

test('tasks.cleaner cleans', function (t) {
    t.plan(1);
    var directory = '/myfiles',
        fileList = [
            '/myfiles/index.js',
            '/myfiles/lib/index.js',
            '/myfiles/lib/files/a.js',
            '/myfiles/lib/files/b.js',
            '/myfiles/lib/files/c.js'
        ],
        expected = [
            '/index.js',
            '/lib/index.js',
            '/lib/files/a.js',
            '/lib/files/b.js',
            '/lib/files/c.js'
        ],
        cleaner = getCleanTestObject().cleaner;

    cleaner(directory, [])(fileList, function(error, success) {
        t.deepEqual(success, expected, 'result as expected');
    });
});