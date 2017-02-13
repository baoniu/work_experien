<?php
/**
*/
$this->breadcrumbs = array(
'赔偿单列表'=>array('/asset/prototypeMachine/CompensationList'),
'原样赔偿'
);
?>

<div class="container-fluid hpadded" id="vueBox">
    <div class="row-fluid">
        <div class="box" id='mipush'>
            <div class="box-header">
                <span class="title"><?php echo '原样赔偿替换'; ?></span>
                <ul class="box-toolbar offset4">
                    <li>
                        <a href="<?php echo $this->createUrl('/asset/prototypeMachine/CompensationList'); ?>"
                           class="btn btn-green"><?php echo '返回样机赔偿单列表'; ?></a>
                    </li>
                </ul>
            </div>
            <div class="box-content form-horizontal separate-sections validatable">
                <div class="form-group">
                    <label class="title col-xs-2">
                        赔偿单编号
                    </label>
                    <div class="col-xs-8">
                        <p class="form-control-static">{{server_data.pc_no}}</p>
                    </div>
                </div>
                <div class="form-group">
                    <label class="title col-xs-2">
                        申请人
                    </label>
                    <div class="col-xs-8">
                        <p class="form-control-static">{{server_data.username}}</p>
                    </div>
                </div>
                <div class="form-group">
                    <label class="title col-xs-2">
                        赔偿数量
                    </label>
                    <div class="col-xs-8">
                        <p class="form-control-static">{{server_data.number}}</p>
                    </div>
                </div>
                <div class="form-group">
                    <label class="title col-xs-2">
                        赔偿类型
                    </label>
                    <div class="col-xs-8">
                        <p class="form-control-static">{{server_data.type_desc}}</p>
                    </div>
                </div>
                <div class="form-group">
                    <label class="title col-xs-2">
                        审批状态
                    </label>
                    <div class="col-xs-8">
                        <p class="form-control-static">{{server_data.status_desc}}</p>
                    </div>
                </div>

                <div class="form-group">
                    <label class="title col-xs-2">
                        设备列表
                    </label>
                    <div class="col-xs-8">
                        <mi-table
                                :item_actions="table_item_actions"
                                :table_data="table_data.rows"
                                :table_columns="table_columns"
                                :table_hint_text="table_hint_text"
                                table_class="table table-striped"
                        ></mi-table>
                    </div>
                </div>
                <div class="form-group">
                    <label class="title col-xs-2">
                    </label>
                    <div class="col-xs-7">
                        <div class="row col-xs-12" v-html="post_hint_text"></div>
                    </div>
                </div>
                <div class="form-actions">
                    <span class="span1"></span>
                    <a class="btn btn-info span1"
                       name="submit"
                       @click="submit"
                       style="float:left;margin-right:5px;width:90px;">
                        提交申请
                    </a>
                    <a class="btn btn-default span1" name="resetButton"
                       href="<?php echo $this->createUrl('/asset/prototypeMachine/CompensationList'); ?>"
                       style="margin-left:5px;">返回列表</a>
                </div>
                <!-- 通用操作 结束 -->
            </div>
        </div>
    </div>

    <!--        <a class="btn" @click="debug">显示测试数据</a>-->
</div>
<!--<script src="/js/vue/vue2.1.dev.js"></script>-->
<script src="/js/vue/vue2.min.js"></script>
<script src="/js/vue/vue2.mi_base_component.js"></script>

<script>
    $(function () {
        var data = <?php echo CJSON::encode($data);?>;
        if(data.status != 1) {
            showMsg('error', '数据错误:'+(data.msg ? data.msg : '服务器错误')+'，即将返回列表页', 2500, function(){
                location.href = '<?php echo Yii::app()->createUrl('/asset/prototypeMachine/CompensationList');?>';
            });
            return false;
        }
        if(!data.data.id) {
            showMsg('error', '数据不存在，即将返回列表页', 2500, function(){
                location.href = '<?php echo Yii::app()->createUrl('/asset/prototypeMachine/CompensationList');?>';
            });
            return false;
        }

        var default_table_data = (typeof data.data.detail === 'object') ? data.data.detail : [];
        var table_columns = [
        {
            name: '__id',     //需要与table_data中的键对应
            title: '#',       //列头
            title_class: '',      //table>thead>tr>th class
            data_class: '',       //table>tbody>tr>td class
            callback: '',         //对该列值进行处理的回调函数，比如传入1返回男 传入2返回女
            style: {
            width: '50px'    //table>thead>tr>th style
        }
        },
        {
            name: 'sn',
            title: 'SN',
            class: {},
            style: {
            width: '120px'
        }
        },
        {
            name: 'imei',
            title: 'IMEI',
            class: {},
            style: {
            width: '120px'
        }
        },
        {
            name: 'sku',
            title: 'SKU',
            class: {},
            style: {
            width: '120px'
        }
        },
        {
            name: 'source_asset_info.goods_name',
            title: '名称',
            class: {},
            style: {
            width: '150px'
        },
            callback: ''
        }
        ];
        var type_id_is_2_add = [
        {
            name: 'compensation_asset_info.sku',
            title: '新设备SKU',
            class: {},
            style: {
            width: '120px'
        }
        },
        {
            name: '__component:CompensationNewMachine',
            title: "新设备IMEI",
            titleClass: 'center',
            dataClass: 'center',
            style: {
            width: '250px'
        },
        }
        ];
        if(data.data.type_id == 2) {
            table_columns = table_columns.concat([
                {
                    name: 'compensation_asset_info.sku',
                    title: '新设备SKU',
                    class: {},
                    style: {
                        width: '120px'
                    }
                },
                {
                    name: '__component:CompensationNewMachine',
                    title: "新设备IMEI",
                    titleClass: 'center',
                    dataClass: 'center',
                    style: {
                        width: '250px'
                    }
                }
            ]);
        }
        Vue.component('CompensationNewMachine', {
            template: [
                '<div>',
            '<template v-if="isNotDone(rowData)">',
                '<template v-if="showCheckIMEIAction(rowData)">',
                    '<input style="width:150px;" @change="changeData($event, rowData)"/><a class="btn"  @click="checkData($event, rowData)">验证</a>',
            '</template>',
        '<template v-if="!showCheckIMEIAction(rowData)">',
            //                            '{{rowData.newMachineInfo.imei}} <a class="btn btn-success ico_loading"  @click="postData($event, rowData)">提交赔偿</a>',
        '{{rowData.newMachineInfo.imei}} <span class="label label-success">待提交</span>',
        '</template>',
        '</template>',
        '<template v-if="!isNotDone(rowData)">',
            '{{rowData.compensation_asset_info.imei}}',
            '</template>',
        '</div>',
        ].join(''),
        props: {
            rowData: {
            type: Object,
            required: true
        }
        },
        data: function () {
            return {
            imei: ''
        }
        },
        methods: {
            isNotDone: function (rowData) {
            var serverData = this.$root.$data.server_data;
            if(serverData.status != 'finish') {
            this.$set(rowData, 'compensation_asset_info', {imei: '审核未完成'})
        }
            if(serverData.type_id != 2) {
            this.$set(rowData, 'compensation_asset_info', {imei: '非原样赔偿单'})
        }
            if(typeof rowData['compensation_asset_info'] === 'object') {
            if(rowData['compensation_asset_info'].imei) {
            return false;
        }
            return true;
        }
            return true;
        },
            showCheckIMEIAction: function(rowData){
            if(rowData['newMachineInfo']) {
            return false;
        }
            return true;
        },
            changeData: function (event, rowData) {
            this.$data.imei = event.target.value;
        },
            checkData: function (event, rowData) {
            if(this.$data.imei == null || this.$data.imei == undefined || this.$data.imei == '') {
            showMsg('error', 'IMEI不能为空！', 1000);
            return false;
        }
            if(this.$data.imei == rowData.imei) {
            showMsg('error', '新设备的IMEI不能等于旧设备IMEI！', 1000);
            return false;
        }
            var _self = this;
            $.ajax({
            url: '<?php echo Yii::app()->createUrl('asset/prototypeMachine/GetSNInfoByOneIMEI'); ?>/',
            data: {'imei': this.$data.imei},
            type: 'post',
            success: function(response) {
            if(response.status == 1) {
            var tableData = _self.$root.$data.table_data.rows;
            var tag = false;
            for(var i in tableData) {
            if((typeof tableData[i]['newMachineInfo'] === 'object') && tableData[i]['newMachineInfo'].imei == response.data.imei) {
            tag = tableData[i].imei;
        }
        }
            if(!tag) {
            _self.$set(rowData,'newMachineInfo',response.data);
            _self.$set(rowData['compensation_asset_info'],'sku',response.data.goods_id);
            showMsg('success', '根据该IMEI成功查询到设备信息', 1000);
        } else {
            showMsg('error', '该IMEI已被使用，对应旧设备IMEI为' + tag, 1000);
        }
        } else {
            showMsg('error', response.msg, 2000);
        }
        },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            showMsg('error', textStatus, 1000);
        }
        });
        },
            postData: function(event, rowData) {
            var _self = this;
            var postData = {
            old_sn:     rowData.sn,
            new_sn:     rowData.newMachineInfo.sn,
            new_imei:   rowData.newMachineInfo.imei,
            new_sku:    rowData.newMachineInfo.goods_id,
            pc_no:      rowData.pc_no
        };
            $(event.target).html('请稍候...');
            $.ajax({
            url: '<?php echo Yii::app()->createUrl('asset/prototypeMachine/NewMachineReplacement'); ?>/',
            data: postData,
            type: 'post',
            success: function(res) {
            if(res.status != 1) {
            showMsg('error', res.msg, 1500);
            $(event.target).html('提交赔偿');
            _self.$delete(rowData, 'newMachineInfo');
            return false;
        }
            showMsg('success', '已成功将新设备提交到系统', 1000);
            $(event.target).html('提交赔偿');
            _self.$set(rowData, 'compensation_asset_info', {imei: postData.new_imei, sn: postData.new_sn, sku: postData.new_sku})
        },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            showMsg('error', textStatus, 1000);
        }
        });
        }
        }
        });
        var vueBox = new Vue({
            el: '#vueBox',
            data: {
            inimei: '',
            hint_text: '&nbsp;',
            server_data: data.data,
            table_item_actions: [ //操作控件
        { name: 'delete-item', label: '', icon: 'fa fa-remove', class: 'btn btn-mini btn-danger', displayed: '', callback: 'delete_item' },
            ],
            post_hint_text: '&nbsp;',
            table_columns: table_columns,
            table_hint_text: '',
            table_data: {
            rows: default_table_data
//                    rows: [
//                        {
//                            sku: '123213213131',
//                            imei: '12fewiawu9w83',
//                            goods_name: '测试端口'
//                        }
//                    ]
        }

        },
            allotStatusOptions: [],
            components:{
            'mi-table': MiTableComponent,
        },
            watch: {

        },
            computed:{

        },
            mounted: function () {
            this.$nextTick(function(){
            (function(obj){
            obj.$data.server_data.created_at = obj.datetime_format(obj.$data.server_data.created_at);
            obj.$data.server_data.finish_dateline = obj.datetime_format(obj.$data.server_data.finish_dateline);
        })(this);
        });
        },
            methods:{
            action_close: function(){
            var _self = this;
            BootstrapDialog.confirm('确定要撤销吗？',function(isClose){
            var postData = {
            id: _self.server_data.allot_order_id
        };
            if(isClose) {
            $.ajax({
            url: "<?php echo Yii::app()->createUrl('/asset/prototypeMachine/AjaxCloseAllot')?>",
            data: postData,
            type: 'post',
            success: function (response) {
            if(response.status == 1) {
            BootstrapDialog.success('您已成功撤销调拨单号为：' + _self.server_data.order_no + ' 的调拨单');
        } else {
            BootstrapDialog.alert(response['msg']);
        }
        },
            error: function() {
            BootstrapDialog.alert('撤销失败，请稍后再试');
        }
        });
        }
        });
        },
            submit: function () {
            var sData = this.table_data.rows;
            var postData = {
            pc_no: this.$data.server_data.pc_no,
            items: []
        };
            for(var i in sData) {
            if((typeof sData[i]['newMachineInfo']) !== 'object') {
            BootstrapDialog.alert('设备表中第' + (parseInt(i)+1) + '条数据未填写需要替换的新设备');
            return false;
        }
            var tmpRowData = {
            old_sn: sData[i].sn,
            imei:   sData[i].newMachineInfo.imei,
            sku:   sData[i].newMachineInfo.goods_id,
            sn:   sData[i].newMachineInfo.sn,
        }
            postData.items.push(tmpRowData);
        }

            var _self = this;
            $.ajax({
            data: postData,
            type: 'post',
            success: function(response) {
            if(response.status == 1) {
            showMsg('success', '成功', 1000);
            var sessionTimeSecond = 3;
            _self.$data.post_hint_text = '<span style="color: green">恭喜，提交申请成功&nbsp;&nbsp;<span name="redirect_time">'+sessionTimeSecond+'</span>秒 后跳转到列表页面</span>';
            $('[name=redirect_time]').text(sessionTimeSecond);
            -- sessionTimeSecond;
            var timer = setInterval(function () {
            if (sessionTimeSecond >= 0) {
            $('[name=redirect_time]').text(sessionTimeSecond);
        }
            if (sessionTimeSecond <= 0) {
            clearInterval(timer);
            location.href = '<?php echo Yii::app()->createUrl('/asset/prototypeMachine/CompensationList');?>';
        }
            sessionTimeSecond--;
        }, 1000);

        } else {
            _self.$data.post_hint_text = '<span style="color:red">'+ response.msg +'</span>';
            showMsg('error', response.msg, 1000);
        }
        },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
            showMsg('error', textStatus, 1000);
            _self.$data.post_hint_text = textStatus;
        }
        });
        },
            isDisplayClose: function () {
            if(this.server_data.status_desc == '已提交申请') {
            return true;
        }
            return false;
        },
            datetime_format: function(nS) {
            if(nS < 1000 || isNaN(nS)) {
            return '-- --';
        }
            return new Date(parseInt(nS) * 1000).format('yyyy-MM-dd hh:mm:ss');
        },
            debug: function () {
            console.log(this.table_data)
        }
        }
        });

        });
</script>