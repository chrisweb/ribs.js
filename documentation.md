ribs documentation

every view template file (ejs) must have at least one and not more then one root html element that wraps all other content of the template, don't use more then one root element, if you have multiple elements just wrap them into a root element, for example a div or section element

you can define a collection or model in your view and they will automatically get rendered

for the collection you have to define the modelsub view (partial) that will get used when looping through the models of the collection

if a collection got defined you can also set the selector of the element into which the model view will be added

if you dont define any selector the view will use the class list by default

if you dont want to define a model or collection but just pass some variables to the template, then add those to the options object, using as property name variables and as value an object containing all the variables key values
 