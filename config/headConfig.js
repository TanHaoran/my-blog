module.exports = [
    ['link', {rel: 'icon', href: '/avatar.jpg'}],
    [
        "script",
        {},
        `
                var _hmt = _hmt || [];
                (function() {
                    var hm = document.createElement("script");
                    hm.src = "https://hm.baidu.com/hm.js?68e7a949df184c1e4c82b115461e51e0";
                    var s = document.getElementsByTagName("script")[0];
                    s.parentNode.insertBefore(hm, s);
                })();
            `
    ]
];