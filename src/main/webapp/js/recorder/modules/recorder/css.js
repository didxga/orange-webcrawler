"use strict";
/**
 * CSS Module:
 *  - extract CSS rules from stylesheets
 *  - extract CSS fragment related to an element
 */
RecorderApp.registerModule('css',(function() {
    var R;
    var inheritedStyleNames = {
	    "border-collapse": 1,
	    "border-spacing": 1,
	    "border-style": 1,
	    "caption-side": 1,
	    "color": 1,
	    "cursor": 1,
	    "direction": 1,
	    "empty-cells": 1,
	    "font": 1,
	    "font-family": 1,
	    "font-size-adjust": 1,
	    "font-size": 1,
	    "font-style": 1,
	    "font-variant": 1,
	    "font-weight": 1,
	    "letter-spacing": 1,
	    "line-height": 1,
	    "list-style": 1,
	    "list-style-image": 1,
	    "list-style-position": 1,
	    "list-style-type": 1,
	    "quotes": 1,
	    "text-align": 1,
	    "text-decoration": 1,
	    "text-indent": 1,
	    "text-shadow": 1,
	    "text-transform": 1,
	    "white-space": 1,
	    "word-spacing": 1
    };
    
    // TODO kind of global, need to check
    var CSSRuleMap = {},StyleSheetCache, getElementXPath;
    
    
    var SourceLink = function(url, line, type, object, instance) {
        this.href = url;
        this.instance = instance;
        this.line = line;
        this.type = type;
        this.object = object;
    };

    SourceLink.prototype = {
        toString: function()
        {
            return this.href;
        },
        toJSON: function() // until 3.1...
        {
            return "{\"href\":\""+this.href+"\", "+
                (this.line?("\"line\":"+this.line+","):"")+
                (this.type?(" \"type\":\""+this.type+"\","):"")+
                        "}";
        }
    };
    
    
    var CssExtractor = function() {
    };

    CssExtractor.prototype = {
		getInheritedRules : function (element, sections,
			usedProps) {
			var parent = element.parentNode;
			if (parent && parent.nodeType == 1) {
				this.getInheritedRules(parent, sections,
					usedProps);

				var rules = [];
				this.getElementRules(parent, rules, usedProps,
					true);

				if (rules.length)
					sections.splice(0, 0, {
						element : parent,
						rules : rules
					});
			}
		},
		getElementRules : function (element, rules, usedProps,
			inheritMode) {
			var inspectedRules,
			displayedRules = {};

			inspectedRules = R.css.getElementCSSRules(element);

			if (inspectedRules) {
				for (var i = 0, length = inspectedRules.length; i < length; ++i) {
					var ruleId = inspectedRules[i];
					var ruleData = CSSRuleMap[ruleId];
					var rule = ruleData.rule;

					var ssid = ruleData.styleSheetId;
					var parentStyleSheet = StyleSheetCache
						.get(ssid);

					var href = parentStyleSheet.externalURL ? parentStyleSheet.externalURL
						 : parentStyleSheet.href; // Null
					// means
					// inline

					var instance = null;
					// var instance =
					// getInstanceForStyleSheet(rule.parentStyleSheet,
					// element.ownerDocument);

					var isSystemSheet = false;
					// var isSystemSheet =
					// isSystemStyleSheet(rule.parentStyleSheet);

					if (isSystemSheet
						 && !Firebug.showUserAgentCSS) // This
						// removes
						// user
						// agent
						// rules
						continue;

					if (!href)
						href = element.ownerDocument.location.href; // http://code.google.com/p/fbug/issues/detail?id=452

					var props = this.getRuleProperties(
							this.context, rule, inheritMode);
					if (inheritMode && !props.length)
						continue;

					//
					// var line = domUtils.getRuleLine(rule);
					var line;

					var ruleId = this.createRuleId(ruleData);
					var sourceLink = new SourceLink(href, line,
							"css", rule, instance);

					this.markOverridenProps(props, usedProps,
						inheritMode);

					rules.splice(0, 0, {
						rule : rule,
						id : ruleId,
						selector : ruleData.selector,
						sourceLink : sourceLink,
						props : props,
						inherited : inheritMode,
						isSystemSheet : isSystemSheet
					});
				}
			}

			if (element.style)
				this.getStyleProperties(element, rules,
					usedProps, inheritMode);

			if (R.trace.DBG_CSS) {
			    R.trace.log("getElementRules "
					 + rules.length + " rules for "
					 + getElementXPath(element), rules);
			}
		},
		markOverridenProps : function (props, usedProps,
			inheritMode) {
			for (var i = 0; i < props.length; ++i) {
				var prop = props[i];
				if (usedProps.hasOwnProperty(prop.name)) {
					var deadProps = usedProps[prop.name]; // all
					// previous
					// occurrences
					// of
					// this
					// property
					for (var j = 0; j < deadProps.length; ++j) {
						var deadProp = deadProps[j];
						if (!deadProp.disabled
							 && !deadProp.wasInherited
							 && deadProp.important
							 && !prop.important)
							prop.overridden = true; // new
						// occurrence
						// overridden
						else if (!prop.disabled)
							deadProp.overridden = true; // previous
						// occurrences
						// overridden
					}
				} else
					usedProps[prop.name] = [];

				prop.wasInherited = inheritMode ? true : false;
				usedProps[prop.name].push(prop); // all
				// occurrences
				// of a
				// property
				// seen so
				// far, by
				// name
			}
		},

		getRuleProperties : function (context, rule, inheritMode) {
			var props = this.parseCSSProps(rule.style,
					inheritMode);

			// TODO: xxxpedro port to firebug: variable leaked
			// into global namespace
			// var line = domUtils.getRuleLine(rule);
			this.sortProperties(props);

			return props;
		},
		getStyleProperties : function (element, rules,
			usedProps, inheritMode) {
			var props = this.parseCSSProps(element.style,
					inheritMode);

			this.sortProperties(props);
			this.markOverridenProps(props, usedProps,
				inheritMode);

			if (props.length)
				rules.splice(0, 0, {
					rule : element,
					id : getElementXPath(element),
					selector : "element.style",
					props : props,
					inherited : inheritMode
				});
		},
		parseCSSProps : function (style, inheritMode) {
			var props = [];

			if (R.css.config.expandShorthandProps) {
				var count = style.length - 1,
				index = style.length;
				while (index--) {
					var propName = style.item(count - index);
					this
					.addProperty(
						propName,
						style
						.getPropertyValue(propName),
						!!style
						.getPropertyPriority(propName),
						false, inheritMode, props);
				}
			} else {
				var lines = style.cssText
					.match(/(?:[^;\(]*(?:\([^\)]*?\))?[^;\(]*)*;?/g);
				var propRE = /\s*([^:\s]*)\s*:\s*(.*?)\s*(! important)?;?$/;
				var line,
				i = 0;
				// TODO: xxxpedro port to firebug: variable
				// leaked into global namespace
				var m;
				while (line = lines[i++]) {
					m = propRE.exec(line);
					if (!m)
						continue;
					// var name = m[1], value = m[2], important
					// = !!m[3];
					if (m[2])
						this.addProperty(m[1], m[2], !!m[3],
							false, inheritMode, props);
				};
			}

			return props;
		},

		addProperty : function (name, value, important,
			disabled, inheritMode, props) {
			name = name.toLowerCase();

			if (inheritMode && !inheritedStyleNames[name])
				return;

			name = this.translateName(name, value);
			if (name) {
				value = this.stripUnits(this.rgbToHex(value));
				important = important ? " !important" : "";

				var prop = {
					name : name,
					value : value,
					important : important,
					disabled : disabled
				};
				props.push(prop);
			}
		},

		translateName : function (name, value) {
			// Don't show these proprietary Mozilla properties
			if ((value == "-moz-initial" && (name == "-moz-background-clip"
						 || name == "-moz-background-origin" || name == "-moz-background-inline-policy"))
				 || (value == "physical" && (name == "margin-left-ltr-source"
						 || name == "margin-left-rtl-source"
						 || name == "margin-right-ltr-source" || name == "margin-right-rtl-source"))
				 || (value == "physical" && (name == "padding-left-ltr-source"
						 || name == "padding-left-rtl-source"
						 || name == "padding-right-ltr-source" || name == "padding-right-rtl-source")))
				return null;

			// Translate these back to the form the user
			// probably expects
			if (name == "margin-left-value")
				return "margin-left";
			else if (name == "margin-right-value")
				return "margin-right";
			else if (name == "margin-top-value")
				return "margin-top";
			else if (name == "margin-bottom-value")
				return "margin-bottom";
			else if (name == "padding-left-value")
				return "padding-left";
			else if (name == "padding-right-value")
				return "padding-right";
			else if (name == "padding-top-value")
				return "padding-top";
			else if (name == "padding-bottom-value")
				return "padding-bottom";
			// XXXjoe What about border!
			else
				return name;
		},

		// Local helpers, need to put those elsewhere??
		sortProperties : function (props) {
			props.sort(function (a, b) {
				return a.name > b.name ? 1 : -1;
			});
		},
		stripUnits : function (value) {
			// remove units from '0px', '0em' etc. leave
			// non-zero units in-tact.
			return value
			.replace(
				/(url\(.*?\)|[^0]\S*\s*)|0(%|em|ex|px|in|cm|mm|pt|pc)(\s|$)/gi,
				this.stripUnitsReplacer);
		},
		stripUnitsReplacer : function (_, skip, remove,
			whitespace) {
			return skip || ('0' + whitespace);
		},
		rgbToHex : function rgbToHex(value) {
			return value
			.replace(
				/\brgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/gi,
				this.rgbToHexReplacer);
		},
		rgbToHexReplacer : function (_, r, g, b) {
			return '#'
			 + ((1 << 24) + (r << 16) + (g << 8) + (b << 0))
			.toString(16).substr(-6)
			.toUpperCase();
		},
		createRuleId : function (rule) {
			var dataToHash = rule.selector + rule.rule.cssText,
			length = dataToHash.length,
			hash = 0,
			i,
			char;
			if (length == 0)
				return hash;
			for (i = 0; i < length; i++) {
				char = dataToHash.charCodeAt(i);
				hash = ((hash << 5) - hash) + char;
				hash |= 0; // Convert to 32bit integer
			}
			return hash;
		}
	};


    CssExtractor.prototype.constructor = CssExtractor;
    
    
    var CssModule = function() {

	// TODO verify all these variables
	var ElementCache,
	    globalCSSRuleIndex = -1,
	    externalStyleSheetURLs = [],
	    processAllStyleSheetsTimeout = null,
	    ElementCSSRulesMap = {};
	
	var sortElementRules = function(a, b) {
	    var ruleA = CSSRuleMap[a];
	    var ruleB = CSSRuleMap[b];
	    
	    var specificityA = ruleA.specificity;
	    var specificityB = ruleB.specificity;
	    
	    if (specificityA > specificityB)
	        return 1;
	    
	    else if (specificityA < specificityB)
	        return -1;
	    
	    else
	        return ruleA.order > ruleB.order ? 1 : -1;
	};
	
	var reSelectorTag = /(^|\s)(?:\w+)/g;


	var getCSSRuleSpecificity = function(selector) {
	    var reSelectorClass = /\.[\w\d_-]+/g;
	    var reSelectorId = /#[\w\d_-]+/g;
	    
	    var match = selector.match(reSelectorTag);
	    var tagCount = match ? match.length : 0;
	    
	    match = selector.match(reSelectorClass);
	    var classCount = match ? match.length : 0;
	    
	    match = selector.match(reSelectorId);
	    var idCount = match ? match.length : 0;
	    
	    return tagCount + 10*classCount + 100*idCount;
	};
	
	var processStyleSheet = function(doc, styleSheet) {
	    if (styleSheet.restricted)
	        return;
	    
	    var rules = R.utils.isIE ? styleSheet.rules : styleSheet.cssRules;
	    
	    var ssid = StyleSheetCache(styleSheet);
	    if(!rules){return;}
	    for (var i=0, length=rules.length; i<length; i++) {
	        var rid = ssid + ":" + i;
	        var rule = rules[i];
	        var selector = rule.selectorText;
	        
	        if (R.utils.isIE) {
	            selector = selector.replace(reSelectorTag, function(s){return s.toLowerCase();});
	        }
	        
	        // TODO: xxxpedro break grouped rules (,) into individual rules, otherwise
	        // it will result in a overestimated value for getCSSRuleSpecificity
	        CSSRuleMap[rid] =
	        {
	            styleSheetId: ssid,
	            styleSheetIndex: i,
	            order: ++globalCSSRuleIndex,
	            // if it is a grouped selector, do not calculate the specificity
	            // because the correct value will depend of the matched element.
	            // The proper specificity value for grouped selectors are calculated
	            // via getElementCSSRules(element)
	            specificity: selector && selector.indexOf(",") != -1 ? 
	                getCSSRuleSpecificity(selector) : 
	                0,
	            
	            rule: rule,
	            selector: selector,
	            cssText: rule.style ? rule.style.cssText : rule.cssText ? rule.cssText : ""        
	        };
	        
	        var elements = R.utils.Selector(selector, doc);
	        
	        for (var j=0, elementsLength=elements.length; j<elementsLength; j++) {
	            var element = elements[j];
	            var eid = ElementCache(element);
	            
	            if (!ElementCSSRulesMap[eid])
	                ElementCSSRulesMap[eid] = [];
	            
	            ElementCSSRulesMap[eid].push(rid);
	        }
	        
	    }
	};
	
	this.config = {};
	
	this.init = function(moduleName){
	    R = RecorderApp.modules;
	    ElementCache = R.cache.Element;
	    StyleSheetCache = R.cache.StyleSheet;
	    getElementXPath = R.utils.getElementXPath;
	    if (RecorderApp.modules.trace.DBG_INITIALIZE) {
		RecorderApp.modules.trace.log(moduleName, 'initialization completed');
	    }
	};
	
	// TODO not used for now
	this.loadExternalStylesheet = function(doc, styleSheetIterator, styleSheet) {
	    var url = styleSheet.href;
	    // TODO find/replace firebug
	    styleSheet.firebugIgnore = true;

	    // TODO: check for null and error responses
	    var source = R.Proxy.load(url);
	    
	    // convert relative addresses to absolute ones  
	    source = source.replace(/url\(([^\)]+)\)/g, function(a,name){
	    
	        var hasDomain = /\w+:\/\/./.test(name);
	        
	        if (!hasDomain)
	        {
	            name = name.replace(/^(["'])(.+)\1$/, "$2");
	            var first = name.charAt(0);
	            
	            // relative path, based on root
	            if (first == "/")
	            {
	                // TODO: xxxpedro move to lib or Firebug.Lite.something
	                // getURLRoot
	                var m = /^([^:]+:\/{1,3}[^\/]+)/.exec(url);
	                
	                return m ? 
	                    "url(" + m[1] + name + ")" :
	                    "url(" + name + ")";
	            }
	            // relative path, based on current location
	            else
	            {
	                // TODO: xxxpedro move to lib or Firebug.Lite.something
	                // getURLPath
	                var path = url.replace(/[^\/]+\.[\w\d]+(\?.+|#.+)?$/g, "");
	                
	                path = path + name;
	                
	                var reBack = /[^\/]+\/\.\.\//;
	                while(reBack.test(path))
	                {
	                    path = path.replace(reBack, "");
	                }
	                
	                //console.log("url(" + path + ")");
	                
	                return "url(" + path + ")";
	            }
	        }
	        
	        // if it is an absolute path, there is nothing to do
	        return a;
	    });
	    
	    var oldStyle = styleSheet.ownerNode;
	    
	    if (!oldStyle) return;
	    
	    if (!oldStyle.parentNode) return;
	    
	    var style = createGlobalElement("style");
	    style.setAttribute("charset","utf-8");
	    style.setAttribute("type", "text/css");
	    style.innerHTML = source;

	    //debugger;
	    oldStyle.parentNode.insertBefore(style, oldStyle.nextSibling);
	    oldStyle.parentNode.removeChild(oldStyle);
	    
	    doc.styleSheets[doc.styleSheets.length-1].externalURL = url;
	    
	    if (R.trace.DBG_CSS) {
		R.trace.log(url, "call " + externalStyleSheetURLs.length, source);
	    }
	    
	    externalStyleSheetURLs.pop();
	    
	    if (processAllStyleSheetsTimeout)
	    {
	        clearTimeout(processAllStyleSheetsTimeout);
	    }
	    
	    processAllStyleSheetsTimeout = setTimeout(function() {
		if (R.trace.DBG_CSS) {
		    R.trace.log("processing all style sheets");    
		}
	        
		// TODO can we use this here?
		R.css.processAllStyleSheets(doc, styleSheetIterator);
	        processAllStyleSheetsTimeout = null;
	    },200);
	};

	this.processAllStyleSheets = function(doc, styleSheetIterator) {
	    styleSheetIterator = styleSheetIterator || processStyleSheet;
	    
	    globalCSSRuleIndex = -1;
	    
	    var styleSheets = doc.styleSheets;
	    var importedStyleSheets = [];
	    
	    if (R.trace.DBG_CSS) {
		var start = new Date().getTime();
	    }
	    
	    for(var i=0, length=styleSheets.length; i<length; i++) {
	        try {
	            var styleSheet = styleSheets[i];
	            
	            if ("firebugIgnore" in styleSheet) continue;
	            
	            // we must read the length to make sure we have permission to read 
	            // the stylesheet's content. If an error occurs here, we cannot 
	            // read the stylesheet due to access restriction policy
	            var rules = R.utils.isIE ? styleSheet.rules : styleSheet.cssRules;
	        } catch(e) {
	            externalStyleSheetURLs.push(styleSheet.href);
	            styleSheet.restricted = true;
	            var ssid = StyleSheetCache(styleSheet);
	            
	            /// TODO: xxxpedro external css
	            //loadExternalStylesheet(doc, styleSheetIterator, styleSheet);
	        }
	        
	        // process internal and external styleSheets
	        styleSheetIterator(doc, styleSheet);
	        
	        var importedStyleSheet, importedRules;
	        
	        // process imported styleSheets in IE
	        if (R.utils.isIE) {
	            var imports = styleSheet.imports;
	            
	            for(var j=0, importsLength=imports.length; j<importsLength; j++) {
	                try {
	                    importedStyleSheet = imports[j];
	                    // we must read the length to make sure we have permission
	                    // to read the imported stylesheet's content. 
	                    importedRules = importedStyleSheet.rules;
	                    importedRules.length;
	                } catch(e) {
	                    externalStyleSheetURLs.push(styleSheet.href);
	                    importedStyleSheet.restricted = true;
	                    var ssid = StyleSheetCache(importedStyleSheet);
	                }
	                
	                styleSheetIterator(doc, importedStyleSheet);
	            }
	        }
	        // process imported styleSheets in other browsers
	        else if (rules) {
	            for(var j=0, rulesLength=rules.length; j<rulesLength; j++) {
	                try {
	                    var rule = rules[j];
	                    importedStyleSheet = rule.styleSheet;
	                    if (importedStyleSheet) {
	                        // we must read the length to make sure we have permission
	                        // to read the imported stylesheet's content. 
	                        importedRules = importedStyleSheet.cssRules;
	                        importedRules.length;
	                    } else {
	                	break;
	                    }
	                } catch(e) {
	                    externalStyleSheetURLs.push(styleSheet.href);
	                    importedStyleSheet.restricted = true;
	                    var ssid = StyleSheetCache(importedStyleSheet);
	                }

	                styleSheetIterator(doc, importedStyleSheet);
	            }
	        }
	    }
	    
	    if (R.trace.DBG_CSS) {
		R.trace.log("processAllStyleSheets", "all stylesheet rules processed in " + (new Date().getTime() - start) + "ms");
	    }
	};

	this.getElementCSSRules = function(element) {
	    var eid = ElementCache(element);
	    var rules = ElementCSSRulesMap[eid];
	    
	    if (!rules) return;
	    
	    var arr = [element];
	    var Selector = R.utils.Selector;
	    var ruleId, rule;
	    
	    // for the case of grouped selectors, we need to calculate the highest
	    // specificity within the selectors of the group that matches the element,
	    // so we can sort the rules properly without over estimating the specificity
	    // of grouped selectors
	    for (var i = 0, length = rules.length; i < length; i++) {
	        ruleId = rules[i];
	        rule = CSSRuleMap[ruleId];
	        
	        // check if it is a grouped selector
	        if (rule.selector.indexOf(",") != -1) {
	            var selectors = rule.selector.split(",");
	            var maxSpecificity = -1;
	            var sel, spec, mostSpecificSelector;
	            
	            // loop over all selectors in the group
	            for (var j = 0, len = selectors.length; j < len; j++) {
	                sel = selectors[j];
	                
	                // find if the selector matches the element
	                if (Selector.matches(sel, arr).length == 1) {
	                    spec = getCSSRuleSpecificity(sel);
	                    
	                    // find the most specific selector that macthes the element
	                    if (spec > maxSpecificity) {
	                        maxSpecificity = spec;
	                        mostSpecificSelector = sel;
	                    }
	                }
	            }
	            
	            rule.specificity = maxSpecificity;
	        }
	    }
	    
	    rules.sort(sortElementRules);
	    
	    return rules;
	};
	
	this.createCssExtractor = function() {
	    return new CssExtractor();  
	};
	
	this.destroy = this.noop;
    };
    return CssModule;
})());