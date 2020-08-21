const util = {
    generateSidebar: function (title, children = [], collapsable = false, sidebarDepth = 2) {
        return {
            title,
            collapsable,
            sidebarDepth,
            children
        }
    }
};

module.exports = util;