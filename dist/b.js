(()=>{var e,t={41:(e,t)=>{var a=6,r=10,l=12,s={0:0,1:1,2:4,3:4,4:8,5:8};s[a]=16,s[7]=16,s[8]=24,s[9]=24,s[r]=32,s[11]=32,s[l]=32;var n=14,i=[[{sz:2,lbl:0},{sz:2,lbl:1},{sz:2,lbl:3},{sz:3,lbl:5},{sz:4,lbl:9},{sz:5,lbl:17},{sz:6,lbl:33},{sz:7,lbl:65},{sz:8,lbl:129},{sz:10,lbl:512},{sz:11,lbl:1026},{sz:11,lbl:1027},{sz:11,lbl:1028},{sz:11,lbl:1029},{sz:11,lbl:1030},{sz:11,lbl:1031}],[{sz:7,lbl:111},{sz:5,lbl:26},{sz:4,lbl:12},{sz:3,lbl:3},{sz:3,lbl:7},{sz:2,lbl:2},{sz:2,lbl:0},{sz:3,lbl:2},{sz:6,lbl:54},{sz:9,lbl:443},{sz:9,lbl:441},{sz:10,lbl:885},{sz:10,lbl:884},{sz:10,lbl:880},{sz:11,lbl:1763},{sz:11,lbl:1762}],[{sz:4,lbl:9},{sz:3,lbl:5},{sz:2,lbl:0},{sz:2,lbl:1},{sz:2,lbl:3},{sz:5,lbl:17},{sz:6,lbl:33},{sz:7,lbl:65},{sz:8,lbl:129},{sz:10,lbl:512},{sz:11,lbl:1026},{sz:11,lbl:1027},{sz:11,lbl:1028},{sz:11,lbl:1029},{sz:11,lbl:1030},{sz:11,lbl:1031}]];function o(e,t,a,o){var f=function(){for(var e=[],t=0;t<16;)e.push({codingType:0,codingTable:0,resolution:null,uncompressSamples:[]}),t+=1;return{batch_counter:0,batch_relative_timestamp:0,series:e}}(),v=function(e){function t(e,t,a){var r=t,l=a-1;if(8*e.length<r+a)throw new Error("Batch : Verify that dest buf is large enough");for(var s=0,n=0;a>0;)e[r>>3]&1<<(7&r)&&(n|=1<<l-s),a--,s++,r++;return n}return{index:0,byteArray:e,getNextSample:function(e,t){var a=t||s[e],r=this.index;if(this.index+=a,e===l&&32!==a)throw new Error("Batch : Mauvais sampletype");var n=0,i=Math.trunc((a-1)/8)+1,o=a%8;for(0===o&&i>0&&(o=8);i>0;){for(var m=0;o>0;){var p=r>>3;this.byteArray[p]&1<<(7&r)&&(n|=1<<8*(i-1)+m),o--,m++,r+=1}i--,o=8}if((3==e||5==e||7==e||9==e)&&n&1<<a-1)for(var u=a;u<32;u++)n|=1<<u,a++;return n},getNextBifromHi:function(e){for(var a=2;a<12;a++)for(var r=t(this.byteArray,this.index,a),l=0;l<i[e].length;l++)if(i[e][l].sz==a&&r==i[e][l].lbl)return this.index+=a,l;throw new Error("Bi not found in HUFF table")}}}(function(e){if(null!=e){e=e.toString().split("").filter((function(e){return!isNaN(parseInt(e,16))})).join("");for(var t=[];e.length>=2;)t.push(parseInt(e.substring(0,2),16)),e=e.substring(2,e.length);return t}-1===myerror.indexOf("Batch : Invalid hex string")&&myerror.push("Batch : Invalid hex string")}(a)),h=function(e){for(var t=e.toString(2);t.length<8;)t="0"+t;return{isCommonTimestamp:parseInt(t[t.length-2],2),hasSample:!parseInt(t[t.length-3],2),batch_req:parseInt(t[t.length-4],2),nb_of_type_measure:parseInt(t.substring(0,4),2)}}(v.getNextSample(4));f.batch_counter=v.getNextSample(4,3),v.getNextSample(4,1);var _=function(e,t,a,r,l){for(var s=0,n=0,i=0;i<r.nb_of_type_measure;i++){var o={size:l,lbl:t.getNextSample(4,l)},b=p(a,o);0===i&&(n=b),s=u(t,s),e.series[b]=m(t,a[b].sampletype,o.lbl,s),r.hasSample&&(e.series[b].codingType=t.getNextSample(4,2),e.series[b].codingTable=t.getNextSample(4,2))}return{last_timestamp:s,index_of_the_first_sample:n}}(f,v,t,h,e),d=_.last_timestamp,g=_.index_of_the_first_sample;return h.hasSample&&(d=function(e,t,a,l,s,i,o){return i.isCommonTimestamp?function(e,t,a,l,s,i){for(var o=t.getNextSample(4,8),m={},u=function(e,t,a,l){for(var s=[],i=0,o=t.getNextSample(4,2),m=0;m<a;m++){var p=t.getNextBifromHi(o);if(p<=n)if(0===m)s.push(e.series[l].uncompressSamples[0].data_relative_timestamp);else if(p>0){var u=s[m-1];s.push(t.getNextSample(r,p)+u+Math.pow(2,p)-1)}else s.push(u);else s.push(t.getNextSample(r));i=s[m]}return{timestampCommon:s,lastTimestamp:i}}(e,t,o,a),b=u.timestampCommon,f=u.lastTimestamp,v=0;v<s.nb_of_type_measure;v++){var h=1;m.lbl=t.getNextSample(4,i);for(var _=p(l,m),d=0;d<o;d++)if(t.getNextSample(4,1)){var g=t.getNextBifromHi(e.series[_].codingTable),z={data_relative_timestamp:0,data:{}};if(g<=n){var x=e.series[_].uncompressSamples[e.series[_].uncompressSamples.length-1].data.value;if(g>0)z.data.value=c(t,x,e.series[_].codingType,l[_].resol,g);else{if(h){h=0;continue}z.data.value=x}}else z.data.value=t.getNextSample(l[_].sampletype);z.data_relative_timestamp=b[d],e.series[_].uncompressSamples.push(z)}}return f}(e,t,a,l,i,o):function(e,t,a,r,l,s){for(var i={},o=0;o<l.nb_of_type_measure;o++){i.lbl=t.getNextSample(4,s);var m=p(a,i),u=t.getNextSample(4,8);if(u)for(var f=t.getNextSample(4,2),v=0;v<u;v++){var h=e.series[m].uncompressSamples[e.series[m].uncompressSamples.length-1].data_relative_timestamp,_={data_relative_timestamp:0,data:{}},d=t.getNextBifromHi(f);if(_.data_relative_timestamp=b(t,h,d),_.data_relative_timestamp>r&&(r=_.data_relative_timestamp),(d=t.getNextBifromHi(e.series[m].codingTable))<=n){var g=e.series[m].uncompressSamples[e.series[m].uncompressSamples.length-1].data.value;_.data.value=d>0?c(t,g,e.series[m].codingType,a[m].resol,d):g}else _.data.value=t.getNextSample(a[m].sampletype);e.series[m].uncompressSamples.push(_)}}return r}(e,t,l,s,i,o)}(f,v,g,t,d,h,e)),f.batch_relative_timestamp=u(v,d),function(e,t,a){var r={batch_counter:e.batch_counter,batch_relative_timestamp:e.batch_relative_timestamp};return a&&(r.batch_absolute_timestamp=a),r.dataset=e.series.reduce((function(r,l,s){return r.concat(l.uncompressSamples.map((function(r){var l,n,i,o={data_relative_timestamp:r.data_relative_timestamp,data:{value:t[s].divide?r.data.value/t[s].divide:r.data.value,label:t[s].taglbl}};return t[s].lblname&&(o.data.label_name=t[s].lblname),a&&(o.data_absolute_timestamp=(l=a,n=e.batch_relative_timestamp,i=r.data_relative_timestamp,new Date(new Date(l)-1e3*(n-i)).toISOString())),o})))}),[]),r}(f,t,o)}function m(e,t,a,r){return{uncompressSamples:[{data_relative_timestamp:r,data:{value:f(e,t),label:a}}],codingType:0,codingTable:0,resolution:null}}function p(e,t){for(var a=0;a<e.length;a++)if(e[a].taglbl===t.lbl)return a;throw new Error("Batch : Cannot find index in argList")}function u(e,t){if(t){var a=e.getNextBifromHi(1);return b(e,t,a)}return e.getNextSample(r)}function b(e,t,a){return a>n?e.getNextSample(r):a>0?function(e,t,a){return e.getNextSample(r,a)+t+Math.pow(2,a)-1}(e,t,a):t}function f(e,t){var a=e.getNextSample(t);return t===l?function(e){var t=2147483648&e?-1:1,a=(e>>23&255)-127,r=8388607&e;if(128==a)return t*(r?Number.NaN:Number.POSITIVE_INFINITY);if(-127==a){if(0===r)return 0*t;a=-126,r/=1<<22}else r=(r|1<<23)/(1<<23);return t*r*Math.pow(2,a)}(a):a}function c(e,t,r,l,s){var n=e.getNextSample(a,s);return 0===r?function(e,t,a,r){return e>=Math.pow(2,r-1)?e*t+a:(e+1-Math.pow(2,r))*t+a}(n,l,t,s):1===r?(n+Math.pow(2,s)-1)*l+t:t-(n+(Math.pow(2,s)-1))*l}Math.trunc=Math.trunc||function(e){return isNaN(e)?NaN:e>0?Math.floor(e):Math.ceil(e)};try{e.exports=o}catch(e){t.err_msg=e}e.exports={brUncompress:o,normalisation:function(e){let t=e.date,a=o(e.batch1,e.batch2,e.payload,t),r=[];for(let e=0;e<a.dataset.length;e++){let t=a.dataset[e],l={variable:t.data.label_name,value:t.data.value,date:t.data_absolute_timestamp};r.push(l)}return r}}}},a={};function r(e){var l=a[e];if(void 0!==l)return l.exports;var s=a[e]={exports:{}};return t[e](s,s.exports,r),s.exports}r.m=t,e=[],r.O=(t,a,l,s)=>{if(!a){var n=1/0;for(p=0;p<e.length;p++){for(var[a,l,s]=e[p],i=!0,o=0;o<a.length;o++)(!1&s||n>=s)&&Object.keys(r.O).every((e=>r.O[e](a[o])))?a.splice(o--,1):(i=!1,s<n&&(n=s));if(i){e.splice(p--,1);var m=l();void 0!==m&&(t=m)}}return t}s=s||0;for(var p=e.length;p>0&&e[p-1][2]>s;p--)e[p]=e[p-1];e[p]=[a,l,s]},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={128:0};r.O.j=t=>0===e[t];var t=(t,a)=>{var l,s,[n,i,o]=a,m=0;if(n.some((t=>0!==e[t]))){for(l in i)r.o(i,l)&&(r.m[l]=i[l]);if(o)var p=o(r)}for(t&&t(a);m<n.length;m++)s=n[m],r.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return r.O(p)},a=self.webpackChunklorawan=self.webpackChunklorawan||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))})();var l=r(41);l=r.O(l)})();