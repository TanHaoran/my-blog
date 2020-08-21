<template>
    <div>
        <span :id="id" class="leancloud_visitors read-count" :data-flag-title="title">
            <em class="post-meta-item-text">阅读量 </em>
            <i class="leancloud-visitors-count">loading</i>
        </span>
        <div class="clear-both"></div>
    </div>
</template>

<script>
    export default {
        props: ['path', 'name'],
        data() {
            return {
                id: '/' + this.path + '/' + this.name + '.html',
                title: this.name
            }
        }
    }
</script>