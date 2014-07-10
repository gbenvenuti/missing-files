function filterExcludes(excludes, item) {
    for (var key in excludes) {
        if (item.search(excludes[key]) !== -1) {
            return false;
        }
    }
    return true;
}

function masterVsCompare(master, compare, callback) {
    function filterCompare(file) {
        return compare.indexOf(file) === -1;
    }
    callback(null, master.filter(filterCompare));
}

function cleaner(directory, excludes) {
    return function(data, callback) {
        var newData = data.filter(filterExcludes.bind(null, excludes));
        callback(null, stripDir(directory, newData));
    };
}

function stripDir(dir, data) {
    var newData = [];

    for (var key in data) {
        newData.push(data[key].replace(dir, ''));
    }
    return newData;
}

module.exports = {
    filterExcludes: filterExcludes,
    masterVsCompare: masterVsCompare,
    cleaner: cleaner
};