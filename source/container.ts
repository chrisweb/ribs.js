'use strict';

import _ = require('underscore');
import $ = require('jquery');
import ES6Promise = require('es6-promise');
import Promise = ES6Promise.Promise;

module Container {

    var containers: any = {};
    var bodyElement: JQuery = $('body');
        
    /**
     * 
     * dispatch the views of all the container or by a container selector
     * 
     * @param {type} containerSelector
     * @param {type} options
     * 
     * @returns Promise<void>
     */
    export function dispatch(containerSelector?: string, options?: Ribs.ContainerOptions): Promise<any>|void {

        if (containerSelector === undefined) {

            let promises: Promise<any>[] = [];

            _.each(this.containers, function(views, containerSelector) {

                let dispatchViewResult = this.dispatchViews.call(this, views, containerSelector, options);

                if (dispatchViewResult instanceof Promise) {
                    promises.push(dispatchViewResult);
                }

            });

            if (promises.length) {
                return Promise.all(promises);
            }

        } else {

            var views = this.containers[containerSelector];

            return this.dispatchViews.call(this, views, containerSelector, options);

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
    export function add(containerSelector: string, view: Ribs.View) {

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
    export function remove(containerSelector: string, view: Ribs.View) {

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
    export function clear(containerSelector: string) {

        let views: Ribs.View[] = this.containers[containerSelector];

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
    function dispatchViews(views: Ribs.View[], containerSelector: string, options: Ribs.ContainerOptions): Promise<any>|void {

        let promises: Promise<any>[] = [];

        _.each(views, (view) => {

            let doAppend = (viewHtml: JQuery) => {
                if (options !== undefined
                    && _.has(options, 'insertMode')
                    && options.insertMode === 'prepend') {

                    this.bodyElement.find(containerSelector).prepend(viewHtml);

                } else {

                    this.bodyElement.find(containerSelector).append(viewHtml);

                }
            };

            var viewCreate = view.create();

            if (viewCreate instanceof Promise) {

                promises.push(viewCreate.then(doAppend));

            } else {

                doAppend(<JQuery>viewCreate);

            }


        });

        if (promises.length) {
            return Promise.all(promises);
        }
        
    }

}

export = Container;