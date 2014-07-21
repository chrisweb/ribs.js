module.exports = function(grunt) {

    // grunt configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });

    // load uglify plugin
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // default task
    grunt.registerTask('default', ['uglify']);

};