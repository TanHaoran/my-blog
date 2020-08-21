const guide = require('./guide/index');
const backend = require('./backend/index');
const enjoy3 = require('./enjoy3/index');
const frontend = require('./frontend/index');
const structure = require('./structure/index');
const algorithm = require('./algorithm/index');
const leetcode = require('./leetcode/index');
const principle = require('./principle/index');
const pattern = require('./pattern/index');
const project = require('./project/index');
const article = require('./article/index');
const thinkingInJava = require('./thinking_in_java/index');
const refactoringImprovingTheDesignOfExistingCode = require('./refactoring_improving_the_design_of_existing_code/index');

module.exports = {
    '/guide/': guide,
    '/backend/': backend,
    '/enjoy3/': enjoy3,
    '/frontend/': frontend,
    '/structure/': structure,
    '/algorithm/': algorithm,
    '/leetcode/': leetcode,
    '/principle/': principle,
    '/pattern/': pattern,
    '/project/': project,
    '/article/': article,
    '/thinking_in_java/': thinkingInJava,
    '/refactoring_improving_the_design_of_existing_code/': refactoringImprovingTheDesignOfExistingCode,
};