"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var s=e(require("postcss-selector-parser"));const o=()=>({postcssPlugin:"postcss-selector-not",Rule:(e,{result:o})=>{if(e.selector&&e.selector.toLowerCase().includes(":not("))try{const o=s.default().astSync(e.selector);o.walkPseudos((e=>{if(":not"!==e.value.toLowerCase())return;if(!e.nodes||e.nodes.length<2)return;const o=[];e.nodes.forEach((e=>{!function(e){e.spaces&&(e.spaces.after="",e.spaces.before=""),e.nodes&&e.nodes.length>0&&(e.nodes[0]&&e.nodes[0].spaces&&(e.nodes[0].spaces.before=""),e.nodes[e.nodes.length-1]&&e.nodes[e.nodes.length-1].spaces&&(e.nodes[e.nodes.length-1].spaces.after=""))}(e);const t=s.default.pseudo({value:":not",nodes:[e]});o.push(t)})),e.replaceWith(...o)}));const t=o.toString();t!==e.selector&&e.replaceWith(e.clone({selector:t}))}catch(s){e.warn(o,`Failed to parse selector "${e.selector}"`)}}});o.postcss=!0,module.exports=o;
