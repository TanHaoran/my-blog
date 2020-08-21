const secretKey = require('./secretConfig');
const moment = require('moment')

module.exports = {
    '@vuepress/back-to-top': true,
    '@vuepress/google-analytics': {
        'ga': secretKey.googleAnalyticsGa
    },
    '@vuepress/medium-zoom': true,
    '@vuepress/last-updated': {
        transformer: (timestamp) => {
            moment.locale('zh-CN');
            return moment(timestamp).format('YYYY-MM-DD HH:mm:ss') + '（' + moment(timestamp).fromNow() + '）';
        }
    }
};