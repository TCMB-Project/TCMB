export function findFirstMatch(array, searchString) {
    let match = array.find(element => element.startsWith(searchString));
    if (match) {
        return array.indexOf(match);
    }
    else {
        return -1;
    }
}
