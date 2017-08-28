/**
 * Created by mooshroom on 2015/3/5.
 */

define('MDEditor', function () {
    return MDEditor = avalon.define({
        $id: 'MDEditor',
        md: "",
        now: "1",
        isHTML5: true,//标记html5web存储检测结果
        ready: function () {
            //配置依赖
            require.config({
                paths:{
                    "jq.sni.css":"../../plugins/MDEditor/jquery.snippet.css",
                    marked:"../../plugins/MDEditor/markdown.js",
                    MDcss:"../../plugins/MDEditor/MDEditor.css",
                    prettify:"../../plugins/MDEditor/prettify.js",
                    save:"../../plugins/MDEditor/save.js"
                }
            })

            MDEditor.toWrite();//切换为专注书写模式
            MDEditor.toRead();//切换为纯净阅读模式
            MDEditor.toBoth();//切换为实时预览模式
            MDEditor.autoHeight();//自适应高度
            MDEditor.doubleScroll();//实时预览双滚动
            require(["marked", "prettify",'css!jq.sni.css','css!MDcss',"save"], function () {
                marked.setOptions({
                    renderer: new marked.Renderer(),
                    gfm: true,
                    tables: true,
                    breaks: false,
                    pedantic: false,
                    sanitize: true,
                    smartLists: true,
                    smartypants: false
                });

                console.log("【markdown编辑器模块加载完成！】");


                //检测是否支持html5web存储
                if (typeof(Storage) !== "undefined") {
                    MDEditor.isHTML5 = true;

                    //查找存储中的lastMD，判断是否为第一次使用
                    var isFirst = true;
                    for (var i = 0; i < window.localStorage.length; i++) {
                        if (window.localStorage.key(i) == "lastMD") {
                            isFirst = false;
                            break
                        }
                    }

                    //加载上一次的文档


                    if (isFirst) {
                        avalon.ajax({
                            url: "./README.md",
                            type: "get",
                            success: function (data) {
                                MDEditor.md = data;
                                MDEditor.trs();
                            }

                        })
                    }
                    else {
                        MDEditor.md = window.localStorage.getItem("lastMD");
                        if (MDEditor.md !== "") {
                            MDEditor.trs();
                            tip.on("成功加载上一次的文档！", 1, 3000)
                        }
                    }


                }
                else {
                    tip.on("您老的浏览器老得不行了，无法为您开启文档保护", 0, 6000)// Sorry! No web storage support..
                    MDEditor.isHTML5 = false;
                }

            });
            avalon.scan();


        },

        //编译动作
        trs: function () {
//            var div=document.createElement('div');
//            div.innerHTML=marked(MDEditor.md);
//            console.log(div);
//
//            var show1=document.getElementById('doc-show');
//            var show2=document.getElementById('read-only');
            var result=marked(MDEditor.md);
            document.getElementById('doc-show').innerHTML = result;
            document.getElementById('read-only').innerHTML = result;

            //加载发布内容
//            publish.info=MDEditor.md;

            //执行本地缓存
            if (MDEditor.isHTML5 === true) {
                window.localStorage.setItem("lastMD", MDEditor.md)
            }

            prettyPrint();


        },

        //编辑窗口动作
        toWrite: function () {
            $("#doc-show-tool").show();
            $(".doc-layout").removeClass("col-sm-6").addClass("col-sm-12");           //.doc-layout class变为col-sm-12
            $("#doc-show-layout").fadeOut();
            $("#doc-main-layout").fadeIn();
            //变形完成
            $("#doc-show").show();
            $("#read-only").hide();

            MDEditor.autoHeight();
            MDEditor.now = 0

        },
        toBoth: function () {
            $("#read-only").hide();
            $("#doc-show").show();
            $("#nav-read").fadeOut();                                                  //#nav-both  class添加 hidden
            $("#nav-write").fadeOut();
            $(".doc-layout").removeClass("col-sm-6 col-sm-12").addClass("col-sm-6");           //.doc-layout class变为col-sm-12
            $("#doc-main-layout").fadeIn();
            $("#doc-show-layout").fadeIn();                                         //#doc-show-layout class添加hidden
            $("#nav-both").fadeIn();                                                //#nav-write class 去除hidden


            $("#doc-main-tool").find(".to-write").show();
            $("#doc-show-tool").find(".to-read").show();
            //变形完成
            MDEditor.autoHeight();
            MDEditor.now = 1
        },
        toRead: function () {

            $(".doc-layout").removeClass("col-sm-6 col-sm-12").addClass("col-sm-12");           //.doc-layout class变为col-sm-12
            $("#doc-main-layout").fadeOut();
            $("#doc-show-layout").fadeIn();
            $("#doc-show").hide();
            $("#doc-show-tool").hide();
            $("#read-only").show();
            $('.doc-layout').css('height', 'auto');


            //变形完成
            MDEditor.now = 2
        },

        autoHeight: function () {
            var adaptHeight = function () {
                var x = $(window).height();
                $('.doc-layout').css('height', (x - 90) + 'px');
            };
            adaptHeight();
            $(window).resize(function () {
                adaptHeight();
            });


        },
        //跟随滚动：
        doubleScroll: function () {
            $(".live-sroll").hover(function () {
                $(this).on("scroll", function () {
                    //得到要跟随滚动的ID值
                    //元素获取
                    var thisId = $(this).attr('id');
                    var otherId = thisId == "doc-show" ? "doc-main" : "doc-show";
                    //参数获取
                    var sh1 = document.getElementById(thisId).scrollHeight;
                    var st1 = $("#" + thisId).scrollTop();
                    var sh2 = document.getElementById(otherId).scrollHeight;
                    var h1 = $("#" + thisId).height();
                    var h2 = $("#" + otherId).height();
                    //跟随滚动公式
                    // 实际运动高度
                    //var l1 = (sh1 - h1);
                    //var l2 = (sh2 - h2);
                    //文本运动高度之比与实际运动高度之比相等
                    var st2 = st1 / (sh1 - h1) * (sh2 - h2);
                    //动作执行
                    $("#" + otherId).scrollTop(st2);
                });
            }, function () {
                $(this).off("scroll");
            });


        },
//        插入内容模块

        insert: function (f1, f2, n1, n2) {

            //保存当前滚动高度
            var sh = $("#doc-main").scrollTop();

            var textarea = document.getElementById("doc-main");
            var start = textarea.selectionStart;//获取光标所在位置对应的文本节点
            var end = textarea.selectionEnd;
            var l = MDEditor.md.length;//获取整个文本总长度

            //插入指定的东西
            var t1 = MDEditor.md.slice(0, start);
            var t = MDEditor.md.slice(start, end);
            var t2 = MDEditor.md.slice(end, l);
            var afterMd = t1 + f1 + t + f2 + t2;
            MDEditor.md = afterMd;

            //文本域获取焦点并且选中制定的文本
            textarea.focus();
            textarea.setSelectionRange(start + n1, end + n1 + n2);

            //滚回原来的高度
            $("#doc-main").scrollTop(sh);

            //执行编译
            MDEditor.trs();
            console.log()


        },
        //快捷键
        hotKey: function () {
            var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
//            console.log(keyCode);
            //TODO 编辑器的快捷键状况较为复杂，设计好思路再回来写
            //快捷键规划如下
            //blod   ctrl+b
            //Italic ctrl+i
            //links  ctrl+l
            //table  ctrl+t
            //quote  ctrl+q
            //code   ctrl+c
            //img    ctrl+p
            //ol     ctrl+o
            //ul     ctrl+u
            //divider ctrl+d
        },

        //粗体
        bold: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("**加粗的文字", "**", 2, 5)
            }
            else {
                MDEditor.insert("**", "**", 2, 0)
            }

        },
        //斜体
        italic: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("*倾斜的文字", "*", 1, 5)
            }
            else {
                MDEditor.insert("*", "*", 1, 0)
            }

        },
        //插入连接
        link: "",
        links: function () {
            modallink.mustOut()
            if (MDEditor.link == "") {
                MDEditor.link = "输入连接地址";
            }
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("[输入连接描述", "](" + MDEditor.link + ")", 1, 6)
            }
            else {
                MDEditor.insert("[", "](" + MDEditor.link + ")", 1, 0)
            }

            MDEditor.link = "";

        },

        //表格
        table: function () {
            MDEditor.insert("\r\n", "表头一|表头二|表头三\r\n----|----|----\r\n行一列一|行一列二|行一列三\r\n行二列一|行二列二|行二列三\r\n行三列一|行三列二|行三列三", 1, 0)
        },

        //段落引用
        quote: function () {
            MDEditor.insert("\r\n> ", "", 3, 0)
        },
        //插入代码
        code: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("```输入代码语言\r\n输入代码", "\r\n ```", 3, 6)
            }
            else {
                MDEditor.insert("```输入代码语言\r\n", "\r\n ```", 3, 6)
            }

        },
        //插入图片
        imgUrl: "",
        img: function () {
            modalimg.mustOut()
            if (MDEditor.imgUrl == "") {
                MDEditor.imgUrl = "输入图片URL地址";
            }
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("![输入图片描述", "](" + MDEditor.imgUrl + ")", 2, 6)
            }
            else {
                MDEditor.insert("![", "](" + MDEditor.imgUrl + ")", 2, 0)
            }

            MDEditor.imgUrl = "";


        },
        //插入有序列表
        ol: function () {
            MDEditor.insert("\r\n1. ", "", 5, 0)
        },
        //插入无序列表
        ul: function () {
            MDEditor.insert("\r\n*  ", "", 5, 0)
        },
        //插入标题h1
        h1: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("\r\n# 标题1", "\r\n", 3, 3)
            }
            else {
                MDEditor.insert("\r\n# ", "\r\n", 3, 0)
            }
        },
        //插入标题h2
        h2: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("\r\n## 标题2", "\r\n", 4, 3)
            }
            else {
                MDEditor.insert("\r\n## ", "\r\n", 4, 0)
            }
        },
        //插入标题h3
        h3: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("\r\n### 标题3", "\r\n", 5, 3)
            }
            else {
                MDEditor.insert("\r\n### ", "\r\n", 6, 0)
            }
        },
        //插入标题h4
        h4: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("\r\n#### 标题4", "\r\n", 6, 3)
            }
            else {
                MDEditor.insert("\r\n#### ", "\r\n", 6, 0)
            }
        },
        //插入标题h5
        h5: function () {
            var textarea = document.getElementById("doc-main");
            if (textarea.selectionStart == textarea.selectionEnd) {
                MDEditor.insert("\r\n##### 标题5", "\r\n", 7, 3)
            }
            else {
                MDEditor.insert("\r\n##### ", "\r\n", 7, 0)
            }
        },

        //插入分割线
        divider: function () {
            MDEditor.insert("", "\r\n---\r\n", 7, 0)
        },

        //分段落
        paragraph: function () {
            MDEditor.insert("\r\n\r\n", "", 2, 0)
        },

        //打开文件

        open: function (e) {
            if (typeof FileReader == "undified") {
                alert("您老的浏览器不行了！");
            }
            var resultFile = document.getElementById("file").files[0];

            if (resultFile) {
                var reader = new FileReader();

                reader.readAsText(resultFile, 'UTF-8');
                reader.onload = function (e) {
                    MDEditor.md = this.result;
                    modalfile.mustOut()
                    MDEditor.trs();
                };

                tip.on("成功载入！最后更新日期:" + resultFile.lastModifiedDate, 1, 5000)
            }
        }

//        //保存文件
//        save:function(){
//
//        }


    })
})
