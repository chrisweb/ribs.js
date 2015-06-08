module.exports = function(grunt) {

    // grunt configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        
        config: {
            'client': './',
            'server': '../Server'
        },
        
        // problems:
        // dont include backbone, underscore, jquery
        // wrap umd with intro and outro

        // require js
        // https://github.com/gruntjs/grunt-contrib-requirejs
        requirejs: {
            app_build: {
                options: {
                    baseUrl: 'src',
                    preserveLicenseComments: false,
                    name: 'ribs.js',
                    out: 'build/ribs.js',
                    findNestedDependencies: true,
                    optimize: 'uglify2',
                    uglify2: {
                        output: {
                            beautify: false
                        },
                        compress: {
                            sequences: false,
                            global_defs: {
                                DEBUG: false
                            }
                        },
                        warnings: false,
                        mangle: false
                    },
                    useStrict: true
                }
            }
        }
    });

    // load uglify plugin
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // default task
    grunt.registerTask('default', ['requirejs']);

};