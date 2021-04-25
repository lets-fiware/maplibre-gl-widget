/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the BSD 3-Clause License
 */

const path = require('path');
const ConfigParser = require('wirecloud-config-parser');
const parser = new ConfigParser('src/config.xml');

module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        isDev: grunt.option('dev') ? '-dev' : '',
        metadata: parser.getData(),

        eslint: {
            widget: {
                options: {
                    configFile: 'src/.eslintrc'
                },
                src: 'src/js/**/*.js'
            },
            grunt: {
                options: {
                    configFile: '.eslintrc'
                },
                src: 'Gruntfile.js',
            },
            test: {
                options: {
                    configFile: 'tests/.eslintrc'
                },
                src: ['src/test/**/*.js', '!src/test/fixtures/']
            }
        },

        copy: {
            libs: {
                files: [
                    {expand: true, cwd: 'node_modules/three/build', src: 'three.min.js', dest: 'build/lib/lib/js/'},
                    {expand: true, cwd: 'node_modules/three/examples/js/loaders', src: 'GLTFLoader.js', dest: 'build/lib/lib/js/'},
                    {expand: true, cwd: 'node_modules/mapbox-3dtiles/dist', src: 'Mapbox3DTiles.js', dest: 'build/lib/lib/js/'}
                ]
            }
        },

        run: {
            copy: {
                cmd: './script/install.sh'
            }
        },

        coveralls: {
            library: {
                src: 'build/coverage/lcov/lcov.info'
            }
        },

        strip_code: {
            multiple_files: {
                src: ['build/src/js/**/*.js']
            }
        },

        compress: {
            widget: {
                options: {
                    mode: 'zip',
                    archive: 'dist/<%= metadata.vendor %>_<%= metadata.name %>_<%= metadata.version %><%= isDev %>.wgt'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: [
                            'DESCRIPTION.md',
                            'css/**/*',
                            'doc/**/*',
                            'map/**/*',
                            'images/**/*',
                            'fonts/**/*',
                            'index.html',
                            'config.xml'
                        ]
                    },
                    {
                        expand: true,
                        cwd: 'build/lib',
                        src: [
                            'lib/**/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: 'build/src',
                        src: [
                            'js/**/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: 'build/map',
                        src: [
                            'map/**/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.',
                        src: [
                            'LICENSE'
                        ]
                    }
                ]
            }
        },

        clean: {
            build: {
                src: ['build']
            },
            temp: {
                src: ['build/src']
            },
            buildtemp: {
                src: ['build/tmp']
            },
            libs: {
                src: ['src/js/node_modules']
            }
        },

        webpack: {
            build: {
                mode: 'production',
                entry: {
                    app: ['@babel/polyfill', './src/js/main.js']
                },
                devtool: 'source-map',
                output: {
                    path: path.resolve(__dirname, 'build/src/js'),
                    libraryTarget: 'umd',
                    filename: 'main.js'
                },
                module: {
                    rules: [
                        {
                            test: /\.js/,
                            exclude: /node_modules/,
                            use: [
                                'babel-loader'
                            ]
                        },
                        {
                            test: /\.css$/,
                            use: [
                                'style-loader',
                                {
                                    loader: 'css-loader',
                                },
                            ],
                        },
                        {
                            test: /\.(png|svg|jpg|gif)$/,
                            use: {
                                loader: 'url-loader',
                                options: {
                                    name: './dist/img/icon/[name].[ext]',
                                },
                            },
                        },
                    ]
                },
            }

        },

        karma: {
            options: {
                customLaunchers: {
                    ChromeNoSandbox: {
                        base: "Chrome",
                        flags: ['--no-sandbox']
                    }
                },
                files: [
                    'node_modules/mock-applicationmashup/dist/MockMP.js',
                    'src/js/MapLibre.js',
                    'tests/helper/Mapbox3DTiles.js',
                    'tests/helper/maplibregl.js',
                    'tests/helper/turf.js',
                    'tests/js/*Spec.js'
                ],
                exclude: [
                    'src/js/main.js',
                ],
                frameworks: ['jasmine'],
                reporters: ['progress'],
                browsers: ['Chrome', 'Firefox'],
                singleRun: true
            },
            widget: {
                options: {
                    coverageReporter: {
                        type: 'html',
                        dir: 'build/coverage'
                    },
                    reporters: ['progress', 'coverage'],
                    preprocessors: {
                        'src/js/*.js': ['coverage'],
                    }
                }
            },
            widgetci: {
                options: {
                    junitReporter: {
                        "outputDir": 'build/test-reports'
                    },
                    reporters: ['junit', 'coverage'],
                    browsers: ['ChromeNoSandbox', 'Firefox'],
                    coverageReporter: {
                        reporters: [
                            {type: 'cobertura', dir: 'build/coverage', subdir: 'xml'},
                            {type: 'lcov', dir: 'build/coverage', subdir: 'lcov'},
                        ]
                    },
                    preprocessors: {
                        "src/js/*.js": ['coverage'],
                    }
                }
            },
            widgetdebug: {
                options: {
                    singleRun: false
                }
            }
        },

        wirecloud: {
            options: {
                overwrite: false
            },
            publish: {
                file: 'dist/<%= metadata.vendor %>_<%= metadata.name %>_<%= metadata.version %><%= isDev %>.wgt'
            }
        }
    });

    grunt.loadNpmTasks('grunt-wirecloud');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-run');


    grunt.registerTask('test', [
        'eslint',
        'karma:widget'
    ]);

    grunt.registerTask('debug', [
        'eslint',
        'karma:widgetdebug'
    ]);

    grunt.registerTask('ci', [
        'eslint',
        'karma:widgetci',
        'coveralls'
    ]);

    grunt.registerTask('build', [
        'run:copy',
        'copy:libs',
        'strip_code',
        'webpack:build',
        'compress:widget'
    ]);

    grunt.registerTask('default', [
        // 'test',
        'build'
    ]);

    grunt.registerTask('publish', [
        'default',
        'wirecloud'
    ]);

};
