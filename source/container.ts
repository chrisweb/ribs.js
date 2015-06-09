'use strict';

import _ = require('underscore');

export class Container {

    containers: any = {};
    bodyElement = $('body');
        
    /**
     * 
     * dispatch the views of all the container or by a container selector
     * 
     * @param {type} containerSelector
     * @param {type} options
     * 
     * @returns {undefined}
     */
    dispatch (containerSelector, options) {
            
        if (containerSelector === undefined) {

            _.each(this.containers, function(views, containerSelector) {

                this.dispatchViews.call(this, views, containerSelector, options);

            });

        } else {

            var views = this.containers[containerSelector];

            this.dispatchViews.call(this, views, containerSelector, options);

        }

    }

    /**
     * 
     * add a view to a container
     * 
     * @param {type} containerSelector
     * @param {type} view
     * @returns {undefined}
     */
    add (containerSelector, view) {

        if (this.containers[containerSelector] === undefined) {

            this.containers[containerSelector] = [];

        }

        this.containers[containerSelector].push(view);

    }
        
    /**
     * 
     * remove a view from the list, for a given selector
     * just remove the view from the list, don't close it
     * 
     * @param {type} containerSelector
     * @param {type} view
     * 
     * @returns {undefined}
     */
    remove (containerSelector, view) {

        if (this.containers[containerSelector] === undefined) {

            return;

        }
            
        var indexOf = this.containers[containerSelector].indexOf(view);
            
        if (indexOf > -1) {
                
            this.containers[containerSelector].splice(indexOf, 1);
                
        }

    }

    /**
     * 
     * clear the view for a given selector
     * closes the view and also removes it from the container views list
     * 
     * @param {type} containerSelector
     * 
     * @returns {undefined}
     */
    clear (containerSelector) {

        var views: Ribs.View[] = this.containers[containerSelector];

        _.each<Ribs.View>(views, function (view) {

            view.close();

        });

        delete this.containers[containerSelector];

    }
    
    /**
     * 
     * (private) dispatch the views
     * 
     * @param {type} views
     * @param {type} containerSelector
     * @param {type} options
     * 
     * @returns {undefined}
     */
    private dispatchViews (views: Ribs.View[], containerSelector, options) {
        
        _.each(views, (view) => {

            var viewHtml = view.create();

            if (options !== undefined
                && _.has(options, 'insertMode')
                && options.insertMode === 'prepend') {

                this.bodyElement.find(containerSelector).prepend(<any>viewHtml);

            } else {

                this.bodyElement.find(containerSelector).append(<any>viewHtml);

            }

        });
        
    }

}