
(function (w) {

    var version = '1.0.0';

    //对外暴露的全局工厂函数
    function jQuery(selector) {
        return new jQuery.fn.init(selector);
    }
    //给原型一个简写的 方式
    jQuery.fn = jQuery.prototype ={
        constructor:jQuery,

        jquery:version,

        selector:'',

        length:'',

        toArray:function () {
            return [].slice.call(this);
        },

        get:function (i) {
            /*
                1 如果传入null或undefined，那么转换为数组返回
                2 如果传入的是正数，按照指定的下标获取元素返回
                3 如果传入的是负数，按照下标倒着获取元素返回
             */
            return i == null?this.toArray():
                (i >=0 ? this[i] : this[this.length + i]);
        },
        // 截取实例的部分元素
        slice:function () {
            /**
             * 1 通过数组的slice截取部分元素，
             * 2 把截取到的元素转换为实例对象返回
             */
            //因为slice的参数有变化 所以需要使用 arguments
            return jQuery( [].slice.apply(this,arguments) );
        },

        eq:function () {
            /*
             1 如果传入null或undefined，那么返回一个新实例
             2 如果传入的是正数，按照指定的下标获取元素返回，在包装成新实例返回
             3 如果传入的是负数，按照下标倒着(this.length + 负数)获取元素返回
             */
            return i == null?jQuery(): jQuery(this.get(i));
        },

        each:function (callback) {
            jQuery._each(this,callback);
        },

        map:function (callback) {
            return jQuery._map(this,callback);
        },
        //获取实例中的第一个元素
        first:function () {
            return this.eq(0);
        },
        //获取实例中最后一个元素
        last:function () {
            return this.eq(this.length-1);
        },

        push:[].push,
        sort:[].sort,
        splice:[].splice
    }

    //传入的obj，谁调用给谁混入方法
    /*jQuery.extend = jQuery.prototype.extend = function (obj) {
        for (var key in obj){
            this[ key ] = obj[ key ];
        }
    }*/

    //升级后的extend
    jQuery.extend = jQuery.fn.extend = function () {

        if(arguments.length === 1){
            for(var key in arguments[0]){

                this[ key ] = arguments[0][key];

            }
            return this;
        }else if(arguments.length >= 2){
            //遍历 第二个参数后面的每一个参数
            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];
                for(var key in obj){
                    arguments[0][ key ] = obj[key];
                }
            }
            return arguments[0];
        }

    }

    //给jQuery添加静态方法
    jQuery.extend({
        _isString : function (selector) {
            return typeof selector == 'string'
        },
        _isHTML : function (html) {
            //如果是空类型的,字节返回false
            if(!html){
                return false;
            }
            if(html.charAt(0) == '<' && html.charAt(html.length-1)=='>' && html.length>=3){
                return true;
            }
            return false;
        },
        //去掉字符串空白字符
        _trim :  function (str) {
            //不是字符串就不处理了
            if(typeof str !== 'string'){
                return str;
            }
            //优先使用内置的trim
            if(str.trim){
                return str.trim();
            }
            //把首尾空白字符替换为空，返回
            return str.replace(/^\s+||\s+$/g,'');
        },
        //判断是不是函数
        _isFunction : function (fn) {
            return typeof fn == 'function';
        },
        //判断是不是window
        _isWindow : function (w) {
            return !!w && w.window == w;
        },
        _isObject: function( obj ) {//判断是不是对象

            // 防止typeof对null的误判
            if ( obj === null ) {
                return false;
            }

            // 如果是object或function，那就是对象
            if ( typeof obj === 'object' || typeof obj === 'function' ) {
                return true;
            }

            return false;
        },
        //判断是不是伪数组或者真数组
        _isLikeArray : function (arr) {
            //过滤函数和window
            if(jQuery._isFunction(arr)||jQuery._isWindow(arr)|| typeof arr !== 'object'){
                return false;
            }
            //判断是不是真数组
            if(({}).toString.call(arr) == '[object Array]'){
                return true;
            }
            //判断是不是伪数组
            //arr必须有length，在这个基础上，要么length为0，要么有length-1这个属性值
            if(('length' in arr)&& (arr.length ===0 || (arr.length-1) in arr)){
                return true;
            }
            return false;
        },
        _readLoad : function (fn) {
            //先判断DOMContentLoaded有没有触发
            //通过document.readyState === 'complete'判断
            //如果为true, fn可以直接调用

            //如果为false，那么判断支不支持addEvevtListner
            //如果支持，绑定DOMContentLoaded

            //如果不支持，使用attachEvent绑定onreadystatechange事件
            //注意，需要在里面判断document.readyState === 'complete'

            //如果已经构建完毕，fn可以直接执行
            if(document.readyState === 'complete'){
                fn();
            }
            //如果DOM没有构建完毕，那么判断addEventListener是否兼容
            else if(document.addEventListener){
                document.addEventListener('DOMContentLoaded',function () {
                    fn();
                });
            }
            //如果不兼容addEventListener,那么采取attachEvent
            //同时事件为了onreadystatechange，为了防止多次 执行
            //所以需要一个包装函数来进行过滤
            else {
                // IE8模拟DOMContentLoaded事件的方式
                document.attachEvent( 'onreadystatechange', function() {
                    if(document.readyState === 'complete'){
                        fn();
                    }
                });
            }
        },
        _each: function ( obj, fn ) {
            /*
             * 1、先判断obj是不是数组或者伪数组，
             * 2、如果是，则通过i的方式遍历这个对象
             * 3、如果不是，则通过for in的方式遍历这个对象
             * 4、在遍历的过程中，把每一次遍历到key和val分别传给回调。
             * */
            if(jQuery._isLikeArray(obj)) {
                for ( var i = 0, len = obj.length; i < len; i++ ) {
                    if(fn.call(obj[i],i,obj[i]) === false)  break;
                }
            }else {
                for ( var key in obj ) {
                    if(fn.call(obj[key],key, obj[key]) === false) break;
                }
            }
        },
        _map :function (obj,fn){
            var arr = [];
            if(jQuery._isLikeArray(obj)) {
                for ( var i = 0, len = obj.length; i < len; i++ ) {
                    arr.push(fn(obj[i],i));
                }
            }else {
                for ( var key in obj ) {
                    arr.push(fn(obj[ key ],key));
                }
            }
            return arr;
        },
        _getStyle:function (dom,sty) {
            return dom.style[sty] || getComputedStyle(dom)[sty] || dom.currentStyle[sty];
        },
        //事件添加
        addEvent: function (ele,type,fn) {

            //ele必须是dom type必须是字符串 fn必须是函数
            if(!ele.nodeType || !jQuery._isString(type)||!jQuery._isFunction(fn))
                return ;

            if(ele.addEventListener){

                ele.addEventListener(type,fn);

            }else{

                ele.attachEvent('on' + type,fn);

            }
        },
        removeEvent :function (ele,type,fn) {

            //ele必须是dom type必须是字符串 fn必须是函数
            if(!ele.nodeType || !jQuery._isString(type)||!jQuery._isFunction(fn))
                return ;

            if(ele.removeEventListener){

                ele.removeEventListener(type,fn);

            }else {

                ele.detachEvent('on' + type,fn);

            }
        },   ajaxSettings:{
            url:location.href,
            type:"GET",
            async:true,
            contentType:"application/x-www-form-urlencoded;charset=utf-8",
            timeout:null,
            beforeSend:function () {
                return true;
            },
            success:function (data) {},
            complete:function () {},
            error:function () {}
        },
        // 把对象转换为url参数形式的字符串
        urlStringify: function( data ) {
            var result = '', key;

            // 传入的不是对象，就直接返回空字符串
            if( !jQuery.isObject( data ) ) {
                return result;
            }

            for( key in data ) {
                // 为了防止IE发送的汉字路乱码，所以需要统一编码一下
                result += window.encodeURIComponent( key ) + '=' + window.encodeURIComponent( data[ key ] ) + '&';
            }

            // 从0截取到倒数第一个字符串返回
            return result.slice( 0, -1 );
        },

        /**
         * 发送ajax请求的数据
         * @param optionsNew
         * @param responseData
         */
        sendAjax: function (optionsNew,success) {

            var method = optionsNew.type.trim().toLowerCase();

            var url = optionsNew.url;

            var async = optionsNew.async;

            var sendData = optionsNew.data;

            var contentType = optionsNew.contentType;



            //创建 xhr 对象,发送 请求
            var xhr = new XMLHttpRequest();
            //注册 ajax响应事件
            xhr.onreadystatechange = function () {
                //先判断请求是否完成，完成就执行complete方法
                if(xhr.readyState === 4){
                    optionsNew.complete();
                    //判断请求是否成功，成功就执行success方法，失败执行error
                    if((xhr.status >=200 && xhr.status <300)||xhr.status == 304){
                        var respType = xhr.getResponseHeader("content-type")+";";
                        // 设置 dataType 为预定的返回类型,如果预定的返回类型为空 则 设置为响应的数据类型
                        var dataType = optionsNew.dataType || respType.split("/")[1].split(";")[0];
                        success(dataType,xhr.responseText);
                    }else{
                        optionsNew.error();
                    }

                }
            }
            //判断请求方法
            if(method === 'get'){
                //拼接url
                if(sendData){
                    url += '?'+jQuery.urlStringify(sendData);
                }
                //打开连接
                xhr.open(method,url,async);
                xhr.send();
            }else{
                //打开连接
                xhr.open(method,url,async);
                if(sendData){
                    //设置请求头
                    xhr.setRequestHeader("content-type",contentType);
                    //发送数据
                    xhr.send(JQuery.urlStringify(sendData));
                }else{
                    xhr.send();
                }
            }
        },
        /**
         *
         * @param optionsNew
         */
        sendJsonP:function (optionsNew,success) {
            var url = optionsNew.url;
            var sendData = optionsNew.data;
            var dataType = optionsNew.dataType;
            //1 定义 向服务器发送的 jsonp 回调函数名
            var callback = 'cross' +  parseInt(Math.random()*1000); //  cross1000

            //2 声明函数
            window[callback] = function (data) {
                success(dataType,data);
            }

            if(!sendData) {
                url += jQuery.urlStringify(sendData);
                //3拼接callback 到 url
                if (url.indexOf("&") != -1) {
                    url += "&callback=" + callback;
                } else {
                    url += "?callback=" + callback;
                }

                //4 调用函数
                //方式: 创建script 标签  发送请求   有点类似于  RPC
                //window.cross1000({"dada"});
                var script = document.createElement('script');
                //给他 src属性 赋值
                script.src = url;
                //找到head 标签 或 文档本身
                var head = document.getElementsByTagName("head")[0] || document.documentElement;

                //当script 标签 加载 完毕后 移除 script
                // 处理 script 标签的加载
                var done = false;
                // 为所有的浏览器 添加处理事件
                script.onload = script.onreadystatechange = function () {

                    if (!done && (!this.readyState || this.readyState === "loaded"
                        || this.readyState === "complete")) {
                        done = true;
                        // Handle memory leak in IE
                        script.onload = script.onreadystatechange = null;
                        //script.parentNode 表示 script 已经被添加到了 dom里 并且已经解析完了
                        if (head && script.parentNode) {
                            //解析完后 将其移除
                            head.removeChild(script);
                        }
                    }
                };
                // 将其添加到 head 标签中
                head.insertBefore(script, head.firstChild);
            }
        },
        //ajax 方法封装
        ajax:function (options) {

            //合并 用户默认的配置项，得到一份新的
            var optionsNew = {};
            jQuery.extend(optionsNew,jQuery.ajaxSettings,options);

            //如果beforeSend方法 是false 则 不发送ajax请求
            if (!optionsNew.beforeSend()){
                return;
            }

            //判断 dataType 的类型
            //如果 dataType 为 空 或 json 则 发送ajax 数据
            if(!optionsNew.dataType){

                jQuery.sendAjax(optionsNew,handleResponse);

                return;
            }
            //如果 请求数据类型 是jsonp
            if(optionsNew.dataType.trim().toLowerCase()=== 'jsonp'){
                //发送jsonp请求
                jQuery.sendJsonP(optionsNew,handleResponse);

            }
            //否则其它都发送ajax请求
            else{

                jQuery.sendAjax(optionsNew,handleResponse);

            }

            /**
             * 定义 对响应数据的处理函数
             */
            function handleResponse (dataType,data){
                /* dataType 从服务期端获取的数据类型 可以不写.
                 * 如果服务器端 设置的 响应类型 为 application/json 的格式 则
                 *     无论设置不设置改参数为json格式。data都会被转换成 js对象(调用的是 JSON.parse方法)
                 * 如果服务器端 设置的 响应类型 为 text/html 的格式 则 data为 json格式的字符串，
                 *     如果设置改参数为json，data会被转换为 js对象(调用的是JSON.parse 方法)
                 * 说明了一个问题：application/json 表示是 json格式的 字符串
                 * 还有一个常用的是 jsonp
                 */
                //如果dataType为空 直接调用ajax 获取的data不用转换
                //如果 dataType 为空  则 返回的数据 的格不用转换
                if(!dataType){
                    optionsNew.success(data);
                    return;
                }
                var dataType = dataType.trim().toLowerCase();
                var result;
                switch (dataType){
                    case 'json':
                        result = JSON.parse(data);
                        break;
                    case 'jsonp':
                        result = data;
                        break;
                    case 'script':
                        eval( data );
                        result = data;
                        break;
                    case 'style':
                        $('<style></style>').html( data ).appendTo( 'head' );
                        result = data;
                        break;
                }

                optionsNew.success(result);

            }
        }
    });

    //init是jQuery中真正的构造函数  ==>入口函数
    var init = jQuery.fn.init = function (selector) {

        //1、传入null、undefined、0、NaN、''返回空对象( 即空实例 )
        if(!selector){
            return this;
        }
        //2、传入字符串
        if(jQuery._isString(selector)){
            //为了用户友好体验 字符串去掉首尾空白
            selector = jQuery._trim(selector);
            //2.1如果是片段,则创建对应的DOM，然后添加到实例身上
            if(jQuery._isHTML(selector)){
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = selector;
                [].push.apply(this,tempDiv.childNodes);
                return this;
            }else{
                //2.2按照选择器获取页面中的DOM，然后把获取到的DOM添加到实例身上
                try{
                    var nodes = document.querySelectorAll(selector);
                    [].push.apply(this,nodes);
                    return this;
                }catch (e){
                    this.length = 0;
                    return this;
                }
            }
        }

        //3、如果是函数
        if(jQuery._isFunction(selector)){
            jQuery._readLoad(selector);
        }
        //4、将数组或伪数组 添加到this上
        if (jQuery._isLikeArray(selector)){
            [].push.apply(this,selector);
        }else{
            //5、其他值 直接添加到this上
            this[0] = selector;
            this.length = 1;
        }
    }

    //替换构造函数的原型 为jQuery工厂函数的原型
    init.prototype = jQuery.prototype;

    jQuery.fn.extend({
        //清空所有元素
        empty:function() {
            /**
             * 实现思路：
             * 1、遍历likeArray（ 可以考虑使用for遍历，也可以考虑使用each遍历 ）
             * 2、遍历到的每一个元素清除其内容（ 元素.innerHTML = '' ）
             */
            /*for (var i = 0; i < likeArray.length; i++) {
                  likeArray[i].innerHTML = '';
             }*/
            this.each(function (key,val) {
                val.innerHTML = '';
            });

            return this;
        },
        remove:function () {
            /*
             * 实现思路：
             * 1、遍历likeArray（ 可以考虑使用for遍历，也可以考虑使用each遍历 ）
             * 2、遍历到的每一个元素要删除掉
             * （ 通过parentNode获取该元素的父元素，然后父元素.removeChild( 被删除元素 ) ）
             * */
            this.each(function (key,val) {
                val.parentNode.removeChild(val);
            });
            return this;
        },
        html:function (html) {
            /*
             * 实现思路：
             * 1、先通过arguments.length判断有没有传参
             * 2、没有传参，则获取第一个元素，然后返回这个innerHTML内容
             * 3、如果传参了，则遍历likeArray
             * 4、再设置每一个元素的innerHTML为传入的参数
             * */
            //如果传入的要操作的元素，那么就直接返回第一个元素的innerHTML
            if(arguments.length === 0){
                return this[0].innerHTML;
            }

            this.each(function (key,val) {
                val.innerHTML = html;
            });
            return this;
        },
        text: function (text) {
            /*
             * 实现思路：
             * 1、先通过arguments.length判断有没有传参
             * 2、没有传，则遍历likeArray（ 可以考虑使用for遍历，也可以考虑使用each遍历 ）
             * 3、把每一个元素的innerText加在一起返回
             * 4、则遍历likeArray（ 可以考虑使用for遍历，也可以考虑使用each遍历  ）
             * 5、再设置每一个元素的innerText为传入的参数。
             * */
            if(arguments.length ===0){
                var result ="";
                for (var i = 0; i < this.length; i++) {
                    result +=this[i].innerText;
                }
                return result;
            }
            for ( var i = 0, len = this.length; i < len; i++ ) {
                this[ i ].innerText = text;
            }
            return this;
        },
        appendTo :function(ele) {
            var $ele = $(ele);
            var result = [];
            // 定义taht 来记录添加元素对象
            var that = this;
            //遍历被添加的元素对象
            $ele.each(function (i) {
                if(i == 0){
                    //给被添加元素 添加 （添加元素对象）
                    result.push(that[0]);
                    this.appendChild(that[0]);
                }else {
                    //给被添加元素 添加（添加元素的克隆对象）
                    var clone = that[0].cloneNode(true);
                    this.appendChild(clone);
                    //将克隆
                    result.push(clone);
                }
            })
            return $(arr);
        },
        append:function (elements) {

            var $ele = $(elements);
            this.each(function (i) {
                if(i == 0) {
                    this.appendChild($ele[0]);
                }else{
                    this.appendChild($ele[0].cloneNode(true));
                }
            });
            return this;
        },
        prependTo: function (elements) {
            var $ele = $(elements);
            var that = this;
            var result = [];
            $ele.each(function (i) {
                if(i == 0){
                    this.insertBefore(that[0],this.firstChild);
                    result.push(that[0]);
                }else{
                    var tmp = that[0].cloneNode(true);
                    this.insertBefore(tmp,this.firstChild);
                    result.push(tmp);
                }
            })
            return result;
        },
        prepend:function (elements) {
            var $ele = $(elements);
            this.each(function (i) {
                if(i == 0){
                    this.insertBefore($ele[0],this.firstChild);
                }else{
                    this.insertBefore($ele[0].cloneNode(true),this.firstChild);
                }
            });
            return this;
        },
        //属性方法
        attr:function (attr,val) {

            /**
             *  实现思路：
             * 1、判断attr是不是字符串或者对象，不是直接return this
             * 2、如果是字符串，那么继续判断arguments 的length
             * 3、length为1，则获取第一个元素指定的属性节点值返回
             * 4、length>=2,则遍历所有元素，分别给他们设置新的属性节点值（setAtribute）
             * 5、如果不是字符串（是对象），那么遍历这个对象，得到所有的属性节点值
             *    然后遍历所有的元素，把所有的属性节点分别添加到这些元素中
             * return this
             */
            if(!(jQuery._isString(attr)||jQuery._isObject(attr))){
                return this;
            }

            if(jQuery._isString( attr )){
                if(arguments.length == 1 ){
                    return this.get(0).getAttribute(attr);
                }
                if(arguments.length >=2){
                    this.each(function () {
                        this.setAttribute(attr,val);
                    });
                    return this;
                }
            }
            if(jQuery._isObject(attr)){

                this.each(function () {
                    var that = this;
                    jQuery._each(attr,function (key,val) {
                        that.setAttribute(key,val);
                    })
                });
                return this;
            }

        },
        prop:function (attr,val) {
            if(!jQuery._isString(attr)&&!jQuery._isObject(attr)){
                return this;
            }

            if(arguments.length == 1){
                if(jQuery._isString(attr)){
                    return this[0][attr];
                }
                if(jQuery._isObject(attr)){

                    jQuery._each(this,function () {
                        var that = this;
                        jQuery._each(attr,function (key,val) {
                            that[key] = val;
                        })
                    })
                }
            }
            if(arguments.length >= 2){
                jQuery._each(this,function () {
                    this[attr] = val;
                })
            }
            return this;
        },

        css:function (name,value) {

            if(!jQuery._isObject(name)&&!jQuery._isString(name)){
                return this;
            }

            if(arguments.length == 1){
                if(jQuery._isString(name)){
                    //获取样式
                    /* return this[0].style[name];*/
                    return jQuery._getStyle(this[0],name);
                }
                if(jQuery._isObject(name)){
                    jQuery._each(this,function () {
                        var that = this;
                        jQuery._each(name,function (key,val) {
                            that.style[key] = val;
                        });
                    });
                }
            }

            if(arguments.length >=2){
                jQuery._each(this,function () {
                    this.style[name] = value;
                });
            }

            return this;
        },
        /**
         * 思路：
         * 1 如果参数的个数是0 获取value值  返回该值
         * 2 如果参数的个数是1 设置值 返回该对象
         */
        val:function (v) {

            if(arguments.length == 0){
                /*return this[0].value;*/
                return this.prop('value');
            }
            /*this.each(function () {
                this.value = v;
            })*/
            this.prop('value',v);
            return this;
        },
        //对class的操作
        /**
         * hasClass的操作
         * 先将divClassName 前后去掉空格
         * 在将中间的空格替换成一个空格
         * 然后 再在(' '+divClassName+' ') 中找是否是存在要在的‘ ’+字符串+‘ ’
         */

        hasClass:function (classN) {

            var flag = false;

            this.each(function () {
                var divClassName = this.className;
                //将中间的空格替换成一个空格 g表示匹配整个字符串
                divClassName = divClassName.replace(/\s+/g,' ');

                if((' '+divClassName+' ').indexOf(' '+classN+' ') != -1){
                    flag = true;
                    //结束 each函数
                    return false;
                }
            })

            return flag;
        },
        //给所有元素添加class  有则忽略
        /**
         * 思路：
         * 遍历所有的选中的jquery对象
         * 判断一个中是否已经 该className 有则不添加 没有追加 ' '+clsddName
         * 将其设置回去
         * 返回该对象本身 实现链式编程
         *
         *
         */

        addClass:function (classN) {
            var arr = classN.trim().split(" ");

            for (var i = 0; i < arr.length; i++) {

                this.each(function () {

                    if(!$(this).hasClass(arr[i].trim()))
                        this.className = this.className+" "+arr[i].trim();

                });
            }
            //实现链式编程
            return this;
        },
        //removeClass
        /**
         * 实现思路
         * 判断参数的个数
         *      如果参数个数为0 表示清除所有class
         *      如果参数个数大于等于1 表示清除指定的class
         *        切割第二个参数 分别移除
         *      return this 实现链式编成
         */
        //不传参，把所有元素的class清空
        //    $('div').removeClass();

        //传参，指定删除
        //    $('div').removeClass('aaa');

        //移除多个class
        //$('div').removeClass('aa bb')
        removeClass: function (classN) {

            if(arguments.length ==0) {

                this.each(function () {
                    this.className = "";
                });

            }else{
                var arr = classN.trim().split(" ");

                for (var i = 0; i < arr.length; i++) {

                    var obj = arr[i];

                    this.each(function () {

                        //"dd aa aaddcc" "dd" 如果不使用正则 可能被替换成"aa aacc" 不符合题意
                        // this.className = (" "+this.className +" ").replace(" "+arr[i]+" ","");
                        //使用动态创建正则 使用变量创建动态正则 就必须使用 newRegex的方式创建正则 正则字面量不管用
                        // 因为\在字符串中也有特殊含义，我们传给RegExp构造函数的参数必须全部是字符串，
                        // 为了传入的\是字符串，所以还需要另外一个\对\进行转义，转义为普通的字符串\。
                        var reg = new RegExp("\\b"+arr[i]+"\\b",'g');

                        this.className = this.className.replace(reg,"");
                    });

                }
            }
            return this;
        },
        //有的删除 没有的添加 如果没有参数 相当于 删除
        //$('div').toggleClass();

        //    $('div').toggleClass('aaa');

        //    $('div').toggleClass("aa bb");

        /**
         * 实现思路：
         * 判断参数个数 如果个数为0 调用removeClass方法
         *    如果个数为1
         *    切割参数 为数组 然后分别判断每个元素 是否存在
         *    如果存在删除
         *    如果不存在添加
         *    返回this 实现链式编程
         */
        toggleClass:function (classN) {
            if(arguments.length == 0){
                this.removeClass();
            }else{
                var arr = classN.trim().split(" ");

                for (var i = 0; i < arr.length; i++) {

                    var obj = arr[i];
                    this.each(function () {
                        var $self = $(this);

                        if($self.hasClass(arr[i])){

                            $self.removeClass(arr[i]);

                        }else{

                            $self.addClass(arr[i]);

                        }
                    })
                }
            }
            return this;
        }, on:function (type,fn) {
            /**
             * 实现思路
             * 1、遍历所有的元素
             * 2、判断每一个元素有没有$_event_cache
             * 3、如果有则继续使用，没有则初始化为一个对象
             * 4、在继续判断这个对象有没有对应事件类型的数组
             * 5、如果没有说明是第一次绑定改事件，
             *    5.1那么需要给$_event_cache这个对象以type为key添加一个数组
             *    5.2 然后把传入的回调push进去
             *    5.3最后还得绑定对应的事件
             *    5.4这个事件回调里面去遍历改事件的数组，得到每一个事件回调，依次执行
             *    5.5 执行时，需要改变内部的this，还需要把事件对象传递进去
             *6、如果有，直接把传入的回调push到对应的数组就可以了
             *7、链式编程返回false
             */
            this.each(function () {

                var self = this;
                //这里的this代表遍历到的每一个元素
                //如果这个元素已经有了$_event_cache
                //就用以前的，否则赋值一个新对象
                this.$_event_cache = this.$_event_cache||{};
                //如果没有对应事件的数组，说明是第一次绑定改事件
                if(!this.$_event_cache[type]){

                    this.$_event_cache[type] = [];

                    this.$_event_cache[type].push(fn);
                    //如果是第一次绑定该事件，那么需要真正调用浏览器的方法进行事件绑定
                    jQuery.addEvent(this,type,function (e) {

                        jQuery._each(this.$_event_cache[type],function () {
                            //这里的this，指的是每一个回调函数
                            this.call(self,e);
                        })

                        /* for (var i = 0; i < this.$_event_cache[type].length; i++) {
                         this.$_event_cache[type][i].call(self,e);
                         }*/
                    });
                }else{
                    this.$_event_cache[type].push(fn);
                }

            });

            return this;
        }, off:function (type,fn) {
            /*
             * 实现思路：
             * 1、那么遍历所有的元素，
             * 2、遍历到的每一个元素先判断有没有$_event_cache对象
             * 3、如果没有$_event_cache这个属性，说明之前没有绑定过任何事件，不用做任何处理；如果有$_event_cache继续判断
             * 4、先判断有没有传参，没有传参则遍历$_event_cache中存储的所有数组，分别清空
             * 5、如果传入1个参数，那么把元素$_event_cache对象指定类型的数组清空即可
             * 6、如果传2个以上参数，那么把元素$_event_cache对象指定类型的数组中指定的回调删除即可( 删除方式想想 )
             * 7、链式编程返回this
             *
             * */
            var argLen = arguments.length;

            this.each( function() {

                // 没有绑定过任何事件，就不用处理了
                if( !this.$_event_cache ) {
                    return;
                }

                // 如果绑过事件，需要进一步处理
                else {
                    // 如果没有传参，遍历所有的事件数组，分别清空
                    if( argLen === 0 ) {
                        for( var key in this.$_event_cache ) {
                            this.$_event_cache[ key ] = [];
                        }
                    }

                    // 如果传如一个参数，则清空指定事件类型的数组
                    else if( argLen === 1 ) {
                        this.$_event_cache[ type ] = [];
                    }

                    // 如果传入多个参数，则清空指定事件类型数组中指定的回调函数
                    else {

                        // 遍历对应事件类型的数组，得到每一个回调
                        for( var i = this.$_event_cache[ type ].length - 1; i >= 0; i-- ) {
                            // 依次和传入的回调比较，如果相等，则从数组中剔除
                            if( this.$_event_cache[ type ][ i ] === fn ) {
                                this.$_event_cache[ type ].splice( i, 1 );
                            }
                        }
                    }
                }
            });
            // 链式编程
            return this;
        },



    });

    //把工厂通过两个变量暴露出来
    w.jQuery = w.$ = jQuery;

})(window);