#missing-files

Nodejs function to compare two directories and return files not found in second directory. Useful
for ensuring that all files have matching test files, however having a file does not mean it's
tested!

##Installation

    npm install missing-files

##Usage
    missingFiles(masterDir, compareDir, excludes, callback)

- masterDir : directory to be compared against (i.e. source)
- compareDir : directory that 'should' match (i.e. tests)
- excludes: array of regex/string to filter results
- callback: function(error, result)

##Usage in a test

    test('ensure that all source files have matching test file', function(t) {
        t.plan(1);

        var sourceDir = path.resolve(__dirname,  '../lib'),
            testDir = path.resolve(__dirname, '.'),
            excludes = [
                /^\myprotectedpath\//,
                /^\/models\//,
                '.DS_Store',
                /(.*).json/
            ];

        missingFiles(sourceDir, testDir, excludes, function(error, result) {
            t.deepEqual(result, [], 'all files are covered');
        });
    });

Pull requests welcome
