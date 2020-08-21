<template>
    <div>
        <br/>
        <div id="vcomments"></div>
    </div>
</template>

<script>
    export default {
        mounted() {
            this.renderValine();
        },
        methods: {
            renderValine() {
                window.AV = require('leancloud-storage');
                const Valine = require('valine');
                const secretKey = require('../../../config/secretConfig');
                new Valine({
                    el: '#vcomments',
                    appId: secretKey.appId,
                    appKey: secretKey.appKey,
                    notify: false,
                    verify: false,
                    avatar: 'wavatar',
                    placeholder: '留下你的足迹吧，填写邮箱方便回复你哦 ^ ^ ',
                    // 控制每个页面加载自己的评论
                    path: window.location.pathname,
                    // 是否显示访问量
                    visitor: true,
                    // 是否记录访问者ip
                    recordIP: true,
                });
            }
        }
    }
</script>