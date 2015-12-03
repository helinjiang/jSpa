"use strict";

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    //project configuration
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %>\n' +
        '* Copyright (c) <%= pkg.author.name %>;\n' +
        '*/\n\n',
        resourcePath: './resource/',
        distPath: './dist/',
        demoResourcePath: './demo/resource/',
        demoDistPath: './demo/dist/',

        // 任务配置信息

        // Grunt任务开始前的清理工作
        clean: {
            dist: ['<%=distPath%>'],
            demoDist: ['<%=demoDistPath%>']
        },

        copy: {
            jsToMin: {
                files: [{
                    expand: true,
                    cwd: '<%=distPath%>',
                    src: ['**/*.js'],
                    dest: '<%=distPath%>',
                    ext: ".min.js"
                }]
            },
            jsToDemo: {
                files: [{
                    expand: true,
                    cwd: '<%=distPath%>',
                    src: ['**/*.js'],
                    dest: '<%=demoDistPath%>/jspa/'
                }]
            },
            demoHtml: {
                files: [{
                    expand: true,
                    cwd: '<%=demoResourcePath%>html/',
                    src: ['**/*.html'],
                    dest: '<%=demoDistPath%>'
                }]
            },
            demoJs: {
                files: [{
                    expand: true,
                    cwd: '<%=demoResourcePath%>js/',
                    src: ['**/*.js'],
                    dest: '<%=demoDistPath%>js/'
                }]
            }
        },

        // 文件合并
        concat: {
            options: {
                separator: ';',
                banner: [
                    '<%=banner%>',
                    'var jSpa = (function(window, undefined) {'
                ].join("\n"),
                footer: ';return LIB;\n})(window);'
            },
            jspa: {
                files: {
                    '<%=distPath%>jspa.js': [
                        '<%=resourcePath%>lib/$.custom.min.js',
                        '<%=resourcePath%>core/util.js',
                        '<%=resourcePath%>core/inview.js',
                        '<%=resourcePath%>core/tinyspa.js',
                        '<%=resourcePath%>core/base.js',
                        '<%=resourcePath%>core/page.js',
                        '<%=resourcePath%>core/app.js',
                        '<%=resourcePath%>core/lib.js'
                    ]
                }
            },
            jspaWithFastclick: {
                files: {
                    '<%=distPath%>jspa-fastclick.js': [
                        '<%=resourcePath%>lib/fastclick.custom.js',
                        '<%=resourcePath%>lib/$.custom.min.js',
                        '<%=resourcePath%>core/util.js',
                        '<%=resourcePath%>core/inview.js',
                        '<%=resourcePath%>core/tinyspa.js',
                        '<%=resourcePath%>core/base.js',
                        '<%=resourcePath%>core/page.js',
                        '<%=resourcePath%>core/app.js',
                        '<%=resourcePath%>core/lib.js'
                    ]
                }
            }
        },

        // js文件压缩
        uglify: {
            main: {
                files: [{
                    expand: true,
                    cwd: '<%=distPath%>',
                    src: ['*.min.js'],
                    dest: '<%=distPath%>'
                }]
            }
        },

        // JS文件语法校验
        jshint: {
            main: [
                '<%=resourcePath%>core/*.js'
            ]
        },

        "jsbeautifier": {
            "default": {
                src: ["<%=distPath%>/*.js"]
            }
        },

        // 通过connect任务，创建一个静态服务器
        connect: {
            options: {
                port: 8000, // 服务器端口号，默认为8000
                hostname: 'localhost', // 服务器地址(可以使用主机名localhost，也能使用IP)
                base: '<%=demoDistPath%>'// 站点的根目录，物理路径(默认为Gruntfile.js所在目录，即值为".")
            },
            livereload: {
                options: {
                    middleware: function (connect, options, middlewares) {
                        /**
                         * 使用connect-livereload模块，生成一个LiveReload脚本，并通过LiveReload脚本，让页面重新加载:
                         * <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
                         */
                        var lrSnippet = require('connect-livereload')({
                            port: grunt.config.get('watch').client.options.livereload
                        });
                        middlewares.unshift(lrSnippet);
                        return middlewares;
                    }
                }
            }
        },

        // 检测文件变更，用于开发环境
        watch: {
            demoHtml: {
                files: ['<%=demoResourcePath%>html/**/*.html'],
                tasks: ['copy:demoHtml', 'htmlstamp:dev']
            },
            demoJs: {
                files: ['<%=demoResourcePath%>js/**/*.js'],
                tasks: ['copy:demoJs', 'htmlstamp:dev']
            },
            js: {
                files: ['<%=resourcePath%>**/*.js'],
                tasks: ['jshint', 'concat', 'copy:jsToDemo', 'htmlstamp:dev']
            },
            // Gruntfile.js变更时：重新加载watch
            configFiles: {
                files: ['Gruntfile.js'],
                options: {
                    reload: true
                }
            },
            // 这里的文件变化之后，自动调用LiveReload刷新浏览器
            client: {
                options: {
                    livereload: 35729 // LiveReload的端口号，默认为35729
                },
                files: ['<%=connect.options.base || "."%>/*.html']
            }
        },

        file_modify: {
            removeDebug: {
                options: {
                    reg: {
                        /**
                         * 去掉包含了 “//@debug” 的行的内容，例如下面这一行因为包含了@debug，则该行内容将被替换为空白
                         * console.log(s1); // @debug remove this line, too!
                         */
                        pattern: '[^\\n]+\\/\\/\\s*@\\s*debug.*'
                    }
                },
                src: ['<%=distPath%>*.min.js']
            }
        },

        htmlstamp: {
            dev: {
                files: {
                    '<%=demoDistPath%>index.html': ['<%=distPath%>**/*.js', '<%=demoDistPath%>**/*.js']
                }
            }
        }
    });

    //测试：创建服务器且免F5实时刷新页面
    grunt.registerTask('live', ['connect', 'watch']);

    // 构建开发版本，也是合入svn的版本
    grunt.registerTask('dev', ['clean', 'jshint', 'concat', 'jsbeautifier', 'copy:jsToDemo', 'copy:demoJs', 'copy:demoHtml', 'htmlstamp:dev']);

    //不压缩，且开启文件变动检测自动编译
    grunt.registerTask('default', ['dev', 'live']);

    //构建发布版本，注意此处不涉及到demo，仅仅是jSpa框架的发布版本
    grunt.registerTask('deploy', ['clean', 'jshint', 'concat', 'jsbeautifier', 'copy:jsToMin', 'file_modify', 'uglify']);
};