/**
 * Created by chenjiang on 16-10-26.
 * base on VUE 2.0
 */
var SALESTATUSLIST = {
    orderStatus: {
        9200: {text: '已创建', value: 9200},
        9201: {text: '待出库', value: 9201},
        9202: {text: '已出库', value: 9202},
        9203: {text: '已签收', value: 9203},
        9204: {text: '未签收', value: 9204},
        9205: {text: '已拒收', value: 9205},
        9206: {text: '已撤销', value: 9206},
    },
    assetStatus: {
        9250: {text: '已创建', value: 9250},
        9251: {text: '待出库', value: 9251},
    },
    approvalStatus: {
        keep:       {text: '草稿', value: 'keep'},
        submit:     {text: '已提交申请', value: 'submit'},
        in_approval: {text: '审批中', value: 'in_approval'},
        reject:     {text: '驳回', value: 'reject'},
        finish:     {text: '已审批', value: 'finish'},
        deleted:    {text: '已删除', value: 'deleted'},
        revoke:     {text: '撤回', value: 'revoke'},
    },
    compensationTypeStatus: {
        '1': {text: '免赔', value: 1},
        '2': {text: '原样赔偿', value: 2},
        '3': {text: '原价赔偿', value: 3},
        '4': {text: '折价赔偿', value: 4},
    },
    compensationCauseStatus: {
        1: {text: '丢失', value: 1},
        2: {text: '损坏', value: 2},
        3: {text: '损毁', value: 3},
    },
    compensationStatus: {
        0: {text: '无', value: 0},
        1: {text: '已赔偿', value: 1},
        2: {text: '未赔偿', value: 2},
        3: {text: '待确认', value: 3},
    },
};
var MiGlobalPageSize = 20;
var MiTableComponent = Vue.extend({
    /**
     * table_hint_text: '数据加载中... | 暂无数据'  //此数据属性有数据时，不显示数据表的数据
     * table_columns 数据结构如下
     * tableColumns: [
     * {
         *     name: 'activity_id',
         *     title: '活动ID',      //列头
         *     title_class: '',     //table>thead>tr>th class
         *     data_class: '',      //table>tbody>tr>td class
         *     style: 'width: 80px;',
         *     callback: ''    //对该列值进行处理的回调函数
         * },
     * {
         *     name: 'activity_type',
         *     title: '活动类型',
         *     title_class: '',
         *     data_class: '',
         *     style: 'width: 80px;'
         * },
     * {
         *      name: '__actions',  //操作选项
         *      title_class: '',
         *      data_class: '',
         *      title: '操作',
         * }
     * ]
     *
     * table_data 数据结构如下：
     * table_data: [
     *  {
         *      'activity_id': '1',
         *      'activity_type': '全国活动'
         *  },
     *  {
         *      'activity_id': '2',
         *      'activity_type': '安徽省内活动'
         *  }
     * ]
     *
     * item_actions: [
     *  { name: 'view-item', label: '', icon: 'zoom icon', class: 'ui teal button', displayed: 'action_allow_info' }, //action_allow_info返回 true或false，返回true时显示此控件，返回false时不显示
     *  { name: 'edit-item', label: '', icon: 'edit icon', class: 'ui orange button', displayed: 'action_allow_edit' },
     * ]
     * */
    props: {
        table_hint_text: {
            default: '',
        },
        table_data: {
            default: [],
            required: true,
        },
        table_columns: {
            default: [],
            required: true,
        },
        table_result: {
            default: function(){return {selected: []}}
        },
        item_actions: {
            default: [],
        },
        table_class: {
            default: '',
        },
        thead_class: {
            default: ''
        },
        thead_tr_class: {
            default: ''
        },
        tbody_class: {
            default: ''
        },
        tbody_tr_class: {
            default: ''
        },
        sortOrder: {
            type: Array,
            default: function() {
                return []
            }
        },
    },
    template:
    '<table :class="[table_class || \'\']">' +
    '<thead> ' +
    '<tr :class="[thead_tr_class || \'\']">  ' +
    '<template v-for="field in table_columns">  ' +
    '<template v-if="isSpecialField(field.name)">   ' +
    '<th v-if="extractName(field.name) == \'__checkbox\'" :style="[ field.style || \'\' ]" :class="[field.titleClass || \'\']">' +
    '<input type="checkbox" @change="toggleAllCheckboxes(field, $event)">' +
    '</th>' +
    '<th v-if="extractName(field.name) == \'__id\'" :style="[ field.style || \'\' ]" :class="[field.titleClass || \'\']">' +
    '{{ getTitle(field) }}' +
    '</th>' +
    '<th v-if="extractName(field.name) == \'__actions\'" :style="[ field.style || \'\' ]" :class="[field.titleClass || \'\']">' +
    '{{ getTitle(field) }}' +
    '</th>' +
    '<th v-if="extractName(field.name) == \'__component\'"' +
    '@click="orderBy(field, $event)"' +
    ':class="[field.titleClass, {\'sortable\': isSortable(field)}]"' +
    ':style="[ field.style || \'\' ]"' +
    'v-html="field.title || \'\'">' +
    '<i v-if="isCurrentSortField(field) && field.title"' +
    ':class="sortIcon(field)"' +
    ':style="{opacity: sortIconOpacity(field)}"></i>' +
    '</th>' +
    '</template> ' +
    '<template v-if="!isSpecialField(field.name)">  ' +
    '<th v-bind:id="\'_\' + field.name" :style="[ field.style || \'\' ]" :class="[ field.title_class || \'\' ]">  ' +
    '{{ getTitle(field) }}' +
    '</th>   ' +
    '</template>  ' +
    '</template>   ' +
    '</tr>  ' +
    '</thead>  ' +
    '<tbody :class="[ tbody_class || \'\' ]">  ' +
    '<template v-if="!table_data || table_data.length < 1 || table_hint_text">  ' +
    '<template v-if="table_hint_text">' +
    '<tr :class="[ tbody_tr_class || \'\' ]"><td :colspan="[table_columns.length || \'\']">{{table_hint_text}}</td></tr>  ' +
    '</template>  ' +
    '<template v-if="!table_hint_text">  ' +
    '<tr :class="[ tbody_tr_class || \'\' ]"><td :colspan="[ table_columns.length || \'\' ]">暂无数据</td></tr> ' +
    '</template>  ' +
    '</template>  ' +
    '<template v-if="!(!table_data || table_data.length < 1 || table_hint_text)">  ' +
    '<template v-for="(item, itemNumber) in table_data">  ' +
    '<tr :class="[ tbody_tr_class || \'\' ]">  ' +
    '<template v-for="field in table_columns"> ' +
    '<template v-if="isSpecialField(field.name)">' +
    '<td v-if="extractName(field.name) == \'__checkbox\'" :class="[{\'vuetable-checkboxes\': true}, field.dataClass]"> ' +
    '<input type="checkbox" ' +
    '@change="toggleCheckbox(item, field.name, $event)" ' +
    'v-if="hasCallback(field)"'+
    ':disabled="callCallback(field, item)"'+
    ':checked="rowSelected(item, field.name)"> ' +

    '<input type="checkbox" ' +
    'v-if="!hasCallback(field)"'+
    '@change="toggleCheckbox(item, field.name, $event)" ' +
    ':checked="rowSelected(item, field.name)"> ' +
    '</td> ' +
    '<td v-if="field.name == \'__actions\'" :class="[ field.data_class || \'\']">' +
    '<template v-for="action in item_actions">' +
    '<template v-if="isDisplay(action)">' +
    '<label v-if="callActionItem(action, item)" :class="[ action.class || \'\']" @click="callAction(action, item, $event)">' +
    '<i :class="[ action.icon || \'\']"></i> {{ action.label }}' +
    '</label>'+
    '</template>' +
    '<template v-if="!isDisplay(action)">' +
    '<label :class="[ action.class || \'\']" @click="callAction(action, item, $event)">' +
    '<i :class="[ action.icon || \'\']"></i> {{ action.label }}' +
    '</label>'+
    '</template>' +
    '</template>'+
    '</td>' +
    '<td v-if="field.name == \'__id\'" :class="[ field.data_class || \'\']">' +
    '{{ itemNumber + 1}}' +
    '</td>' +
    '<td v-if="extractName(field.name) === \'__component\'" :class="field.dataClass">' +
    '<component :is="extractArgs(field.name)" :row-data="item"></component>' +
    '</td>' +
    '</template>' +
    '<template v-if="!isSpecialField(field.name)">' +
    '<template v-if="!hasHtml(field)">'+
    '<td v-if="hasCallback(field)" :class="[ field.data_class || \'\']" @click="onCellClicked(item, field, $event)">' +
    '{{ callCallback(field, item) }}' +
    '</td>' +
    '<td v-else :class="[ field.data_class || \'\']" @click="onCellClicked(item, field, $event)">' +
    '{{ getObjectValue(item, field.name, "") }}' +
    '</td>' +
    '</template>'+
    '<template v-if="hasHtml(field)">'+
    '<td v-if="hasCallback(field)" :class="[ field.data_class || \'\']" @click="onCellClicked(item, field, $event)" v-html="callCallback(field, item)">' +
    '' +
    '</td>' +
    '<td v-else :class="[ field.data_class || \'\']" @click="onCellClicked(item, field, $event)" v-html="getObjectValue(item, field.name, \'\')">' +
    '' +
    '</td>' +
    '</template>'+
    '</template>' +
    '</template>' +
    '</tr>' +
    '</template>' +
    '</template>'+
    '</tbody>'+
    '</table>'
    ,

    data: function() {
        return {
            eventPrefix: 'mitable:',
        }
    },
    methods: {
        isSpecialField: function(fieldName) {
            // return fieldName.startsWith('__')
            return fieldName.slice(0, 2) === '__'
        },
        callAction: function(action, data, event) {
            if ( ! this.hasCallback(action))
                return;
            if(typeof this.$parent[action.callback] == 'function') {
                return this.$parent[action.callback].apply(action.callback, [action].concat(data));
            }
            this.$emit(this.eventPrefix + 'action', action, data, event)
        },
        callActionItem: function (action, item) {
            if ( ! this.isDisplay(action))
                return true;
            if ( typeof this.$parent[action.displayed] == 'function' ) {
                return this.$parent[action.displayed].apply(action, [item].concat(action));
            }
            return false;
        },
        getTitle: function(field) {
            if (typeof field.title === 'undefined') {
                return field.name.replace('.', ' ')
            }
            return field.title
        },
        isSortable: function(field) {
            return !(typeof field.sortField === 'undefined')
        },
        isCurrentSortField: function(field) {
            return this.currentSortOrder(field) !== false;
        },
        currentSortOrder: function(field) {
            if ( ! this.isSortable(field)) {
                return false
            }
            for (var i = 0; i < this.sortOrder.length; i++) {
                if (this.sortOrder[i].field === field.name) {
                    return i;
                }
            }
            return false;
        },
        hasCallback: function(item) {
            return item.callback ? true : false
        },
        hasHtml: function(item) {
            return item.html ? true : false
        },
        isDisplay: function(item) {
            if(!item) return false;
            return item.displayed ? true: false
        },
        extractName: function(string) {
            return string.split(':')[0].trim()
        },
        extractArgs: function(string) {
            return string.split(':')[1]
        },
        toggleCheckbox: function(dataItem, fieldName, event) {
            var isChecked = event.target.checked;
            var idColumn = this.extractArgs(fieldName);
            if (idColumn === undefined) {
                this.warn('You did not provide reference id column with "__checkbox:<column_name>" field!')
                return
            }
            var key = dataItem[idColumn]
            if (isChecked) {
                this.selectId(key)
            } else {
                this.unselectId(key)
            }
        },
        selectId: function(key) {
            if ( ! this.isSelectedRow(key)) {
                this.table_result.selected.push(key)
            }
        },
        unselectId: function(key) {
            this.table_result.selected = this.table_result.selected.filter(function(item) {
                return item !== key;
            });
        },
        isSelectedRow: function(key) {
            return this.table_result.selected.indexOf(key) >= 0
        },
        rowSelected: function(dataItem, fieldName){
            var idColumn = this.extractArgs(fieldName)
            var key = dataItem[idColumn];
            return this.isSelectedRow(key);
        },
        toggleAllCheckboxes: function(field, event) {
            var self = this;
            var fieldName = field.name;
            var isChecked = event.target.checked;
            var idColumn = this.extractArgs(fieldName);
            if (isChecked) {
                this.table_data.forEach(function(dataItem) {
                    if(! self.callCallback(field, dataItem)) {   //以后可能会有问题
                        self.selectId(dataItem[idColumn]);
                    }
                })
            } else {
                this.table_data.forEach(function(dataItem) {
                    if(! self.callCallback(field, dataItem)) {   //以后可能会有问题
                        self.unselectId(dataItem[idColumn]);
                    }

                })
            }
        },
        callCallback: function(field, item) {
            if ( ! this.hasCallback(field))
                return;
            var args = field.callback.split('|');
            var func = args.shift();
            if (typeof this.$parent[func] == 'function') {
                return (args.length > 0)
                    ? this.$parent[func].apply(this.$parent, [this.getObjectValue(item, field.name)].concat(args))
                    : this.$parent[func].call(this.$parent, this.getObjectValue(item, field.name), item)
            }
            return null;
        },
        onCellClicked: function(data_item, field, event) {
            this.$emit(this.eventPrefix + 'cell-clicked', data_item, field, event)
        },
        getObjectValue: function(object, path, defaultValue) {
            defaultValue = (typeof defaultValue == 'undefined') ? null : defaultValue;
            var obj = object;
            if (path.trim() != '') {
                var keys = path.split('.')
                keys.forEach(function(key) {
                    if (obj !== null && typeof obj[key] != 'undefined' && obj[key] !== null) {
                        obj = obj[key]
                    } else {
                        obj = defaultValue
                        return
                    }
                })
            }
            return obj
        },
    }
});
var MiPaginationComponent = Vue.extend({
    /**
     * 分页组件
     * <pagecomponent :page_data="you.data"></pagecompoent>
     * 传入page_data对象中的数据名称如下
     * page_data.data_total: 999  数据总数
     * page_data.page_total: 10   页码总数，可不传
     * page_data.page_size: 10,   页码大小,默认为10
     * page_data.page_cur: 8,     当前页码
     * page_data.data_from: 1,    第N条数据gi
     * page_data.data_end: 999,   到M条数据，可不传
     * */
    template:
    '<div>' +
    '<template v-if="page_data.data_total > 0">' +
    '<div class="table-footer">'
    +'<div class="dataTables_info">第 {{ page_data.data_from }} 到 {{ page_data.data_to }} 条 共计 {{ page_data.data_total }} 条</div>'
    +'<div class="dataTables_paginate paging_full_numbers">'
    +'<a class="first paginate_button" v-bind:class="{ paginate_button_disabled: page_data.page_cur <= 1 }" v-on:click="pagination_first">首页</a>'
    +'<a class="previous paginate_button" v-bind:class="{ paginate_button_disabled: page_data.page_cur <= 1 }" v-on:click="pagination_previous">上一页</a>'
    +'<span>'
    +'<a track-by="$index" v-for="button_num in pagination_buttons" v-on:click="pagination_button_click($event)" :data-value="button_num" v-bind:class="{ paginate_button: page_data.page_cur != button_num , paginate_active: page_data.page_cur == button_num}">{{ button_num }}</a>'
    +'</span>'
    +'<a class="next paginate_button" v-bind:class="{ paginate_button_disabled: page_data.page_cur >= page_data.page_total }" v-on:click="pagination_next">下一页</a>'
    +'<a class="last paginate_button" v-bind:class="{ paginate_button_disabled: page_data.page_cur >= page_data.page_total }" v-on:click="pagination_last">末页</a>'
    +'<span class="paginate_skip_text">&nbsp;&nbsp;转到&nbsp;</span>'
    +'<input class="input-inline" v-model="pagination_goto_num" style="width: 40px; height: 18px;" type="text" v-on:change="pagination_goto($event)">'
    +'<span class="paginate_skip_text">&nbsp;&nbsp;/&nbsp;&nbsp;{{ page_data.page_total }}页</span></div>'
    +'</div>' +
    '</template>' +
    '</div>'
    ,
    props: {
        pagination_button_length: {
            default: 7
        },
        page_data: {
            required: true,
        }
    },
    computed: {
        pagination_buttons: function() {
            this.pagination_goto_num = '';
            this.pagination_button_length = this.pagination_button_length ? parseInt(this.pagination_button_length) : 7;
            this.page_data.page_total   = this.page_data.page_total ? parseInt(this.page_data.page_total) : 0;
            this.page_data.data_total   = this.page_data.data_total ? parseInt(this.page_data.data_total) : 1;
            this.page_data.page_size    = this.page_data.page_size ? parseInt(this.page_data.page_size) : 1;
            this.page_data.page_cur     = this.page_data.page_cur ? parseInt(this.page_data.page_cur) : 1;

            this.page_data.data_from = this.page_data.page_size * (this.page_data.page_cur - 1) + 1;
            this.page_data.data_to = this.page_data.page_size * (this.page_data.page_cur - 1) + parseInt(this.page_data.rows.length);

            //if(!this.page_data.data_from) {
            //    this.page_data.data_from = this.page_data.page_size * (this.page_data.page_cur - 1) + 1;
            //}
            //if(!this.page_data.data_to) {
            //    this.page_data.data_to = this.page_data.page_size * (this.page_data.page_cur - 1) + parseInt(this.page_data.rows.length);
            //}

            var arr = [],left=-1,right= 1;

            if(this.page_data.page_cur > this.page_data.page_total) {
                this.page_data.page_cur = this.page_data.page_total;
            }
            if(this.page_data.page_cur < 1) {
                this.page_data.page_cur = 1;
            }
            if(this.page_data.data_total <= 0) {
                console.log('总数据条数若小于等于0，拒绝渲染');
                return;
            }
            if( ! this.page_data.page_total ) {
                if(this.page_data.page_size <= 0) {
                    this.page_data.page_size = 10;
                }
                this.page_data.page_total = Math.ceil( this.page_data.data_total / this.page_data.page_size);
            }

            //进自己
            arr.push(this.page_data.page_cur);
            for(var i=0; i < this.pagination_button_length; ++i) {
                //右进页码
                if(this.page_data.page_cur + right <= this.page_data.page_total  && arr.length <= this.pagination_button_length) {
                    arr.push(this.page_data.page_cur + right);
                    ++right;
                }
                //左进页码
                if(this.page_data.page_cur + left >= 1 && arr.length <= this.pagination_button_length) {
                    arr.unshift(this.page_data.page_cur + left);
                    --left;
                }
            }

            if(!isNaN(parseInt(arr[arr.length - 1])) && arr[arr.length - 1] < this.page_data.page_total) {
                arr.push('...');
            }
            if(!isNaN(parseInt(arr[0])) && arr[0] > 1) {
                arr.unshift('...');
            }
            return arr;
        }
    },
    methods: {
        pagination_first: function () {
            this.page_data.page_cur = 1;
        },
        pagination_last: function () {
            this.page_data.page_cur = this.page_data.page_total;
        },
        pagination_previous: function () {
            if(this.page_data.page_cur - 1 >= 1) {
                -- this.page_data.page_cur;
            }
        },
        pagination_next: function () {
            if(this.page_data.page_cur + 1 <= this.page_data.page_total) {
                ++ this.page_data.page_cur;
            }
        },
        pagination_button_click: function (event) {
            if(event.currentTarget.getAttribute('data-value') != '...') {
                this.page_data.page_cur = event.currentTarget.getAttribute('data-value');
            } else {
                if(!event.currentTarget['nextSibling']) {
                    var target = this.page_data.page_cur + this.pagination_button_length;
                    this.page_data.page_cur = target <= this.page_data.page_total ? target : this.page_data.page_total;

                } else {
                    var target = this.page_data.page_cur - this.pagination_button_length;
                    this.page_data.page_cur = target >=1 ? target : 1;
                }
            }
        },
        pagination_goto: function (event) {
            this.page_data.page_cur = event.currentTarget.value ? parseInt(event.currentTarget.value) : 1;
        }
    }
});
var MiSelectComponent = Vue.extend({
    /**
     * 参数
     * name html的name标签
     * style style代码
     * class class标签
     * data.selected 选中项的值
     * data.options 选项数组
     * [{ text: '审核通过', value: '1'},{ text: '审核通过', value: '2'}]
     **/
    template:
    '<select v-on:change="data.selected = $event.target.value" v-bind:class="select_class" v-bind:style="select_style" v-bind:name="name" v-model="data.selected">' +
    '<template v-for="option in data.options">' +
    '<option v-bind:value="option.value">{{ option.text }}</option>' +
    '</template>' +
    '</select>'
    ,
    props: {
        select_class: {
            default: ''
        },
        select_style: {
            default: ''
        },
        name: {
            default: 'MiSelectComponent' + Math.ceil(Math.random() * 10000000)
        },
        data: {
            required: true,
            default: {
                selected: '',
                options: [
                    {value:'', text:'未传选项值'}
                ]
            }
        }
    },
});
var MiAlertComponent = Vue.extend({
    template:
    '<div :class="[alert_class || \'\']" role="alert" v-if="data.length > 0">' +
    '<ul>' +
    '<template v-for="info in data">' +
    '<li v-html="info">{{info}}</li>' +
    '</template>' +
    '</ul>' +
    '</div>',
    props: {
        data: {
            required: true
        },
        alert_class: {
            default: 'alert alert-info',
        }
    }
});
var MiRadioComponent = Vue.extend({
    /**
     * input radio组件
     * 参数见props属性
     */
    template:
    '<div>' +
    '<template v-for="(item, index) in data.options">' +
    '<label v-bind:class="label_class" v-bind:style="label_style">' +
    '<input v-bind:checked="true" v-if="index == 0" @click="data.selected = $event.target.value" type="radio" :class="input_class" :style="input_style" v-bind:name="name"  v-bind:value="item.value" v-model="data.selected" >' +
    '<input v-else @click="data.selected = $event.target.value" type="radio" :class="input_class" :style="input_style" v-bind:name="name"  v-bind:value="item.value" v-model="data.selected" >' +
    '{{item.text}} ' +
    '</label>' +
    '</template>' +
    '</div>'
    ,
    props: {
        input_class: {
            default: ''
        },
        input_style: {
            default: ''
        },
        label_class: {
            default: 'radio-inline'
        },
        label_style: {
            default: 'padding-left: 0px;padding-right: 10px'
        },
        data: {
            required: true,
            default: {
                selected: '',
                options: [
                    {value:'', text:'未传选项值'}
                ]
            }
        },
        name: {
            default: 'MiRadioComponent' + Math.ceil(Math.random() * 10000000)
        }
    }
});
var MiDateInputComponent = Vue.extend({
    template: '' +
    '<div class="input-group date-pick" style="padding-top: 5px;">' +
    '<span class="input-group-addon">从</span>' +
    '<input v-bind:name="name_from" class="form-control date data-filter mi_date_input" v-model="date_range.from" placeholder="开始日期" data-date-format="YYYY-MM-DD" type="text">' +
    '<span class="input-group-addon middle-addon">到</span>' +
    '<input v-bind:name="name_to" class="form-control date data-filter mi_date_input" v-model="date_range.to" placeholder="结束日期"  data-date-format="YYYY-MM-DD" type="text">' +
    '</div>'
    ,
    props: {
        date_range: {
            required: true
        },
        name_from: {
            default: 'from' + Math.ceil(Math.random() * 999999)
        },
        name_to: {
            default: 'to' + Math.ceil(Math.random() * 999999)
        }
    },
    methods: {
        show: function () {
            console.log(this.date_range);
        }
    },
    mounted: function () {
        var _self = this;
        this.$parent.$nextTick(function () {
            $('[name='+_self.name_from+']').on('change', function () {
                _self.date_range.from = $(this).val();
            });
            $('[name='+_self.name_to+']').on('change', function () {
                _self.date_range.to = $(this).val();
            });
        });
    }
});


var MiGetStoreByRegionComponent = Vue.extend({
    /**
     *  参数
     *  res = {}            选择结果
     *  url = ''            AJAX获取数据URL
     *  province_list = [{id:1,text:'北京'},{...}]  省份数据
     *
     */
    template:
    '<div>' +
    '<div class="col-xs-2 col-xs-2-small-padding select-div" style="padding-left: 0px">' +
    '<mi-select :data="province_data" select_class="mi_selected" name="mi_province_data"></mi-select>' +
    '</div>' +

    '<div class="col-xs-2 col-xs-2-small-padding select-div" style="padding-left: 0px">' +
    '<mi-select :data="city_data" select_class="mi_selected" name="mi_city_data"></mi-select>' +
    '</div>' +

    '<div class="col-xs-2 col-xs-2-small-padding select-div" style="padding-left: 0px">' +
    '<mi-select :data="store_data" select_class="mi_selected" name="mi_store_data"></mi-select>' +
    '</div>' +
    '</div>'
    ,
    props: {
        res: {
            default: {}
        },
        ajax_url: {
            required: true
        },
        base_province_data: {
            required: true
        }
    },
    data: function () {
        return {
            error_messages: '',
            url: this.ajax_url,
            selected: {
                province: '',
                city: '',
                store: '',
                province_text: '',
                city_text: '',
                store_text: ''
            }
        }
    },
    computed: {
        province_data: function () {
            var options = this.formatSelect2OptionsData(this.base_province_data);
            options.unshift({value: 0, text: '请选择省份'});
            return {
                selected: 0,
                options: options
            };
        },
        city_data: function () {
            var _self = this;
            if (this.$data.selected.province != 0 && this.$data.selected.province != '' && this.$data.selected.province != null) {
                $("[name=mi_city_data]").prop("disabled", true);
                var rep = [];
                $.ajaxSetup({async: false});
                $.post(this.url, {
                    id: _self.$data.selected.province,
                    type: 'city_by_exist_store_and_province',
                }, function (res) {
                    var options = _self.formatSelect2OptionsData(res);
                    options.unshift({value: 0, text: '请选择城市'});
                    rep = {
                        selected: 0,
                        options: options
                    };
                }, 'json');
                $.ajaxSetup({async: true});
                _self.initSelect2('mi_city_data', '请选择城市', true);
                return rep;
            }
            _self.initSelect2('mi_city_data', '请选择城市');
            return {
                selected: 0,
                options: [{value: 0, text: '请选择城市'}]
            };
        },
        store_data: function () {
            var _self = this;
            if (this.$data.selected.city != 0 && this.$data.selected.city != '' && this.$data.selected.city != null) {
                var rep = [];
                $("[name=mi_store_data]").prop("disabled", true);
                $.ajaxSetup({async: false});
                $.post(this.url, {id: _self.$data.selected.city, type: 'store_by_city',}, function (res) {
                    var options = _self.formatSelect2OptionsData(res);
                    options.unshift({value: 0, text: '请选择店铺'});
                    rep = {
                        selected: 0,
                        options: options
                    };
                }, 'json');
                $.ajaxSetup({async: true});
                _self.initSelect2('mi_store_data', '请选择店铺', true);
                return rep;
            }
            _self.initSelect2('mi_store_data', '请选择店铺');
            return {
                selected: 0,
                options: [{value: 0, text: '请选择店铺'}]
            };
        }
    },
    methods: {
        formatSelect2OptionsData: function (data) {
            if (data && Array.isArray(data)) {
                return data.map(function (item) {
                    return {value: item.id, text: item.text}
                });
            }
        },
        initSelect2: function (name, str, removeDisabled) {
            setTimeout(function () {
                $('[name=' + name + ']').select2({
                    placeholder: str,
                    allowClear: true
                });
            }, 200);

            if (removeDisabled === true) {
                setTimeout(function () {
                    $('[name=' + name + ']').removeAttr("disabled");
                }, 200);
            }
        },
    },
    updated: function () {

    },
    mounted: function () {
        var _self = this;
        this.$parent.$nextTick(function () {
            $('[name=mi_province_data]').on('change', function () {
                _self.selected.province = $(this).find("option:selected").val() != 0 ? $(this).find("option:selected").val() : '';
                _self.selected.province_text = $(this).find("option:selected").val() != 0 ? $(this).find("option:selected").text() : '';

                _self.selected.city = '';
                _self.selected.store = '';

                _self.selected.city_text = '';
                _self.selected.store_text = '';
            });
            $('[name=mi_city_data]').on('change', function () {
                _self.selected.city = $(this).find("option:selected").val() != 0 ? $(this).find("option:selected").val() : '';
                _self.selected.city_text = $(this).find("option:selected").val() != 0 ? $(this).find("option:selected").text() : '';

                _self.selected.store = '';
                _self.selected.store_text = '';
            });
            $('[name=mi_store_data]').on('change', function () {
                _self.selected.store = $(this).find("option:selected").val() != 0 ? $(this).find("option:selected").val() : '';
                _self.selected.store_text = $(this).find("option:selected").val() != 0 ? $(this).find("option:selected").text() : '';
            });

            _self.res.selected = _self.selected;
        })
    },
    components: {
        'mi-select': MiSelectComponent
    }
});