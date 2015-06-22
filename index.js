var recursive = require('recursive-readdir'),
    tasks = require('./tasks'),
    kgo = require('kgo');

function compareDirectories(masterDir, compareDir, excludes, callback) {
    kgo
    ('master', recursive.bind(null, masterDir))
    ('compare', recursive.bind(null, compareDir))
    ('cleanMaster', ['master'], tasks.cleaner(masterDir, excludes))
    ('cleanCompare', ['compare'], tasks.cleaner(compareDir, excludes))
    ('mVc', ['cleanMaster', 'cleanCompare'], tasks.masterVsCompare)
    (['mVc'], function(mVc) {
        callback(null, mVc);
    })
    .on('error', function(error) {
        callback(error);
    });
}
module.exports = compareDirectories;