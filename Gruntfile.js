module.exports = function (grunt) {

    grunt.log.writeln("==========================");
    grunt.log.writeln("==========================");
    grunt.log.writeln("grunt自动脚本开始运行......");
    grunt.log.writeln("==========================");
    grunt.log.writeln("==========================");
    grunt.log.writeln("====请稍后，先观赏神兽====");
    grunt.log.writeln(" ");
    grunt.log.writeln(" ");
    grunt.log.writeln(" ");
    grunt.log.writeln("上帝的骑宠，上古时期世界的霸主。");

    grunt.log.writeln("┏┛┻━━━┛┻┓");
    grunt.log.writeln("┃｜｜｜｜｜｜｜┃");
    grunt.log.writeln("┃　　　━　　　┃");
    grunt.log.writeln("┃　┳┛ 　┗┳ 　┃");
    grunt.log.writeln("┃　　　　　　　┃");
    grunt.log.writeln("┃　　　┻　　　┃");
    grunt.log.writeln("┃　　　　　　　┃");
    grunt.log.writeln("┗━┓　　　┏━┛");
    grunt.log.writeln("　　┃　史　┃　　");
    grunt.log.writeln("　　┃　诗　┃　　");
    grunt.log.writeln("　　┃　之　┃　　");
    grunt.log.writeln("　　┃　宠　┃");
    grunt.log.writeln("　　┃　　　┗━━━┓");
    grunt.log.writeln("　　┃经验与我同在　┣┓");
    grunt.log.writeln("　　┃攻楼专用宠物　┃");
    grunt.log.writeln("　　┗┓┓┏━┳┓┏┛");
    grunt.log.writeln("　　　┃┫┫　┃┫┫");
    grunt.log.writeln("　　　┗┻┛　┗┻┛");
    grunt.log.writeln(" ");
    grunt.log.writeln(" ");
    grunt.log.writeln(" ");

    grunt.log.writeln("任务执行详情：");
    grunt.log.writeln("");


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: ['build']
            }
        },

        copy: {
            font: {
                files: [
                    {expand: true, cwd: 'src/font', src: ['*.*'], dest: 'build/src/font'}
                ]
            },
            fonts: {
                files: [
                    {expand: true, cwd: 'src/fonts', src: ['*.*'], dest: 'build/src/fonts'}
                ]
            },
            images: {
                files: [
                    {expand: true, cwd: 'src/images', src: ['*.{png,jpg,jpeg,gif}'], dest: 'build/src/images'}
                ]
            },
            html:{
                files:[
                    {expand: true, cwd: 'package', src: ['**/*.html'], dest: 'build/package'},
                    {expand: true, cwd: 'ui', src: ['**/*.html'], dest: 'build/ui'},
                    {expand: true, cwd: './', src: ['*.html'], dest: 'build'}
                ]
            }
        },

        // 文件合并
        //concat: {
        //    options: {
        //        separator: ';',
        //        stripBanners: true
        //    },
        //    js: {
        //        src: [
        //            "src/js/*.js"
        //        ],
        //        dest: "dist/html/js/app.js"
        //    },
        //    css: {
        //        src: [
        //            "src/css/*.css"
        //        ],
        //        dest: "dist/html/css/main.css"
        //    }
        //},

        //压缩JS
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: true
            },
            beautify: {
                //中文ascii化，非常有用！防止中文乱码的神配置
                ascii_only: true
            },

            //压缩JS文件
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'plugins',
                        src: '**/*.js',
                        dest: 'build/plugins'
                    },
                    {
                        expand: true,
                        cwd: 'package',
                        src: '**/*.js',
                        dest: 'build/package'
                    },
                    {
                        expand: true,
                        cwd: 'ui',
                        src: '**/*.js',
                        dest: 'build/ui'
                    },
                    {
                        expand: true,
                        cwd: 'src',
                        src: '**/*.js',
                        dest: 'build/src'
                    },
                    {
                        expand: true,
                        cwd: "./",
                        src: '*.js',
                        dest: 'build'
                    }
                ]
            }

            //压缩合并路由，配置，引入
            //, release: {
            //    files: [
            //        {
            //            'build/all-f.js': ['config.js', 'router-f.js', "soul/front/vm.js", "./plugins/regCheckOut.js", "./plugins/door.js", "./plugins/call.js", "./plugins/attention.js"]
            //        },
            //        {
            //            'build/all-a.js': ['config.js', 'router-a.js',"./soul/admin/vm.js","./soul/admin/include.js","./plugins/door.js","./plugins/call.js","./plugins/tips.js"]
            //        }
            //    ]}


        },

        //压缩CSS
        cssmin: {
            prod: {
                options: {
                    report: 'gzip'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['css/*.css'],
                        dest: 'build/src'
                    },
                    {
                        expand: true,
                        cwd: 'package',
                        src: ['**/*.css'],
                        dest: 'build/package'
                    }
                ]
            }
        },

        //压缩图片
        //imagemin: {
        //    prod: {
        //        options: {
        //            optimizationLevel: 7,
        //            pngquant: true
        //        },
        //        files: [
        //            {expand: true, cwd: 'dist/html', src: ['images/*.{png,jpg,jpeg,gif,webp,svg}'], dest: 'dist/html'}
        //        ]
        //    }
        //},

        // 处理html中css、js 引入合并问题
        //usemin: {
        //    html: 'dist/html/*.html'
        //},

        //压缩HTML
        htmlmin: {
            dist:{
                options: {
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: false,
                    useShortDoctype: true,
                    removeEmptyAttributes: false,
                    removeOptionalTags: true
                },
                    files: [
                    {expand: true, cwd: 'build', src: ['**/**/*.html'], dest: 'build'}
                    ]
            }

        }

    });


    //grunt.registerTask('prod', [
    //    'copy',                 //复制文件
    //    //'concat',               //合并文件
    //    //'imagemin',             //图片压缩
    //    'cssmin',               //CSS压缩
    //    'uglify',               //JS压缩
    //    //'usemin',               //HTML处理
    //    'htmlmin'               //HTML压缩
    //]);

    //require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.loadNpmTasks('grunt-contrib-clean')//：删除文件。
    grunt.loadNpmTasks('grunt-contrib-compass')//：使用compass编译sass文件。
    grunt.loadNpmTasks('grunt-contrib-concat')//：合并文件。
    grunt.loadNpmTasks('grunt-contrib-copy')//：复制文件。
    grunt.loadNpmTasks('grunt-contrib-cssmin')//：压缩以及合并CSS文件。
    grunt.loadNpmTasks('grunt-contrib-htmlmin')//:压缩html
    grunt.loadNpmTasks('grunt-contrib-imagemin')//：图像压缩模块。
    grunt.loadNpmTasks('grunt-contrib-jshint')//：检查JavaScript语法。
    grunt.loadNpmTasks('grunt-contrib-uglify')//：压缩以及合并JavaScript文件。
    grunt.loadNpmTasks('grunt-contrib-watch')//：监视文件变动，做出相应动作。

    grunt.registerTask('default', [
        'clean',
        'copy',                 //复制文件
        //'concat',               //合并文件
        //'imagemin',             //图片压缩
        'cssmin',               //CSS压缩
        'uglify',               //JS压缩
        //'usemin',               //HTML处理
        'htmlmin'
    ])             //HTML压缩]);

    grunt.registerTask('h',['htmlmin'])
};