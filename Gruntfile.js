/*
 * MapLibre GL widget
 * https://github.com/lets-fiware/maplibre-gl-widget
 *
 * Copyright (c) 2021 Kazuhito Suda
 * Licensed under the BSD 3-Clause License
 */

var ConfigParser = require('wirecloud-config-parser');
var parser = new ConfigParser('src/config.xml');

module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({

        isDev: grunt.option('dev') ? '-dev' : '',
        metadata: parser.getData(),

        eslint: {
            widget: {
                src: 'src/js/**/*.js'
            },
            grunt: {
                options: {
                    configFile: '.eslintrc-node'
                },
                src: 'Gruntfile.js',
            },
            test: {
                options: {
                    configFile: '.eslintrc-jasmine'
                },
                src: ['src/test/**/*.js', '!src/test/fixtures/']
            }
        },

        'curl-dir': {
            libs: {
                src: [
                    'https://raw.githubusercontent.com/Geodan/mapbox-3dtiles/master/dist/Mapbox3DTiles.js',
                    'https://raw.githubusercontent.com/Geodan/mapbox-3dtiles/master/LICENSE',
                    'https://raw.githubusercontent.com/Geodan/mapbox-3dtiles/master/README.md'
                ],
                dest: 'build/lib/lib/mapbox-3dtiles/'
            },
            maps: {
                src: [
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/master/std.json',
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/master/std_vertical.json',
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/master/pale.json',
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js/master/blank.json',
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-3d-like-building/master/building3d.json',
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-3d-like-building/master/building3ddark.json',
                    'https://raw.githubusercontent.com/gsi-cyberjapan/gsivectortile-3d-like-building/master/building3dphoto.json'
                ],
                dest: 'build/map/map/gsi'
            }
        },

        copy: {
            libs: {
                files: [
                    {expand: true, cwd: 'node_modules/maplibre-gl/dist', src: '*', dest: 'build/lib/lib/maplibre-gl/'},
                    {expand: true, cwd: 'node_modules/maplibre-gl/dist', src: '*/*', dest: 'build/lib/lib/maplibre-gl/'},
                    {expand: true, cwd: 'node_modules/maplibre-gl', src: 'README.md', dest: 'build/lib/lib/maplibre-gl/'},
                    {expand: true, cwd: 'node_modules/maplibre-gl', src: 'LICENSE.txt', dest: 'build/lib/lib/maplibre-gl/'},
                    {expand: true, cwd: 'node_modules/three/build', src: 'three.min.js', dest: 'build/lib/lib/js/'},
                    {expand: true, cwd: 'node_modules/@turf/turf', src: 'turf.min.js', dest: 'build/lib/lib/js/'},
                    {expand: true, cwd: 'node_modules/three/examples/js/loaders', src: 'GLTFLoader.js', dest: 'build/lib/lib/js/'}
                ]
            },
            main: {
                files: [
                    {expand: true, cwd: 'src/js', src: '*', dest: 'build/src/js'}
                ]
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
    grunt.loadNpmTasks('grunt-curl');

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
        'clean:temp',
        'copy:main',
        'copy:libs',
        'curl-dir:libs',
        'curl-dir:maps',
        'strip_code',
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
