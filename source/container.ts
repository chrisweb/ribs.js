'use strict';

import _ = require('underscore');
import $ = require('jquery');
import ES6Promise = require('es6-promise');
import Promise = ES6Promise.Promise;

module Container {

    var containers: { [selector: string]: Ribs.View[] } = {};
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

            _.each(containers, function(views, containerSelector) {

                let dispatchViewResult = dispatchViews(views, containerSelector, options);

                if (dispatchViewResult instanceof Promise) {
                    promises.push(dispatchViewResult);
                }

            });

            if (promises.length) {
                return Promise.all(promises);
            }

        } else {

            var views = containers[containerSelector];

            return dispatchViews(views, containerSelector, options);

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

        if (containers[containerSelector] === undefined) {

            containers[containerSelector] = [];

        }

        containers[containerSelector].push(view);

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

        if (containers[containerSelector] === undefined) {

            return;

        }
            
        var indexOf = containers[containerSelector].indexOf(view);
            
        if (indexOf > -1) {
                
            containers[containerSelector].splice(indexOf, 1);
                
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

        let views: Ribs.View[] = containers[containerSelector];

        _.each<Ribs.View>(views, function (view) {

            view.close();

        });

        delete containers[containerSelector];

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

        let $container = bodyElement.find(containerSelector);
        if ($container.length === 0) {
            $container = bodyElement.filter(containerSelector);
            if ($container.length === 0) {
                $container = $();
            }
        }

        _.each(views, (view) => {

            let doAppend = (viewHtml: JQuery) => {
                if (options !== undefined
                    && _.has(options, 'insertMode')
                    && options.insertMode === 'prepend') {

                    $container.prepend(viewHtml);

                } else {

                    $container.append(viewHtml);

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