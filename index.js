var recursive = require('recursive-readdir'),
    tasks = require('./tasks'),
    kgo = require('kgo');

function compareDirs(masterDir, compareDir, excludes, callback) {
    var hasErrored = false;
    kgo
    ('master', recursive.bind(null, masterDir))
    ('compare', recursive.bind(null, compareDir))
    ('cleanMaster', ['master'], tasks.cleaner(masterDir, excludes))
    ('cleanCompare', ['compare'], tasks.cleaner(compareDir, excludes))
    ('mVc', ['cleanMaster', 'cleanCompare'], tasks.masterVsCompare)
    ('finish', ['mVc'], function(mVc, done) {
        callback(null, mVc);
    })
    .on('error', function(error) {
        if (!hasErrored) {
            callback(error);
            hasErrored = true;
        }
    });
}
module.exports = compareDirs;