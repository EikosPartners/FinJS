var _ = require('lodash');

module.exports = function (options) {
  options = options || {};

  // console.log('Transform Middleware Being Used');

  function getModulesFromLoader(moduleLoader) {
    var moduleRegex = /(\w*): function \1\(done\)/g;
    var matches = [];
    var match = moduleRegex.exec(moduleLoader);
    while (match !== null) {
      matches.push(match[1]);
      match = moduleRegex.exec(moduleLoader);
    }
    return matches;
  }

  function removeModuleFromLoader(module, moduleLoader) {
    var expression = module + ": function " + module + "\\(done\\) {(?:\\n.*){5}";
    var regex = new RegExp(expression);
    moduleLoader = moduleLoader.replace(regex, '');
    return moduleLoader;
  }  

  return function transform (req, res, next) {
    // console.log('transform');
    var //accept = req.headers['accept-encoding'],
        write = res.write,
        end = res.end,
        // compress = true,
        stream;



    // see #724
    req.on('close', function(){
      // console.log('close');
      res.write = res.end = function(){};
    });

    // flush is noop by default
    res.flush = noop;

    // proxy

    res.write = function(chunk, encoding){
      // console.log('write');
      // console.log(chunk);
      // console.log(res.getHeader('content-length'));
      // console.log('requrl: ', req.url);
      if(req.url === '/build/moduleLoader.bundle.js' || req.url.indexOf('hot-update.js') !== -1) {
        var text = chunk.toString();
        var allModules = getModulesFromLoader(text);
        var userModules = [];// req.user.modules || [];
        var modulesToRemove = _.difference(allModules, userModules);
        text = _.reduce(modulesToRemove, function(moduleLoader, module) {
          return removeModuleFromLoader(module, moduleLoader);
        }, text);
        text = text.replace('moduleLoader.bundle.js.map', '');
        chunk = new Buffer(text);
        // console.log('new length: ' + Buffer.byteLength(chunk));
        res.setHeader('content-length', getSize(chunk));
      }

      return stream
        ? stream.write(new Buffer(chunk, encoding))
        : write.call(res, chunk, encoding);
    };

    res.end = function(chunk, encoding){
      // console.log('end');
      if (chunk) {
        this.write(chunk, encoding);
      }
      return stream
        ? stream.end()
        : end.call(res);
    };

    // res.on('header', function(){
    //   console.log('header');
    //   // default request filter
    //   if (!filter(req, res)) return;
    //
    //   // vary
    //   var vary = res.getHeader('Vary');
    //   if (!vary) {
    //     res.setHeader('Vary', 'Accept-Encoding');
    //   } else if (!~vary.indexOf('Accept-Encoding')) {
    //     res.setHeader('Vary', vary + ', Accept-Encoding');
    //   }
    //
    //   if (!compress) return;
    //
    //   var encoding = res.getHeader('Content-Encoding') || 'identity';
    //
    //   // already encoded
    //   if ('identity' != encoding) return;
    //
    //   // SHOULD use identity
    //   if (!accept) return;
    //
    //   // head
    //   if ('HEAD' == req.method) return;
    //
    //   // compression method
    //   var method = new Negotiator(req).preferredEncoding(['gzip', 'deflate', 'identity']);
    //   // negotiation failed
    //   if (method === 'identity') return;
    //
    //   // compression stream
    //   stream = exports.methods[method](options);
    //
    //   // overwrite the flush method
    //   res.flush = function(){
    //     console.log('flush');
    //     stream.flush();
    //   }
    //
    //   // header fields
    //   res.setHeader('Content-Encoding', method);
    //   res.removeHeader('Content-Length');
    //
    //   // compression
    //   stream.on('data', function(chunk){
    //     console.log('data');
    //     write.call(res, chunk);
    //   });
    //
    //   stream.on('end', function(){
    //     console.log('end');
    //     end.call(res);
    //   });
    //
    //   stream.on('drain', function() {
    //     console.log('drain');
    //     res.emit('drain');
    //   });
    // });

    next();
  };
};

function getSize(chunk) {
  return Buffer.isBuffer(chunk)
    ? chunk.length
    : Buffer.byteLength(chunk);
}

function noop(){}
