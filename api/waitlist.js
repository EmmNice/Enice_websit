import{createRequire as __nodeCreateRequire}from'node:module';const require=__nodeCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@stablelib/base64/lib/base64.js
var require_base64 = __commonJS({
  "node_modules/@stablelib/base64/lib/base64.js"(exports) {
    "use strict";
    var __extends = exports && exports.__extends || /* @__PURE__ */ (function() {
      var extendStatics = function(d, b2) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b3) {
          d2.__proto__ = b3;
        } || function(d2, b3) {
          for (var p in b3) if (b3.hasOwnProperty(p)) d2[p] = b3[p];
        };
        return extendStatics(d, b2);
      };
      return function(d, b2) {
        extendStatics(d, b2);
        function __() {
          this.constructor = d;
        }
        d.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var INVALID_BYTE = 256;
    var Coder = (
      /** @class */
      (function() {
        function Coder2(_paddingCharacter) {
          if (_paddingCharacter === void 0) {
            _paddingCharacter = "=";
          }
          this._paddingCharacter = _paddingCharacter;
        }
        Coder2.prototype.encodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
          }
          return (length + 2) / 3 * 4 | 0;
        };
        Coder2.prototype.encode = function(data) {
          var out = "";
          var i = 0;
          for (; i < data.length - 2; i += 3) {
            var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            out += this._encodeByte(c >>> 1 * 6 & 63);
            out += this._encodeByte(c >>> 0 * 6 & 63);
          }
          var left = data.length - i;
          if (left > 0) {
            var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            if (left === 2) {
              out += this._encodeByte(c >>> 1 * 6 & 63);
            } else {
              out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
          }
          return out;
        };
        Coder2.prototype.maxDecodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
          }
          return length / 4 * 3 | 0;
        };
        Coder2.prototype.decodedLength = function(s) {
          return this.maxDecodedLength(s.length - this._getPaddingLength(s));
        };
        Coder2.prototype.decode = function(s) {
          if (s.length === 0) {
            return new Uint8Array(0);
          }
          var paddingLength = this._getPaddingLength(s);
          var length = s.length - paddingLength;
          var out = new Uint8Array(this.maxDecodedLength(length));
          var op = 0;
          var i = 0;
          var haveBad = 0;
          var v0 = 0, v1 = 0, v2 = 0, v3 = 0;
          for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v0 << 2 | v1 >>> 4;
            out[op++] = v1 << 4 | v2 >>> 2;
            out[op++] = v2 << 6 | v3;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v3 & INVALID_BYTE;
          }
          if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v1 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = v0 << 2 | v1 >>> 4;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v1 & INVALID_BYTE;
          }
          if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = v1 << 4 | v2 >>> 2;
            haveBad |= v2 & INVALID_BYTE;
          }
          if (i < length - 3) {
            v3 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v2 << 6 | v3;
            haveBad |= v3 & INVALID_BYTE;
          }
          if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
          }
          return out;
        };
        Coder2.prototype._encodeByte = function(b2) {
          var result = b2;
          result += 65;
          result += 25 - b2 >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b2 >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b2 >>> 8 & 52 - 48 - 62 + 43;
          result += 62 - b2 >>> 8 & 62 - 43 - 63 + 47;
          return String.fromCharCode(result);
        };
        Coder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
          result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        Coder2.prototype._getPaddingLength = function(s) {
          var paddingLength = 0;
          if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
              if (s[i] !== this._paddingCharacter) {
                break;
              }
              paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
              throw new Error("Base64Coder: incorrect padding");
            }
          }
          return paddingLength;
        };
        return Coder2;
      })()
    );
    exports.Coder = Coder;
    var stdCoder = new Coder();
    function encode(data) {
      return stdCoder.encode(data);
    }
    exports.encode = encode;
    function decode(s) {
      return stdCoder.decode(s);
    }
    exports.decode = decode;
    var URLSafeCoder = (
      /** @class */
      (function(_super) {
        __extends(URLSafeCoder2, _super);
        function URLSafeCoder2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        URLSafeCoder2.prototype._encodeByte = function(b2) {
          var result = b2;
          result += 65;
          result += 25 - b2 >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b2 >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b2 >>> 8 & 52 - 48 - 62 + 45;
          result += 62 - b2 >>> 8 & 62 - 45 - 63 + 95;
          return String.fromCharCode(result);
        };
        URLSafeCoder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
          result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        return URLSafeCoder2;
      })(Coder)
    );
    exports.URLSafeCoder = URLSafeCoder;
    var urlSafeCoder = new URLSafeCoder();
    function encodeURLSafe(data) {
      return urlSafeCoder.encode(data);
    }
    exports.encodeURLSafe = encodeURLSafe;
    function decodeURLSafe(s) {
      return urlSafeCoder.decode(s);
    }
    exports.decodeURLSafe = decodeURLSafe;
    exports.encodedLength = function(length) {
      return stdCoder.encodedLength(length);
    };
    exports.maxDecodedLength = function(length) {
      return stdCoder.maxDecodedLength(length);
    };
    exports.decodedLength = function(s) {
      return stdCoder.decodedLength(s);
    };
  }
});

// node_modules/fast-sha256/sha256.js
var require_sha256 = __commonJS({
  "node_modules/fast-sha256/sha256.js"(exports, module) {
    (function(root, factory) {
      var exports2 = {};
      factory(exports2);
      var sha2562 = exports2["default"];
      for (var k in exports2) {
        sha2562[k] = exports2[k];
      }
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = sha2562;
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return sha2562;
        });
      } else {
        root.sha256 = sha2562;
      }
    })(exports, function(exports2) {
      "use strict";
      exports2.__esModule = true;
      exports2.digestLength = 32;
      exports2.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b2, c, d, e, f, g, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b2 = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b2 ^ a & c ^ b2 & c) | 0;
            h = g;
            g = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b2;
            b2 = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b2;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      var Hash = (
        /** @class */
        (function() {
          function Hash2() {
            this.digestLength = exports2.digestLength;
            this.blockSize = exports2.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        })()
      );
      exports2.Hash = Hash;
      var HMAC = (
        /** @class */
        (function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        })()
      );
      exports2.HMAC = HMAC;
      function hash(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports2.hash = hash;
      exports2["default"] = hash;
      function hmac2(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports2.hmac = hmac2;
      function fillBuffer(buffer2, hmac3, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac3.reset();
        if (num > 1) {
          hmac3.update(buffer2);
        }
        if (info) {
          hmac3.update(info);
        }
        hmac3.update(counter);
        hmac3.finish(buffer2);
        counter[0]++;
      }
      var hkdfSalt = new Uint8Array(exports2.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac2(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer2 = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer2.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer2.length) {
            fillBuffer(buffer2, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer2[bufpos++];
        }
        hmac_.clean();
        buffer2.fill(0);
        counter.fill(0);
        return out;
      }
      exports2.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      exports2.pbkdf2 = pbkdf2;
    });
  }
});

// node_modules/standardwebhooks/dist/timing_safe_equal.js
var require_timing_safe_equal = __commonJS({
  "node_modules/standardwebhooks/dist/timing_safe_equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.timingSafeEqual = timingSafeEqual;
    function assert(expr, msg = "") {
      if (!expr) {
        throw new Error(msg);
      }
    }
    function timingSafeEqual(a, b2) {
      if (a.byteLength !== b2.byteLength) {
        return false;
      }
      if (!(a instanceof DataView)) {
        a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
      }
      if (!(b2 instanceof DataView)) {
        b2 = new DataView(ArrayBuffer.isView(b2) ? b2.buffer : b2);
      }
      assert(a instanceof DataView);
      assert(b2 instanceof DataView);
      const length = a.byteLength;
      let out = 0;
      let i = -1;
      while (++i < length) {
        out |= a.getUint8(i) ^ b2.getUint8(i);
      }
      return out === 0;
    }
  }
});

// node_modules/standardwebhooks/dist/index.js
var require_dist = __commonJS({
  "node_modules/standardwebhooks/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Webhook = exports.WebhookVerificationError = void 0;
    var base64 = require_base64();
    var sha2562 = require_sha256();
    var timing_safe_equal_1 = require_timing_safe_equal();
    var WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
    var ExtendableError = class _ExtendableError extends Error {
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _ExtendableError.prototype);
        this.name = "ExtendableError";
        this.stack = new Error(message).stack;
      }
    };
    var WebhookVerificationError = class _WebhookVerificationError extends ExtendableError {
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _WebhookVerificationError.prototype);
        this.name = "WebhookVerificationError";
      }
    };
    exports.WebhookVerificationError = WebhookVerificationError;
    var Webhook2 = class _Webhook {
      constructor(secret, options) {
        if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
          if (secret instanceof Uint8Array) {
            this.key = secret;
          } else {
            this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
          }
        } else {
          if (typeof secret !== "string") {
            throw new Error("Expected secret to be of type string");
          }
          if (secret.startsWith(_Webhook.prefix)) {
            secret = secret.substring(_Webhook.prefix.length);
          }
          this.key = base64.decode(secret);
        }
        if (this.key.length === 0) {
          throw new Error("Secret can't be empty.");
        }
      }
      verify(payload, headers, options) {
        var _a;
        const jsonParse = (_a = options === null || options === void 0 ? void 0 : options.jsonParse) !== null && _a !== void 0 ? _a : true;
        const normalizedHeaders = {};
        for (const key of Object.keys(headers)) {
          normalizedHeaders[key.toLowerCase()] = headers[key];
        }
        const msgId = normalizedHeaders["webhook-id"];
        const msgSignature = normalizedHeaders["webhook-signature"];
        const msgTimestamp = normalizedHeaders["webhook-timestamp"];
        if (!msgSignature || !msgId || !msgTimestamp) {
          throw new WebhookVerificationError("Missing required headers");
        }
        const timestamp = this.verifyTimestamp(msgTimestamp);
        const computedSignature = this.sign(msgId, timestamp, payload);
        const expectedSignature = computedSignature.split(",")[1];
        const passedSignatures = msgSignature.split(" ");
        const encoder = new globalThis.TextEncoder();
        for (const versionedSignature of passedSignatures) {
          const [version2, signature] = versionedSignature.split(",");
          if (version2 !== "v1") {
            continue;
          }
          if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
            const payloadString = payload.toString();
            if (payloadString === "") {
              return void 0;
            }
            if (jsonParse) {
              return JSON.parse(payloadString);
            } else {
              return void 0;
            }
          }
        }
        throw new WebhookVerificationError("No matching signature found");
      }
      sign(msgId, timestamp, payload) {
        if (typeof payload === "string") {
        } else if (payload.constructor.name === "Buffer") {
          payload = payload.toString();
        } else {
          throw new Error("Expected payload to be of type string or Buffer.");
        }
        const encoder = new TextEncoder();
        const timestampNumber = Math.floor(timestamp.getTime() / 1e3);
        const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
        const expectedSignature = base64.encode(sha2562.hmac(this.key, toSign));
        return `v1,${expectedSignature}`;
      }
      verifyTimestamp(timestampHeader) {
        const now = Math.floor(Date.now() / 1e3);
        const timestamp = parseInt(timestampHeader, 10);
        if (Number.isNaN(timestamp)) {
          throw new WebhookVerificationError("Invalid Signature Headers");
        }
        if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too old");
        }
        if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too new");
        }
        return new Date(timestamp * 1e3);
      }
    };
    exports.Webhook = Webhook2;
    Webhook2.prefix = "whsec_";
  }
});

// api-src/lib/http.ts
function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const fromHeader = typeof first === "string" ? first.split(",")[0]?.trim() : void 0;
  return fromHeader || req.socket?.remoteAddress || "unknown";
}
function parseJsonBody(body) {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  if (body && typeof body === "object") return body;
  return {};
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function errorRef(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

// api-src/lib/db.ts
import { randomUUID } from "node:crypto";

// node_modules/postgres/src/index.js
import os from "os";
import fs from "fs";

// node_modules/postgres/src/query.js
var originCache = /* @__PURE__ */ new Map();
var originStackCache = /* @__PURE__ */ new Map();
var originError = /* @__PURE__ */ Symbol("OriginError");
var CLOSE = {};
var Query = class extends Promise {
  constructor(strings, args, handler2, canceller, options = {}) {
    let resolve, reject;
    super((a, b2) => {
      resolve = a;
      reject = b2;
    });
    this.tagged = Array.isArray(strings.raw);
    this.strings = strings;
    this.args = args;
    this.handler = handler2;
    this.canceller = canceller;
    this.options = options;
    this.state = null;
    this.statement = null;
    this.resolve = (x) => (this.active = false, resolve(x));
    this.reject = (x) => (this.active = false, reject(x));
    this.active = false;
    this.cancelled = null;
    this.executed = false;
    this.signature = "";
    this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
  }
  get origin() {
    return (this.handler.debug ? this[originError].stack : this.tagged && originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings)) || "";
  }
  static get [Symbol.species]() {
    return Promise;
  }
  cancel() {
    return this.canceller && (this.canceller(this), this.canceller = null);
  }
  simple() {
    this.options.simple = true;
    this.options.prepare = false;
    return this;
  }
  async readable() {
    this.simple();
    this.streaming = true;
    return this;
  }
  async writable() {
    this.simple();
    this.streaming = true;
    return this;
  }
  cursor(rows = 1, fn) {
    this.options.simple = false;
    if (typeof rows === "function") {
      fn = rows;
      rows = 1;
    }
    this.cursorRows = rows;
    if (typeof fn === "function")
      return this.cursorFn = fn, this;
    let prev;
    return {
      [Symbol.asyncIterator]: () => ({
        next: () => {
          if (this.executed && !this.active)
            return { done: true };
          prev && prev();
          const promise = new Promise((resolve, reject) => {
            this.cursorFn = (value) => {
              resolve({ value, done: false });
              return new Promise((r) => prev = r);
            };
            this.resolve = () => (this.active = false, resolve({ done: true }));
            this.reject = (x) => (this.active = false, reject(x));
          });
          this.execute();
          return promise;
        },
        return() {
          prev && prev(CLOSE);
          return { done: true };
        }
      })
    };
  }
  describe() {
    this.options.simple = false;
    this.onlyDescribe = this.options.prepare = true;
    return this;
  }
  stream() {
    throw new Error(".stream has been renamed to .forEach");
  }
  forEach(fn) {
    this.forEachFn = fn;
    this.handle();
    return this;
  }
  raw() {
    this.isRaw = true;
    return this;
  }
  values() {
    this.isRaw = "values";
    return this;
  }
  async handle() {
    !this.executed && (this.executed = true) && await 1 && this.handler(this);
  }
  execute() {
    this.handle();
    return this;
  }
  then() {
    this.handle();
    return super.then.apply(this, arguments);
  }
  catch() {
    this.handle();
    return super.catch.apply(this, arguments);
  }
  finally() {
    this.handle();
    return super.finally.apply(this, arguments);
  }
};
function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs);
  const x = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  originCache.set(xs, new Error());
  Error.stackTraceLimit = x;
  return originCache.get(xs);
}

// node_modules/postgres/src/errors.js
var PostgresError = class extends Error {
  constructor(x) {
    super(x.message);
    this.name = this.constructor.name;
    Object.assign(this, x);
  }
};
var Errors = {
  connection,
  postgres,
  generic,
  notSupported
};
function connection(x, options, socket) {
  const { host, port } = socket || options;
  const error = Object.assign(
    new Error("write " + x + " " + (options.path || host + ":" + port)),
    {
      code: x,
      errno: x,
      address: options.path || host
    },
    options.path ? {} : { port }
  );
  Error.captureStackTrace(error, connection);
  return error;
}
function postgres(x) {
  const error = new PostgresError(x);
  Error.captureStackTrace(error, postgres);
  return error;
}
function generic(code, message) {
  const error = Object.assign(new Error(code + ": " + message), { code });
  Error.captureStackTrace(error, generic);
  return error;
}
function notSupported(x) {
  const error = Object.assign(
    new Error(x + " (B) is not supported"),
    {
      code: "MESSAGE_NOT_SUPPORTED",
      name: x
    }
  );
  Error.captureStackTrace(error, notSupported);
  return error;
}

// node_modules/postgres/src/types.js
var types = {
  string: {
    to: 25,
    from: null,
    // defaults to string
    serialize: (x) => "" + x
  },
  number: {
    to: 0,
    from: [21, 23, 26, 700, 701],
    serialize: (x) => "" + x,
    parse: (x) => +x
  },
  json: {
    to: 114,
    from: [114, 3802],
    serialize: (x) => JSON.stringify(x),
    parse: (x) => JSON.parse(x)
  },
  boolean: {
    to: 16,
    from: 16,
    serialize: (x) => x === true ? "t" : "f",
    parse: (x) => x === "t"
  },
  date: {
    to: 1184,
    from: [1082, 1114, 1184],
    serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
    parse: (x) => new Date(x)
  },
  bytea: {
    to: 17,
    from: 17,
    serialize: (x) => "\\x" + Buffer.from(x).toString("hex"),
    parse: (x) => Buffer.from(x.slice(2), "hex")
  }
};
var NotTagged = class {
  then() {
    notTagged();
  }
  catch() {
    notTagged();
  }
  finally() {
    notTagged();
  }
};
var Identifier = class extends NotTagged {
  constructor(value) {
    super();
    this.value = escapeIdentifier(value);
  }
};
var Parameter = class extends NotTagged {
  constructor(value, type, array) {
    super();
    this.value = value;
    this.type = type;
    this.array = array;
  }
};
var Builder = class extends NotTagged {
  constructor(first, rest) {
    super();
    this.first = first;
    this.rest = rest;
  }
  build(before, parameters, types2, options) {
    const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b2) => a.i - b2.i).pop();
    return keyword.i === -1 ? escapeIdentifiers(this.first, options) : keyword.fn(this.first, this.rest, parameters, types2, options);
  }
};
function handleValue(x, parameters, types2, options) {
  let value = x instanceof Parameter ? x.value : x;
  if (value === void 0) {
    x instanceof Parameter ? x.value = options.transform.undefined : value = x = options.transform.undefined;
    if (value === void 0)
      throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
  }
  return "$" + types2.push(
    x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x))
  );
}
var defaultHandlers = typeHandlers(types);
function stringify(q, string, value, parameters, types2, options) {
  for (let i = 1; i < q.strings.length; i++) {
    string += stringifyValue(string, value, parameters, types2, options) + q.strings[i];
    value = q.args[i];
  }
  return string;
}
function stringifyValue(string, value, parameters, types2, o) {
  return value instanceof Builder ? value.build(string, parameters, types2, o) : value instanceof Query ? fragment(value, parameters, types2, o) : value instanceof Identifier ? value.value : value && value[0] instanceof Query ? value.reduce((acc, x) => acc + " " + fragment(x, parameters, types2, o), "") : handleValue(value, parameters, types2, o);
}
function fragment(q, parameters, types2, options) {
  q.fragment = true;
  return stringify(q, q.strings[0], q.args[0], parameters, types2, options);
}
function valuesBuilder(first, parameters, types2, columns, options) {
  return first.map(
    (row) => "(" + columns.map(
      (column) => stringifyValue("values", row[column], parameters, types2, options)
    ).join(",") + ")"
  ).join(",");
}
function values(first, rest, parameters, types2, options) {
  const multi = Array.isArray(first[0]);
  const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
  return valuesBuilder(multi ? first : [first], parameters, types2, columns, options);
}
function select(first, rest, parameters, types2, options) {
  typeof first === "string" && (first = [first].concat(rest));
  if (Array.isArray(first))
    return escapeIdentifiers(first, options);
  let value;
  const columns = rest.length ? rest.flat() : Object.keys(first);
  return columns.map((x) => {
    value = first[x];
    return (value instanceof Query ? fragment(value, parameters, types2, options) : value instanceof Identifier ? value.value : handleValue(value, parameters, types2, options)) + " as " + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x);
  }).join(",");
}
var builders = Object.entries({
  values,
  in: (...xs) => {
    const x = values(...xs);
    return x === "()" ? "(null)" : x;
  },
  select,
  as: select,
  returning: select,
  "\\(": select,
  update(first, rest, parameters, types2, options) {
    return (rest.length ? rest.flat() : Object.keys(first)).map(
      (x) => escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) + "=" + stringifyValue("values", first[x], parameters, types2, options)
    );
  },
  insert(first, rest, parameters, types2, options) {
    const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
    return "(" + escapeIdentifiers(columns, options) + ")values" + valuesBuilder(Array.isArray(first) ? first : [first], parameters, types2, columns, options);
  }
}).map(([x, fn]) => [new RegExp("((?:^|[\\s(])" + x + "(?:$|[\\s(]))(?![\\s\\S]*\\1)", "i"), fn]);
function notTagged() {
  throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
}
var serializers = defaultHandlers.serializers;
var parsers = defaultHandlers.parsers;
function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0]);
  return typeof x === "string" ? 1009 : 0;
}
var mergeUserTypes = function(types2) {
  const user = typeHandlers(types2 || {});
  return {
    serializers: Object.assign({}, serializers, user.serializers),
    parsers: Object.assign({}, parsers, user.parsers)
  };
};
function typeHandlers(types2) {
  return Object.keys(types2).reduce((acc, k) => {
    types2[k].from && [].concat(types2[k].from).forEach((x) => acc.parsers[x] = types2[k].parse);
    if (types2[k].serialize) {
      acc.serializers[types2[k].to] = types2[k].serialize;
      types2[k].from && [].concat(types2[k].from).forEach((x) => acc.serializers[x] = types2[k].serialize);
    }
    return acc;
  }, { parsers: {}, serializers: {} });
}
function escapeIdentifiers(xs, { transform: { column } }) {
  return xs.map((x) => escapeIdentifier(column.to ? column.to(x) : x)).join(",");
}
var escapeIdentifier = function escape(str) {
  return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
};
var inferType = function inferType2(x) {
  return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
};
var escapeBackslash = /\\/g;
var escapeQuote = /"/g;
function arrayEscape(x) {
  return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
}
var arraySerializer = function arraySerializer2(xs, serializer, options, typarray) {
  if (Array.isArray(xs) === false)
    return xs;
  if (!xs.length)
    return "{}";
  const first = xs[0];
  const delimiter = typarray === 1020 ? ";" : ",";
  if (Array.isArray(first) && !first.type)
    return "{" + xs.map((x) => arraySerializer2(x, serializer, options, typarray)).join(delimiter) + "}";
  return "{" + xs.map((x) => {
    if (x === void 0) {
      x = options.transform.undefined;
      if (x === void 0)
        throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
    }
    return x === null ? "null" : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : "" + x) + '"';
  }).join(delimiter) + "}";
};
var arrayParserState = {
  i: 0,
  char: null,
  str: "",
  quoted: false,
  last: 0
};
var arrayParser = function arrayParser2(x, parser, typarray) {
  arrayParserState.i = arrayParserState.last = 0;
  return arrayParserLoop(arrayParserState, x, parser, typarray);
};
function arrayParserLoop(s, x, parser, typarray) {
  const xs = [];
  const delimiter = typarray === 1020 ? ";" : ",";
  for (; s.i < x.length; s.i++) {
    s.char = x[s.i];
    if (s.quoted) {
      if (s.char === "\\") {
        s.str += x[++s.i];
      } else if (s.char === '"') {
        xs.push(parser ? parser(s.str) : s.str);
        s.str = "";
        s.quoted = x[s.i + 1] === '"';
        s.last = s.i + 2;
      } else {
        s.str += s.char;
      }
    } else if (s.char === '"') {
      s.quoted = true;
    } else if (s.char === "{") {
      s.last = ++s.i;
      xs.push(arrayParserLoop(s, x, parser, typarray));
    } else if (s.char === "}") {
      s.quoted = false;
      s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
      break;
    } else if (s.char === delimiter && s.p !== "}" && s.p !== '"') {
      xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
    }
    s.p = s.char;
  }
  s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
  return xs;
}
var toCamel = (x) => {
  let str = x[0];
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toPascal = (x) => {
  let str = x[0].toUpperCase();
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toKebab = (x) => x.replace(/_/g, "-");
var fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
var fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
var fromKebab = (x) => x.replace(/-/g, "_");
function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
  };
}
toCamel.column = { from: toCamel };
toCamel.value = { from: createJsonTransform(toCamel) };
fromCamel.column = { to: fromCamel };
var camel = { ...toCamel };
camel.column.to = fromCamel;
toPascal.column = { from: toPascal };
toPascal.value = { from: createJsonTransform(toPascal) };
fromPascal.column = { to: fromPascal };
var pascal = { ...toPascal };
pascal.column.to = fromPascal;
toKebab.column = { from: toKebab };
toKebab.value = { from: createJsonTransform(toKebab) };
fromKebab.column = { to: fromKebab };
var kebab = { ...toKebab };
kebab.column.to = fromKebab;

// node_modules/postgres/src/connection.js
import net from "net";
import tls from "tls";
import crypto from "crypto";
import Stream from "stream";
import { performance } from "perf_hooks";

// node_modules/postgres/src/result.js
var Result = class extends Array {
  constructor() {
    super();
    Object.defineProperties(this, {
      count: { value: null, writable: true },
      state: { value: null, writable: true },
      command: { value: null, writable: true },
      columns: { value: null, writable: true },
      statement: { value: null, writable: true }
    });
  }
  static get [Symbol.species]() {
    return Array;
  }
};

// node_modules/postgres/src/queue.js
var queue_default = Queue;
function Queue(initial = []) {
  let xs = initial.slice();
  let index = 0;
  return {
    get length() {
      return xs.length - index;
    },
    remove: (x) => {
      const index2 = xs.indexOf(x);
      return index2 === -1 ? null : (xs.splice(index2, 1), x);
    },
    push: (x) => (xs.push(x), x),
    shift: () => {
      const out = xs[index++];
      if (index === xs.length) {
        index = 0;
        xs = [];
      } else {
        xs[index - 1] = void 0;
      }
      return out;
    }
  };
}

// node_modules/postgres/src/bytes.js
var size = 256;
var buffer = Buffer.allocUnsafe(size);
var messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
  const v = x.charCodeAt(0);
  acc[x] = () => {
    buffer[0] = v;
    b.i = 5;
    return b;
  };
  return acc;
}, {});
var b = Object.assign(reset, messages, {
  N: String.fromCharCode(0),
  i: 0,
  inc(x) {
    b.i += x;
    return b;
  },
  str(x) {
    const length = Buffer.byteLength(x);
    fit(length);
    b.i += buffer.write(x, b.i, length, "utf8");
    return b;
  },
  i16(x) {
    fit(2);
    buffer.writeUInt16BE(x, b.i);
    b.i += 2;
    return b;
  },
  i32(x, i) {
    if (i || i === 0) {
      buffer.writeUInt32BE(x, i);
      return b;
    }
    fit(4);
    buffer.writeUInt32BE(x, b.i);
    b.i += 4;
    return b;
  },
  z(x) {
    fit(x);
    buffer.fill(0, b.i, b.i + x);
    b.i += x;
    return b;
  },
  raw(x) {
    buffer = Buffer.concat([buffer.subarray(0, b.i), x]);
    b.i = buffer.length;
    return b;
  },
  end(at = 1) {
    buffer.writeUInt32BE(b.i - at, at);
    const out = buffer.subarray(0, b.i);
    b.i = 0;
    buffer = Buffer.allocUnsafe(size);
    return out;
  }
});
var bytes_default = b;
function fit(x) {
  if (buffer.length - b.i < x) {
    const prev = buffer, length = prev.length;
    buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
    prev.copy(buffer);
  }
}
function reset() {
  b.i = 0;
  return b;
}

// node_modules/postgres/src/connection.js
var connection_default = Connection;
var uid = 1;
var Sync = bytes_default().S().end();
var Flush = bytes_default().H().end();
var SSLRequest = bytes_default().i32(8).i32(80877103).end(8);
var ExecuteUnnamed = Buffer.concat([bytes_default().E().str(bytes_default.N).i32(0).end(), Sync]);
var DescribeUnnamed = bytes_default().D().str("S").str(bytes_default.N).end();
var noop = () => {
};
var retryRoutines = /* @__PURE__ */ new Set([
  "FetchPreparedStatement",
  "RevalidateCachedQuery",
  "transformAssignedExpr"
]);
var errorFields = {
  83: "severity_local",
  // S
  86: "severity",
  // V
  67: "code",
  // C
  77: "message",
  // M
  68: "detail",
  // D
  72: "hint",
  // H
  80: "position",
  // P
  112: "internal_position",
  // p
  113: "internal_query",
  // q
  87: "where",
  // W
  115: "schema_name",
  // s
  116: "table_name",
  // t
  99: "column_name",
  // c
  100: "data type_name",
  // d
  110: "constraint_name",
  // n
  70: "file",
  // F
  76: "line",
  // L
  82: "routine"
  // R
};
function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
  const {
    sslnegotiation,
    ssl,
    max,
    user,
    host,
    port,
    database,
    parsers: parsers2,
    transform,
    onnotice,
    onnotify,
    onparameter,
    max_pipeline,
    keep_alive,
    backoff: backoff2,
    target_session_attrs
  } = options;
  const sent = queue_default(), id = uid++, backend = { pid: null, secret: null }, idleTimer = timer(end, options.idle_timeout), lifeTimer = timer(end, options.max_lifetime), connectTimer = timer(connectTimedOut, options.connect_timeout);
  let socket = null, cancelMessage, errorResponse = null, result = new Result(), incoming = Buffer.alloc(0), needsTypes = options.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedTime = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
  const connection2 = {
    queue: queues.closed,
    idleTimer,
    connect(query2) {
      initial = query2;
      reconnect();
    },
    terminate,
    execute,
    cancel,
    end,
    count: 0,
    id
  };
  queues.closed && queues.closed.push(connection2);
  return connection2;
  async function createSocket() {
    let x;
    try {
      x = options.socket ? await Promise.resolve(options.socket(options)) : new net.Socket();
    } catch (e) {
      error(e);
      return;
    }
    x.on("error", error);
    x.on("close", closed);
    x.on("drain", drain);
    return x;
  }
  async function cancel({ pid, secret }, resolve, reject) {
    try {
      cancelMessage = bytes_default().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
      await connect();
      socket.once("error", reject);
      socket.once("close", resolve);
    } catch (error2) {
      reject(error2);
    }
  }
  function execute(q) {
    if (terminated)
      return queryError(q, Errors.connection("CONNECTION_DESTROYED", options));
    if (stream)
      return queryError(q, Errors.generic("COPY_IN_PROGRESS", "You cannot execute queries during copy"));
    if (q.cancelled)
      return;
    try {
      q.state = backend;
      query ? sent.push(q) : (query = q, query.active = true);
      build(q);
      return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection2));
    } catch (error2) {
      sent.length === 0 && write(Sync);
      errored(error2);
      return true;
    }
  }
  function toBuffer(q) {
    if (q.parameters.length >= 65534)
      throw Errors.generic("MAX_PARAMETERS_EXCEEDED", "Max number of parameters (65534) exceeded");
    return q.options.simple ? bytes_default().Q().str(q.statement.string + bytes_default.N).end() : q.describeFirst ? Buffer.concat([describe(q), Flush]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([describe(q), prepared(q)]) : unnamed(q);
  }
  function describe(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
      Describe("S", q.statement.name)
    ]);
  }
  function prepared(q) {
    return Buffer.concat([
      Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
      q.cursorFn ? Execute("", q.cursorRows) : ExecuteUnnamed
    ]);
  }
  function unnamed(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types),
      DescribeUnnamed,
      prepared(q)
    ]);
  }
  function build(q) {
    const parameters = [], types2 = [];
    const string = stringify(q, q.strings[0], q.args[0], parameters, types2, options);
    !q.tagged && q.args.forEach((x) => handleValue(x, parameters, types2, options));
    q.prepare = options.prepare && ("prepare" in q.options ? q.options.prepare : true);
    q.string = string;
    q.signature = q.prepare && types2 + string;
    q.onlyDescribe && delete statements[q.signature];
    q.parameters = q.parameters || parameters;
    q.prepared = q.prepare && q.signature in statements;
    q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
    q.statement = q.prepared ? statements[q.signature] : { string, types: types2, name: q.prepare ? statementId + statementCount++ : "" };
    typeof options.debug === "function" && options.debug(id, string, parameters, types2);
  }
  function write(x, fn) {
    chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x);
    if (fn || chunk.length >= 1024)
      return nextWrite(fn);
    nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
    return true;
  }
  function nextWrite(fn) {
    const x = socket.write(chunk, fn);
    nextWriteTimer !== null && clearImmediate(nextWriteTimer);
    chunk = nextWriteTimer = null;
    return x;
  }
  function connectTimedOut() {
    errored(Errors.connection("CONNECT_TIMEOUT", options, socket));
    socket.destroy();
  }
  async function secure() {
    if (sslnegotiation !== "direct") {
      write(SSLRequest);
      const canSSL = await new Promise((r) => socket.once("data", (x) => r(x[0] === 83)));
      if (!canSSL && ssl === "prefer")
        return connected();
    }
    const options2 = {
      socket,
      servername: net.isIP(socket.host) ? void 0 : socket.host
    };
    if (sslnegotiation === "direct")
      options2.ALPNProtocols = ["postgresql"];
    if (ssl === "require" || ssl === "allow" || ssl === "prefer")
      options2.rejectUnauthorized = false;
    else if (typeof ssl === "object")
      Object.assign(options2, ssl);
    socket.removeAllListeners();
    socket = tls.connect(options2);
    socket.on("secureConnect", connected);
    socket.on("error", error);
    socket.on("close", closed);
    socket.on("drain", drain);
  }
  function drain() {
    !query && onopen(connection2);
  }
  function data(x) {
    if (incomings) {
      incomings.push(x);
      remaining -= x.length;
      if (remaining > 0)
        return;
    }
    incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([incoming, x], incoming.length + x.length);
    while (incoming.length > 4) {
      length = incoming.readUInt32BE(1);
      if (length >= incoming.length) {
        remaining = length - incoming.length;
        incomings = [incoming];
        break;
      }
      try {
        handle(incoming.subarray(0, length + 1));
      } catch (e) {
        query && (query.cursorFn || query.describeFirst) && write(Sync);
        errored(e);
      }
      incoming = incoming.subarray(length + 1);
      remaining = 0;
      incomings = null;
    }
  }
  async function connect() {
    terminated = false;
    backendParameters = {};
    socket || (socket = await createSocket());
    if (!socket)
      return;
    connectTimer.start();
    if (options.socket)
      return ssl ? secure() : connected();
    socket.on("connect", ssl ? secure : connected);
    if (options.path)
      return socket.connect(options.path);
    socket.ssl = ssl;
    socket.connect(port[hostIndex], host[hostIndex]);
    socket.host = host[hostIndex];
    socket.port = port[hostIndex];
    hostIndex = (hostIndex + 1) % port.length;
  }
  function reconnect() {
    setTimeout(connect, closedTime ? Math.max(0, closedTime + delay - performance.now()) : 0);
  }
  function connected() {
    try {
      statements = {};
      needsTypes = options.fetch_types;
      statementId = Math.random().toString(36).slice(2);
      statementCount = 1;
      lifeTimer.start();
      socket.on("data", data);
      keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1e3 * keep_alive);
      const s = StartupMessage();
      write(s);
    } catch (err) {
      error(err);
    }
  }
  function error(err) {
    if (connection2.queue === queues.connecting && options.host[retries + 1])
      return;
    errored(err);
    while (sent.length)
      queryError(sent.shift(), err);
  }
  function errored(err) {
    stream && (stream.destroy(err), stream = null);
    query && queryError(query, err);
    initial && (queryError(initial, err), initial = null);
  }
  function queryError(query2, err) {
    if (query2.reserve)
      return query2.reject(err);
    if (!err || typeof err !== "object")
      err = new Error(err);
    "query" in err || "parameters" in err || Object.defineProperties(err, {
      stack: { value: err.stack + query2.origin.replace(/.*\n/, "\n"), enumerable: options.debug },
      query: { value: query2.string, enumerable: options.debug },
      parameters: { value: query2.parameters, enumerable: options.debug },
      args: { value: query2.args, enumerable: options.debug },
      types: { value: query2.statement && query2.statement.types, enumerable: options.debug }
    });
    query2.reject(err);
  }
  function end() {
    return ending || (!connection2.reserved && onend(connection2), !connection2.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r) => socket && socket.readyState !== "closed" ? socket.once("close", r) : r())) : ending = new Promise((r) => ended = r));
  }
  function terminate() {
    terminated = true;
    if (stream || query || initial || sent.length)
      error(Errors.connection("CONNECTION_DESTROYED", options));
    clearImmediate(nextWriteTimer);
    if (socket) {
      socket.removeListener("data", data);
      socket.removeListener("connect", connected);
      socket.readyState === "open" && socket.end(bytes_default().X().end());
    }
    ended && (ended(), ending = ended = null);
  }
  async function closed(hadError) {
    incoming = Buffer.alloc(0);
    remaining = 0;
    incomings = null;
    clearImmediate(nextWriteTimer);
    socket.removeListener("data", data);
    socket.removeListener("connect", connected);
    idleTimer.cancel();
    lifeTimer.cancel();
    connectTimer.cancel();
    socket.removeAllListeners();
    socket = null;
    if (initial)
      return reconnect();
    !hadError && (query || sent.length) && error(Errors.connection("CONNECTION_CLOSED", options, socket));
    closedTime = performance.now();
    hadError && options.shared.retries++;
    delay = (typeof backoff2 === "function" ? backoff2(options.shared.retries) : backoff2) * 1e3;
    onclose(connection2, Errors.connection("CONNECTION_CLOSED", options, socket));
  }
  function handle(xs, x = xs[0]) {
    (x === 68 ? DataRow : (
      // D
      x === 100 ? CopyData : (
        // d
        x === 65 ? NotificationResponse : (
          // A
          x === 83 ? ParameterStatus : (
            // S
            x === 90 ? ReadyForQuery : (
              // Z
              x === 67 ? CommandComplete : (
                // C
                x === 50 ? BindComplete : (
                  // 2
                  x === 49 ? ParseComplete : (
                    // 1
                    x === 116 ? ParameterDescription : (
                      // t
                      x === 84 ? RowDescription : (
                        // T
                        x === 82 ? Authentication : (
                          // R
                          x === 110 ? NoData : (
                            // n
                            x === 75 ? BackendKeyData : (
                              // K
                              x === 69 ? ErrorResponse : (
                                // E
                                x === 115 ? PortalSuspended : (
                                  // s
                                  x === 51 ? CloseComplete : (
                                    // 3
                                    x === 71 ? CopyInResponse : (
                                      // G
                                      x === 78 ? NoticeResponse : (
                                        // N
                                        x === 72 ? CopyOutResponse : (
                                          // H
                                          x === 99 ? CopyDone : (
                                            // c
                                            x === 73 ? EmptyQueryResponse : (
                                              // I
                                              x === 86 ? FunctionCallResponse : (
                                                // V
                                                x === 118 ? NegotiateProtocolVersion : (
                                                  // v
                                                  x === 87 ? CopyBothResponse : (
                                                    // W
                                                    /* c8 ignore next */
                                                    UnknownMessage
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ))(xs);
  }
  function DataRow(x) {
    let index = 7;
    let length2;
    let column;
    let value;
    const row = query.isRaw ? new Array(query.statement.columns.length) : {};
    for (let i = 0; i < query.statement.columns.length; i++) {
      column = query.statement.columns[i];
      length2 = x.readInt32BE(index);
      index += 4;
      value = length2 === -1 ? null : query.isRaw === true ? x.subarray(index, index += length2) : column.parser === void 0 ? x.toString("utf8", index, index += length2) : column.parser.array === true ? column.parser(x.toString("utf8", index + 1, index += length2)) : column.parser(x.toString("utf8", index, index += length2));
      query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
    }
    query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
  }
  function ParameterStatus(x) {
    const [k, v] = x.toString("utf8", 5, x.length - 1).split(bytes_default.N);
    backendParameters[k] = v;
    if (options.parameters[k] !== v) {
      options.parameters[k] = v;
      onparameter && onparameter(k, v);
    }
  }
  function ReadyForQuery(x) {
    if (query) {
      if (errorResponse) {
        query.retried ? errored(query.retried) : query.prepared && retryRoutines.has(errorResponse.routine) ? retry2(query, errorResponse) : errored(errorResponse);
      } else {
        query.resolve(results || result);
      }
    } else if (errorResponse) {
      errored(errorResponse);
    }
    query = results = errorResponse = null;
    result = new Result();
    connectTimer.cancel();
    if (initial) {
      if (target_session_attrs) {
        if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
          return fetchState();
        else if (tryNext(target_session_attrs, backendParameters))
          return terminate();
      }
      if (needsTypes) {
        initial.reserve && (initial = null);
        return fetchArrayTypes();
      }
      initial && !initial.reserve && execute(initial);
      options.shared.retries = retries = 0;
      initial = null;
      return;
    }
    while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
      Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
    if (query)
      return;
    connection2.reserved ? !connection2.reserved.release && x[5] === 73 ? ending ? terminate() : (connection2.reserved = null, onopen(connection2)) : connection2.reserved() : ending ? terminate() : onopen(connection2);
  }
  function CommandComplete(x) {
    rows = 0;
    for (let i = x.length - 1; i > 0; i--) {
      if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
        result.count = +x.toString("utf8", i + 1, x.length - 1);
      if (x[i - 1] >= 65) {
        result.command = x.toString("utf8", 5, i);
        result.state = backend;
        break;
      }
    }
    final && (final(), final = null);
    if (result.command === "BEGIN" && max !== 1 && !connection2.reserved)
      return errored(Errors.generic("UNSAFE_TRANSACTION", "Only use sql.begin, sql.reserved or max: 1"));
    if (query.options.simple)
      return BindComplete();
    if (query.cursorFn) {
      result.count && query.cursorFn(result);
      write(Sync);
    }
  }
  function ParseComplete() {
    query.parsing = false;
  }
  function BindComplete() {
    !result.statement && (result.statement = query.statement);
    result.columns = query.statement.columns;
  }
  function ParameterDescription(x) {
    const length2 = x.readUInt16BE(5);
    for (let i = 0; i < length2; ++i)
      !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
    query.prepare && (statements[query.signature] = query.statement);
    query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
  }
  function RowDescription(x) {
    if (result.command) {
      results = results || [result];
      results.push(result = new Result());
      result.count = null;
      query.statement.columns = null;
    }
    const length2 = x.readUInt16BE(5);
    let index = 7;
    let start;
    query.statement.columns = Array(length2);
    for (let i = 0; i < length2; ++i) {
      start = index;
      while (x[index++] !== 0) ;
      const table = x.readUInt32BE(index);
      const number = x.readUInt16BE(index + 4);
      const type = x.readUInt32BE(index + 6);
      query.statement.columns[i] = {
        name: transform.column.from ? transform.column.from(x.toString("utf8", start, index - 1)) : x.toString("utf8", start, index - 1),
        parser: parsers2[type],
        table,
        number,
        type
      };
      index += 18;
    }
    result.statement = query.statement;
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  async function Authentication(x, type = x.readUInt32BE(5)) {
    (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
  }
  async function AuthenticationCleartextPassword() {
    const payload = await Pass();
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function AuthenticationMD5Password(x) {
    const payload = "md5" + await md5(
      Buffer.concat([
        Buffer.from(await md5(await Pass() + user)),
        x.subarray(9)
      ])
    );
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function SASL() {
    nonce = (await crypto.randomBytes(18)).toString("base64");
    bytes_default().p().str("SCRAM-SHA-256" + bytes_default.N);
    const i = bytes_default.i;
    write(bytes_default.inc(4).str("n,,n=*,r=" + nonce).i32(bytes_default.i - i - 4, i).end());
  }
  async function SASLContinue(x) {
    const res = x.toString("utf8", 9).split(",").reduce((acc, x2) => (acc[x2[0]] = x2.slice(2), acc), {});
    const saltedPassword = await crypto.pbkdf2Sync(
      await Pass(),
      Buffer.from(res.s, "base64"),
      parseInt(res.i),
      32,
      "sha256"
    );
    const clientKey = await hmac(saltedPassword, "Client Key");
    const auth = "n=*,r=" + nonce + ",r=" + res.r + ",s=" + res.s + ",i=" + res.i + ",c=biws,r=" + res.r;
    serverSignature = (await hmac(await hmac(saltedPassword, "Server Key"), auth)).toString("base64");
    const payload = "c=biws,r=" + res.r + ",p=" + xor(
      clientKey,
      Buffer.from(await hmac(await sha256(clientKey), auth))
    ).toString("base64");
    write(
      bytes_default().p().str(payload).end()
    );
  }
  function SASLFinal(x) {
    if (x.toString("utf8", 9).split(bytes_default.N, 1)[0].slice(2) === serverSignature)
      return;
    errored(Errors.generic("SASL_SIGNATURE_MISMATCH", "The server did not return the correct signature"));
    socket.destroy();
  }
  function Pass() {
    return Promise.resolve(
      typeof options.pass === "function" ? options.pass() : options.pass
    );
  }
  function NoData() {
    result.statement = query.statement;
    result.statement.columns = [];
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  function BackendKeyData(x) {
    backend.pid = x.readUInt32BE(5);
    backend.secret = x.readUInt32BE(9);
  }
  async function fetchArrayTypes() {
    needsTypes = false;
    const types2 = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute);
    types2.forEach(({ oid, typarray }) => addArrayType(oid, typarray));
  }
  function addArrayType(oid, typarray) {
    if (!!options.parsers[typarray] && !!options.serializers[typarray]) return;
    const parser = options.parsers[oid];
    options.shared.typeArrayMap[oid] = typarray;
    options.parsers[typarray] = (xs) => arrayParser(xs, parser, typarray);
    options.parsers[typarray].array = true;
    options.serializers[typarray] = (xs) => arraySerializer(xs, options.serializers[oid], options, typarray);
  }
  function tryNext(x, xs) {
    return x === "read-write" && xs.default_transaction_read_only === "on" || x === "read-only" && xs.default_transaction_read_only === "off" || x === "primary" && xs.in_hot_standby === "on" || x === "standby" && xs.in_hot_standby === "off" || x === "prefer-standby" && xs.in_hot_standby === "off" && options.host[retries];
  }
  function fetchState() {
    const query2 = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true });
    query2.resolve = ([[a], [b2]]) => {
      backendParameters.default_transaction_read_only = a.transaction_read_only;
      backendParameters.in_hot_standby = b2.pg_is_in_recovery ? "on" : "off";
    };
    query2.execute();
  }
  function ErrorResponse(x) {
    if (query) {
      (query.cursorFn || query.describeFirst) && write(Sync);
      errorResponse = Errors.postgres(parseError(x));
    } else {
      errored(Errors.postgres(parseError(x)));
    }
  }
  function retry2(q, error2) {
    delete statements[q.signature];
    q.retried = error2;
    execute(q);
  }
  function NotificationResponse(x) {
    if (!onnotify)
      return;
    let index = 9;
    while (x[index++] !== 0) ;
    onnotify(
      x.toString("utf8", 9, index - 1),
      x.toString("utf8", index, x.length - 1)
    );
  }
  async function PortalSuspended() {
    try {
      const x = await Promise.resolve(query.cursorFn(result));
      rows = 0;
      x === CLOSE ? write(Close(query.portal)) : (result = new Result(), write(Execute("", query.cursorRows)));
    } catch (err) {
      write(Sync);
      query.reject(err);
    }
  }
  function CloseComplete() {
    result.count && query.cursorFn(result);
    query.resolve(result);
  }
  function CopyInResponse() {
    stream = new Stream.Writable({
      autoDestroy: true,
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
        stream = null;
      }
    });
    query.resolve(stream);
  }
  function CopyOutResponse() {
    stream = new Stream.Readable({
      read() {
        socket.resume();
      }
    });
    query.resolve(stream);
  }
  function CopyBothResponse() {
    stream = new Stream.Duplex({
      autoDestroy: true,
      read() {
        socket.resume();
      },
      /* c8 ignore next 11 */
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
      }
    });
    query.resolve(stream);
  }
  function CopyData(x) {
    stream && (stream.push(x.subarray(5)) || socket.pause());
  }
  function CopyDone() {
    stream && stream.push(null);
    stream = null;
  }
  function NoticeResponse(x) {
    onnotice ? onnotice(parseError(x)) : console.log(parseError(x));
  }
  function EmptyQueryResponse() {
  }
  function FunctionCallResponse() {
    errored(Errors.notSupported("FunctionCallResponse"));
  }
  function NegotiateProtocolVersion() {
    errored(Errors.notSupported("NegotiateProtocolVersion"));
  }
  function UnknownMessage(x) {
    console.error("Postgres.js : Unknown Message:", x[0]);
  }
  function UnknownAuth(x, type) {
    console.error("Postgres.js : Unknown Auth:", type);
  }
  function Bind(parameters, types2, statement = "", portal = "") {
    let prev, type;
    bytes_default().B().str(portal + bytes_default.N).str(statement + bytes_default.N).i16(0).i16(parameters.length);
    parameters.forEach((x, i) => {
      if (x === null)
        return bytes_default.i32(4294967295);
      type = types2[i];
      parameters[i] = x = type in options.serializers ? options.serializers[type](x) : "" + x;
      prev = bytes_default.i;
      bytes_default.inc(4).str(x).i32(bytes_default.i - prev - 4, prev);
    });
    bytes_default.i16(0);
    return bytes_default.end();
  }
  function Parse(str, parameters, types2, name = "") {
    bytes_default().P().str(name + bytes_default.N).str(str + bytes_default.N).i16(parameters.length);
    parameters.forEach((x, i) => bytes_default.i32(types2[i] || 0));
    return bytes_default.end();
  }
  function Describe(x, name = "") {
    return bytes_default().D().str(x).str(name + bytes_default.N).end();
  }
  function Execute(portal = "", rows2 = 0) {
    return Buffer.concat([
      bytes_default().E().str(portal + bytes_default.N).i32(rows2).end(),
      Flush
    ]);
  }
  function Close(portal = "") {
    return Buffer.concat([
      bytes_default().C().str("P").str(portal + bytes_default.N).end(),
      bytes_default().S().end()
    ]);
  }
  function StartupMessage() {
    return cancelMessage || bytes_default().inc(4).i16(3).z(2).str(
      Object.entries(Object.assign(
        {
          user,
          database,
          client_encoding: "UTF8"
        },
        options.connection
      )).filter(([, v]) => v).map(([k, v]) => k + bytes_default.N + v).join(bytes_default.N)
    ).z(2).end(0);
  }
}
function parseError(x) {
  const error = {};
  let start = 5;
  for (let i = 5; i < x.length - 1; i++) {
    if (x[i] === 0) {
      error[errorFields[x[start]]] = x.toString("utf8", start + 1, i);
      start = i + 1;
    }
  }
  return error;
}
function md5(x) {
  return crypto.createHash("md5").update(x).digest("hex");
}
function hmac(key, x) {
  return crypto.createHmac("sha256", key).update(x).digest();
}
function sha256(x) {
  return crypto.createHash("sha256").update(x).digest();
}
function xor(a, b2) {
  const length = Math.max(a.length, b2.length);
  const buffer2 = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i++)
    buffer2[i] = a[i] ^ b2[i];
  return buffer2;
}
function timer(fn, seconds) {
  seconds = typeof seconds === "function" ? seconds() : seconds;
  if (!seconds)
    return { cancel: noop, start: noop };
  let timer2;
  return {
    cancel() {
      timer2 && (clearTimeout(timer2), timer2 = null);
    },
    start() {
      timer2 && clearTimeout(timer2);
      timer2 = setTimeout(done, seconds * 1e3, arguments);
    }
  };
  function done(args) {
    fn.apply(null, args);
    timer2 = null;
  }
}

// node_modules/postgres/src/subscribe.js
var noop2 = () => {
};
function Subscribe(postgres2, options) {
  const subscribers = /* @__PURE__ */ new Map(), slot = "postgresjs_" + Math.random().toString(36).slice(2), state = {};
  let connection2, stream, ended = false;
  const sql = subscribe.sql = postgres2({
    ...options,
    transform: { column: {}, value: {}, row: {} },
    max: 1,
    fetch_types: false,
    idle_timeout: null,
    max_lifetime: null,
    connection: {
      ...options.connection,
      replication: "database"
    },
    onclose: async function() {
      if (ended)
        return;
      stream = null;
      state.pid = state.secret = void 0;
      connected(await init(sql, slot, options.publications));
      subscribers.forEach((event) => event.forEach(({ onsubscribe }) => onsubscribe()));
    },
    no_subscribe: true
  });
  const end = sql.end, close = sql.close;
  sql.end = async () => {
    ended = true;
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return end();
  };
  sql.close = async () => {
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return close();
  };
  return subscribe;
  async function subscribe(event, fn, onsubscribe = noop2, onerror = noop2) {
    event = parseEvent(event);
    if (!connection2)
      connection2 = init(sql, slot, options.publications);
    const subscriber = { fn, onsubscribe };
    const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, /* @__PURE__ */ new Set([subscriber])).get(event);
    const unsubscribe = () => {
      fns.delete(subscriber);
      fns.size === 0 && subscribers.delete(event);
    };
    return connection2.then((x) => {
      connected(x);
      onsubscribe();
      stream && stream.on("error", onerror);
      return { unsubscribe, state, sql };
    });
  }
  function connected(x) {
    stream = x.stream;
    state.pid = x.state.pid;
    state.secret = x.state.secret;
  }
  async function init(sql2, slot2, publications) {
    if (!publications)
      throw new Error("Missing publication names");
    const xs = await sql2.unsafe(
      `CREATE_REPLICATION_SLOT ${slot2} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
    );
    const [x] = xs;
    const stream2 = await sql2.unsafe(
      `START_REPLICATION SLOT ${slot2} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`
    ).writable();
    const state2 = {
      lsn: Buffer.concat(x.consistent_point.split("/").map((x2) => Buffer.from(("00000000" + x2).slice(-8), "hex")))
    };
    stream2.on("data", data);
    stream2.on("error", error);
    stream2.on("close", sql2.close);
    return { stream: stream2, state: xs.state };
    function error(e) {
      console.error("Unexpected error during logical streaming - reconnecting", e);
    }
    function data(x2) {
      if (x2[0] === 119) {
        parse(x2.subarray(25), state2, sql2.options.parsers, handle, options.transform);
      } else if (x2[0] === 107 && x2[17]) {
        state2.lsn = x2.subarray(1, 9);
        pong();
      }
    }
    function handle(a, b2) {
      const path = b2.relation.schema + "." + b2.relation.table;
      call2("*", a, b2);
      call2("*:" + path, a, b2);
      b2.relation.keys.length && call2("*:" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
      call2(b2.command, a, b2);
      call2(b2.command + ":" + path, a, b2);
      b2.relation.keys.length && call2(b2.command + ":" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
    }
    function pong() {
      const x2 = Buffer.alloc(34);
      x2[0] = "r".charCodeAt(0);
      x2.fill(state2.lsn, 1);
      x2.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2e3, 0, 1)) * BigInt(1e3), 25);
      stream2.write(x2);
    }
  }
  function call2(x, a, b2) {
    subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b2, x));
  }
}
function Time(x) {
  return new Date(Date.UTC(2e3, 0, 1) + Number(x / BigInt(1e3)));
}
function parse(x, state, parsers2, handle, transform) {
  const char = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc);
  Object.entries({
    R: (x2) => {
      let i = 1;
      const r = state[x2.readUInt32BE(i)] = {
        schema: x2.toString("utf8", i += 4, i = x2.indexOf(0, i)) || "pg_catalog",
        table: x2.toString("utf8", i + 1, i = x2.indexOf(0, i + 1)),
        columns: Array(x2.readUInt16BE(i += 2)),
        keys: []
      };
      i += 2;
      let columnIndex = 0, column;
      while (i < x2.length) {
        column = r.columns[columnIndex++] = {
          key: x2[i++],
          name: transform.column.from ? transform.column.from(x2.toString("utf8", i, i = x2.indexOf(0, i))) : x2.toString("utf8", i, i = x2.indexOf(0, i)),
          type: x2.readUInt32BE(i += 1),
          parser: parsers2[x2.readUInt32BE(i)],
          atttypmod: x2.readUInt32BE(i += 4)
        };
        column.key && r.keys.push(column);
        i += 4;
      }
    },
    Y: () => {
    },
    // Type
    O: () => {
    },
    // Origin
    B: (x2) => {
      state.date = Time(x2.readBigInt64BE(9));
      state.lsn = x2.subarray(1, 9);
    },
    I: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      const { row } = tuples(x2, relation.columns, i += 7, transform);
      handle(row, {
        command: "insert",
        relation
      });
    },
    D: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      handle(
        key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform).row : null,
        {
          command: "delete",
          relation,
          key
        }
      );
    },
    U: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      const xs = key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform) : null;
      xs && (i = xs.i);
      const { row } = tuples(x2, relation.columns, i + 3, transform);
      handle(row, {
        command: "update",
        relation,
        key,
        old: xs && xs.row
      });
    },
    T: () => {
    },
    // Truncate,
    C: () => {
    }
    // Commit
  }).reduce(char, {})[x[0]](x);
}
function tuples(x, columns, xi, transform) {
  let type, column, value;
  const row = transform.raw ? new Array(columns.length) : {};
  for (let i = 0; i < columns.length; i++) {
    type = x[xi++];
    column = columns[i];
    value = type === 110 ? null : type === 117 ? void 0 : column.parser === void 0 ? x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString("utf8", xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)));
    transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
  }
  return { i: xi, row: transform.row.from ? transform.row.from(row) : row };
}
function parseEvent(x) {
  const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
  if (!xs)
    throw new Error("Malformed subscribe pattern: " + x);
  const [, command, path, key] = xs;
  return (command || "*") + (path ? ":" + (path.indexOf(".") === -1 ? "public." + path : path) : "") + (key ? "=" + key : "");
}

// node_modules/postgres/src/large.js
import Stream2 from "stream";
function largeObject(sql, oid, mode = 131072 | 262144) {
  return new Promise(async (resolve, reject) => {
    await sql.begin(async (sql2) => {
      let finish;
      !oid && ([{ oid }] = await sql2`select lo_creat(-1) as oid`);
      const [{ fd }] = await sql2`select lo_open(${oid}, ${mode}) as fd`;
      const lo = {
        writable,
        readable,
        close: () => sql2`select lo_close(${fd})`.then(finish),
        tell: () => sql2`select lo_tell64(${fd})`,
        read: (x) => sql2`select loread(${fd}, ${x}) as data`,
        write: (x) => sql2`select lowrite(${fd}, ${x})`,
        truncate: (x) => sql2`select lo_truncate64(${fd}, ${x})`,
        seek: (x, whence = 0) => sql2`select lo_lseek64(${fd}, ${x}, ${whence})`,
        size: () => sql2`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
      };
      resolve(lo);
      return new Promise(async (r) => finish = r);
      async function readable({
        highWaterMark = 2048 * 8,
        start = 0,
        end = Infinity
      } = {}) {
        let max = end - start;
        start && await lo.seek(start);
        return new Stream2.Readable({
          highWaterMark,
          async read(size2) {
            const l = size2 > max ? size2 - max : size2;
            max -= size2;
            const [{ data }] = await lo.read(l);
            this.push(data);
            if (data.length < size2)
              this.push(null);
          }
        });
      }
      async function writable({
        highWaterMark = 2048 * 8,
        start = 0
      } = {}) {
        start && await lo.seek(start);
        return new Stream2.Writable({
          highWaterMark,
          write(chunk, encoding, callback) {
            lo.write(chunk).then(() => callback(), callback);
          }
        });
      }
    }).catch(reject);
  });
}

// node_modules/postgres/src/index.js
Object.assign(Postgres, {
  PostgresError,
  toPascal,
  pascal,
  toCamel,
  camel,
  toKebab,
  kebab,
  fromPascal,
  fromCamel,
  fromKebab,
  BigInt: {
    to: 20,
    from: [20],
    parse: (x) => BigInt(x),
    // eslint-disable-line
    serialize: (x) => x.toString()
  }
});
var src_default = Postgres;
function Postgres(a, b2) {
  const options = parseOptions(a, b2), subscribe = options.no_subscribe || Subscribe(Postgres, { ...options });
  let ending = false;
  const queries = queue_default(), connecting = queue_default(), reserved = queue_default(), closed = queue_default(), ended = queue_default(), open = queue_default(), busy = queue_default(), full = queue_default(), queues = { connecting, reserved, closed, ended, open, busy, full };
  const connections = [...Array(options.max)].map(() => connection_default(options, queues, { onopen, onend, onclose }));
  const sql = Sql(handler2);
  Object.assign(sql, {
    get parameters() {
      return options.parameters;
    },
    largeObject: largeObject.bind(null, sql),
    subscribe,
    CLOSE,
    END: CLOSE,
    PostgresError,
    options,
    reserve,
    listen,
    begin,
    close,
    end
  });
  return sql;
  function Sql(handler3) {
    handler3.debug = options.debug;
    Object.entries(options.types).reduce((acc, [name, type]) => {
      acc[name] = (x) => new Parameter(x, type.to);
      return acc;
    }, typed);
    Object.assign(sql2, {
      types: typed,
      typed,
      unsafe,
      notify,
      array,
      json,
      file
    });
    return sql2;
    function typed(value, type) {
      return new Parameter(value, type);
    }
    function sql2(strings, ...args) {
      const query = strings && Array.isArray(strings.raw) ? new Query(strings, args, handler3, cancel) : typeof strings === "string" && !args.length ? new Identifier(options.transform.column.to ? options.transform.column.to(strings) : strings) : new Builder(strings, args);
      return query;
    }
    function unsafe(string, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([string], args, handler3, cancel, {
        prepare: false,
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
    function file(path, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([], args, (query2) => {
        fs.readFile(path, "utf8", (err, string) => {
          if (err)
            return query2.reject(err);
          query2.strings = [string];
          handler3(query2);
        });
      }, cancel, {
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
  }
  async function listen(name, fn, onlisten) {
    const listener = { fn, onlisten };
    const sql2 = listen.sql || (listen.sql = Postgres({
      ...options,
      max: 1,
      idle_timeout: null,
      max_lifetime: null,
      fetch_types: false,
      onclose() {
        Object.entries(listen.channels).forEach(([name2, { listeners }]) => {
          delete listen.channels[name2];
          Promise.all(listeners.map((l) => listen(name2, l.fn, l.onlisten).catch(() => {
          })));
        });
      },
      onnotify(c, x) {
        c in listen.channels && listen.channels[c].listeners.forEach((l) => l.fn(x));
      }
    }));
    const channels = listen.channels || (listen.channels = {}), exists = name in channels;
    if (exists) {
      channels[name].listeners.push(listener);
      const result2 = await channels[name].result;
      listener.onlisten && listener.onlisten();
      return { state: result2.state, unlisten };
    }
    channels[name] = { result: sql2`listen ${sql2.unsafe('"' + name.replace(/"/g, '""') + '"')}`, listeners: [listener] };
    const result = await channels[name].result;
    listener.onlisten && listener.onlisten();
    return { state: result.state, unlisten };
    async function unlisten() {
      if (name in channels === false)
        return;
      channels[name].listeners = channels[name].listeners.filter((x) => x !== listener);
      if (channels[name].listeners.length)
        return;
      delete channels[name];
      return sql2`unlisten ${sql2.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
    }
  }
  async function notify(channel, payload) {
    return await sql`select pg_notify(${channel}, ${"" + payload})`;
  }
  async function reserve() {
    const queue = queue_default();
    const c = open.length ? open.shift() : await new Promise((resolve, reject) => {
      const query = { reserve: resolve, reject };
      queries.push(query);
      closed.length && connect(closed.shift(), query);
    });
    move(c, reserved);
    c.reserved = () => queue.length ? c.execute(queue.shift()) : move(c, reserved);
    c.reserved.release = true;
    const sql2 = Sql(handler3);
    sql2.release = () => {
      c.reserved = null;
      onopen(c);
    };
    return sql2;
    function handler3(q) {
      c.queue === full ? queue.push(q) : c.execute(q) || move(c, full);
    }
  }
  async function begin(options2, fn) {
    !fn && (fn = options2, options2 = "");
    const queries2 = queue_default();
    let savepoints = 0, connection2, prepare = null;
    try {
      await sql.unsafe("begin " + options2.replace(/[^a-z ]/ig, ""), [], { onexecute }).execute();
      return await Promise.race([
        scope(connection2, fn),
        new Promise((_, reject) => connection2.onclose = reject)
      ]);
    } catch (error) {
      throw error;
    }
    async function scope(c, fn2, name) {
      const sql2 = Sql(handler3);
      sql2.savepoint = savepoint;
      sql2.prepare = (x) => prepare = x.replace(/[^a-z0-9$-_. ]/gi);
      let uncaughtError, result;
      name && await sql2`savepoint ${sql2(name)}`;
      try {
        result = await new Promise((resolve, reject) => {
          const x = fn2(sql2);
          Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
        });
        if (uncaughtError)
          throw uncaughtError;
      } catch (e) {
        await (name ? sql2`rollback to ${sql2(name)}` : sql2`rollback`);
        throw e instanceof PostgresError && e.code === "25P02" && uncaughtError || e;
      }
      if (!name) {
        prepare ? await sql2`prepare transaction '${sql2.unsafe(prepare)}'` : await sql2`commit`;
      }
      return result;
      function savepoint(name2, fn3) {
        if (name2 && Array.isArray(name2.raw))
          return savepoint((sql3) => sql3.apply(sql3, arguments));
        arguments.length === 1 && (fn3 = name2, name2 = null);
        return scope(c, fn3, "s" + savepoints++ + (name2 ? "_" + name2 : ""));
      }
      function handler3(q) {
        q.catch((e) => uncaughtError || (uncaughtError = e));
        c.queue === full ? queries2.push(q) : c.execute(q) || move(c, full);
      }
    }
    function onexecute(c) {
      connection2 = c;
      move(c, reserved);
      c.reserved = () => queries2.length ? c.execute(queries2.shift()) : move(c, reserved);
    }
  }
  function move(c, queue) {
    c.queue.remove(c);
    queue.push(c);
    c.queue = queue;
    queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
    return c;
  }
  function json(x) {
    return new Parameter(x, 3802);
  }
  function array(x, type) {
    if (!Array.isArray(x))
      return array(Array.from(arguments));
    return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options.shared.typeArrayMap);
  }
  function handler2(query) {
    if (ending)
      return query.reject(Errors.connection("CONNECTION_ENDED", options, options));
    if (open.length)
      return go(open.shift(), query);
    if (closed.length)
      return connect(closed.shift(), query);
    busy.length ? go(busy.shift(), query) : queries.push(query);
  }
  function go(c, query) {
    return c.execute(query) ? move(c, busy) : move(c, full);
  }
  function cancel(query) {
    return new Promise((resolve, reject) => {
      query.state ? query.active ? connection_default(options).cancel(query.state, resolve, reject) : query.cancelled = { resolve, reject } : (queries.remove(query), query.cancelled = true, query.reject(Errors.generic("57014", "canceling statement due to user request")), resolve());
    });
  }
  async function end({ timeout = null } = {}) {
    if (ending)
      return ending;
    await 1;
    let timer2;
    return ending = Promise.race([
      new Promise((r) => timeout !== null && (timer2 = setTimeout(destroy, timeout * 1e3, r))),
      Promise.all(connections.map((c) => c.end()).concat(
        listen.sql ? listen.sql.end({ timeout: 0 }) : [],
        subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
      ))
    ]).then(() => clearTimeout(timer2));
  }
  async function close() {
    await Promise.all(connections.map((c) => c.end()));
  }
  async function destroy(resolve) {
    await Promise.all(connections.map((c) => c.terminate()));
    while (queries.length)
      queries.shift().reject(Errors.connection("CONNECTION_DESTROYED", options));
    resolve();
  }
  function connect(c, query) {
    move(c, connecting);
    c.connect(query);
    return c;
  }
  function onend(c) {
    move(c, ended);
  }
  function onopen(c) {
    if (queries.length === 0)
      return move(c, open);
    let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
    while (ready && queries.length && max-- > 0) {
      const query = queries.shift();
      if (query.reserve)
        return query.reserve(c);
      ready = c.execute(query);
    }
    ready ? move(c, busy) : move(c, full);
  }
  function onclose(c, e) {
    move(c, closed);
    c.reserved = null;
    c.onclose && (c.onclose(e), c.onclose = null);
    options.onclose && options.onclose(c.id);
    queries.length && connect(c, queries.shift());
  }
}
function parseOptions(a, b2) {
  if (a && a.shared)
    return a;
  const env = process.env, o = (!a || typeof a === "string" ? b2 : a) || {}, { url, multihost } = parseUrl(a), query = [...url.searchParams].reduce((a2, [b3, c]) => (a2[b3] = c, a2), {}), host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || "localhost", port = o.port || url.port || env.PGPORT || 5432, user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername();
  o.no_prepare && (o.prepare = false);
  query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
  "timeout" in o && (console.log("The timeout option is deprecated, use idle_timeout instead"), o.idle_timeout = o.timeout);
  query.sslrootcert === "system" && (query.ssl = "verify-full");
  const ints = ["idle_timeout", "connect_timeout", "max_lifetime", "max_pipeline", "backoff", "keep_alive"];
  const defaults = {
    max: globalThis.Cloudflare ? 3 : 10,
    ssl: false,
    sslnegotiation: null,
    idle_timeout: null,
    connect_timeout: 30,
    max_lifetime,
    max_pipeline: 100,
    backoff,
    keep_alive: 60,
    prepare: true,
    debug: false,
    fetch_types: true,
    publications: "alltables",
    target_session_attrs: null
  };
  return {
    host: Array.isArray(host) ? host : host.split(",").map((x) => x.split(":")[0]),
    port: Array.isArray(port) ? port : host.split(",").map((x) => parseInt(x.split(":")[1] || port)),
    path: o.path || host.indexOf("/") > -1 && host + "/.s.PGSQL." + port,
    database: o.database || o.db || (url.pathname || "").slice(1) || env.PGDATABASE || user,
    user,
    pass: o.pass || o.password || url.password || env.PGPASSWORD || "",
    ...Object.entries(defaults).reduce(
      (acc, [k, d]) => {
        const value = k in o ? o[k] : k in query ? query[k] === "disable" || query[k] === "false" ? false : query[k] : env["PG" + k.toUpperCase()] || d;
        acc[k] = typeof value === "string" && ints.includes(k) ? +value : value;
        return acc;
      },
      {}
    ),
    connection: {
      application_name: env.PGAPPNAME || "postgres.js",
      ...o.connection,
      ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
    },
    types: o.types || {},
    target_session_attrs: tsa(o, url, env),
    onnotice: o.onnotice,
    onnotify: o.onnotify,
    onclose: o.onclose,
    onparameter: o.onparameter,
    socket: o.socket,
    transform: parseTransform(o.transform || { undefined: void 0 }),
    parameters: {},
    shared: { retries: 0, typeArrayMap: {} },
    ...mergeUserTypes(o.types)
  };
}
function tsa(o, url, env) {
  const x = o.target_session_attrs || url.searchParams.get("target_session_attrs") || env.PGTARGETSESSIONATTRS;
  if (!x || ["read-write", "read-only", "primary", "standby", "prefer-standby"].includes(x))
    return x;
  throw new Error("target_session_attrs " + x + " is not supported");
}
function backoff(retries) {
  return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
}
function max_lifetime() {
  return 60 * (30 + Math.random() * 30);
}
function parseTransform(x) {
  return {
    undefined: x.undefined,
    column: {
      from: typeof x.column === "function" ? x.column : x.column && x.column.from,
      to: x.column && x.column.to
    },
    value: {
      from: typeof x.value === "function" ? x.value : x.value && x.value.from,
      to: x.value && x.value.to
    },
    row: {
      from: typeof x.row === "function" ? x.row : x.row && x.row.from,
      to: x.row && x.row.to
    }
  };
}
function parseUrl(url) {
  if (!url || typeof url !== "string")
    return { url: { searchParams: /* @__PURE__ */ new Map() } };
  let host = url;
  host = host.slice(host.indexOf("://") + 3).split(/[?/]/)[0];
  host = decodeURIComponent(host.slice(host.indexOf("@") + 1));
  const urlObj = new URL(url.replace(host, host.split(",")[0]));
  return {
    url: {
      username: decodeURIComponent(urlObj.username),
      password: decodeURIComponent(urlObj.password),
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams
    },
    multihost: host.indexOf(",") > -1 && host
  };
}
function osUsername() {
  try {
    return os.userInfo().username;
  } catch (_) {
    return process.env.USERNAME || process.env.USER || process.env.LOGNAME;
  }
}

// api-src/lib/env.ts
function findEnv(names, accept = () => true, env = process.env) {
  for (const name of names) {
    const matches = Object.keys(env).filter((key) => key === name || key.endsWith(`_${name}`)).filter((key) => {
      const value = (env[key] ?? "").trim();
      return value !== "" && accept(value);
    }).sort((a, b2) => a.length - b2.length || a.localeCompare(b2));
    const match = matches[0];
    if (match !== void 0) return { name: match, value: env[match].trim() };
  }
  return null;
}

// api-src/lib/schema.ts
var MIGRATIONS = [
  {
    id: 1,
    name: "initial_schema",
    sql: (
      /* sql */
      `
-- \u2500\u2500\u2500 Administrators \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Email is stored lower-cased by the application; the UNIQUE constraint then gives
-- case-insensitive uniqueness without depending on the citext extension.
CREATE TABLE IF NOT EXISTS admin_users (
  id                    uuid PRIMARY KEY,
  email                 text NOT NULL UNIQUE,
  name                  text NOT NULL DEFAULT '',
  title                 text NOT NULL DEFAULT '',
  avatar_url            text,
  role                  text NOT NULL DEFAULT 'editor',
  -- active | invited | suspended
  status                text NOT NULL DEFAULT 'invited',

  -- NULL until an invited administrator sets a password.
  password_hash         text,
  password_updated_at   timestamptz,
  must_change_password  boolean NOT NULL DEFAULT false,

  -- TOTP secret, encrypted at rest (see api-src/lib/crypto.ts). Never returned by the API.
  totp_secret           text,
  totp_enabled          boolean NOT NULL DEFAULT false,
  totp_confirmed_at     timestamptz,
  -- Hashed single-use recovery codes: [{ "hash": "...", "usedAt": null }]
  recovery_codes        jsonb NOT NULL DEFAULT '[]'::jsonb,

  invite_token_hash     text,
  invite_expires_at     timestamptz,

  -- Brute-force state. Persisted rather than held in memory because each serverless
  -- instance has its own memory, so an in-process counter is trivially bypassed by
  -- spreading attempts across concurrent invocations.
  failed_attempts       integer NOT NULL DEFAULT 0,
  locked_until          timestamptz,

  last_login_at         timestamptz,
  last_login_ip         text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users (role);
CREATE INDEX IF NOT EXISTS admin_users_status_idx ON admin_users (status);

-- \u2500\u2500\u2500 Sessions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Only the SHA-256 of the session token is stored. A database leak therefore does not
-- hand over usable sessions, exactly as with password hashes.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id             uuid PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash     text NOT NULL UNIQUE,
  ip_address     text,
  user_agent     text,
  -- False between password verification and the TOTP step, so a half-authenticated
  -- session cannot reach any content route.
  mfa_satisfied  boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL,
  revoked_at     timestamptz
);

CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON admin_sessions (user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions (expires_at);

-- \u2500\u2500\u2500 Persisted rate limiting \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- A fixed-window counter shared by every instance. Used for login attempts and for
-- capping AI requests.
CREATE TABLE IF NOT EXISTS cms_rate_limits (
  key       text PRIMARY KEY,
  count     integer NOT NULL DEFAULT 0,
  reset_at  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS cms_rate_limits_reset_idx ON cms_rate_limits (reset_at);

-- \u2500\u2500\u2500 Editorial content \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Blog posts, announcements, updates and news share this table. They differ in where
-- they surface and which extras they carry, not in how they are authored, scheduled,
-- previewed or audited \u2014 so one table means one publishing pipeline and one audit path.
CREATE TABLE IF NOT EXISTS content_items (
  id               uuid PRIMARY KEY,
  kind             text NOT NULL,
  status           text NOT NULL DEFAULT 'draft',
  title            text NOT NULL DEFAULT '',
  slug             text NOT NULL,
  excerpt          text NOT NULL DEFAULT '',
  body             jsonb NOT NULL DEFAULT '{"version":1,"blocks":[]}'::jsonb,
  cover_image_url  text,
  author           jsonb,
  category         text,
  tags             text[] NOT NULL DEFAULT '{}',
  seo              jsonb NOT NULL DEFAULT '{}'::jsonb,
  extras           jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Derived on write so listings never have to parse a document to render a card.
  reading_minutes  integer NOT NULL DEFAULT 0,
  search_text      text NOT NULL DEFAULT '',

  published_at     timestamptz,
  scheduled_for    timestamptz,
  archived_at      timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by       uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_email text,
  updated_by_email text,
  revision         integer NOT NULL DEFAULT 1,

  -- Slugs are unique per kind, so a blog post and an announcement may share one.
  CONSTRAINT content_items_kind_slug_key UNIQUE (kind, slug)
);

CREATE INDEX IF NOT EXISTS content_items_feed_idx
  ON content_items (kind, status, published_at DESC);
CREATE INDEX IF NOT EXISTS content_items_status_idx ON content_items (status);
-- Partial index: the scheduler only ever asks for rows still waiting to go live.
CREATE INDEX IF NOT EXISTS content_items_due_idx
  ON content_items (scheduled_for)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS content_items_updated_idx ON content_items (updated_at DESC);
-- to_tsvector with a literal configuration is immutable, so it can be indexed directly.
-- 'english' is core Postgres; no extension required.
CREATE INDEX IF NOT EXISTS content_items_search_idx
  ON content_items USING gin (to_tsvector('english', search_text));

-- \u2500\u2500\u2500 Revisions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- A snapshot per save, which is what makes "revert this change" possible.
CREATE TABLE IF NOT EXISTS content_revisions (
  id               uuid PRIMARY KEY,
  content_id       uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  revision         integer NOT NULL,
  snapshot         jsonb NOT NULL,
  note             text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now(),
  created_by_email text,
  CONSTRAINT content_revisions_unique UNIQUE (content_id, revision)
);

CREATE INDEX IF NOT EXISTS content_revisions_lookup_idx
  ON content_revisions (content_id, revision DESC);

-- \u2500\u2500\u2500 Taxonomies \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Categories and tags are suggestions surfaced in the editor, not a constraint on
-- content_items. Adding one must never require a deploy.
CREATE TABLE IF NOT EXISTS content_taxonomies (
  id         uuid PRIMARY KEY,
  kind       text NOT NULL DEFAULT 'global',
  taxonomy   text NOT NULL,
  name       text NOT NULL,
  slug       text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_taxonomies_unique UNIQUE (kind, taxonomy, slug)
);

-- \u2500\u2500\u2500 Pages \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
CREATE TABLE IF NOT EXISTS cms_pages (
  id               uuid PRIMARY KEY,
  path             text NOT NULL UNIQUE,
  title            text NOT NULL DEFAULT '',
  summary          text NOT NULL DEFAULT '',
  status           text NOT NULL DEFAULT 'draft',
  -- Ordered PageSection[]: structured blocks from the design system, never free layout.
  sections         jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo              jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- True for paths backed by a hand-built React route. Editable, but not deletable:
  -- removing the row would leave a route in the bundle pointing at nothing.
  system_route     boolean NOT NULL DEFAULT false,
  published_at     timestamptz,
  scheduled_for    timestamptz,
  archived_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_email text,
  revision         integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS cms_pages_status_idx ON cms_pages (status);

-- \u2500\u2500\u2500 Global website sections \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Sections belonging to the site rather than to one page: the homepage hero, the
-- partners strip, the FAQ. Addressed by a stable key that a React component looks up.
CREATE TABLE IF NOT EXISTS site_sections (
  key              text PRIMARY KEY,
  label            text NOT NULL,
  group_name       text NOT NULL DEFAULT 'General',
  type             text NOT NULL,
  visible          boolean NOT NULL DEFAULT true,
  status           text NOT NULL DEFAULT 'published',
  fields           jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order       integer NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_email text,
  revision         integer NOT NULL DEFAULT 1
);

-- \u2500\u2500\u2500 Settings \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- One row per settings document: 'design', 'header', 'footer', 'seo', 'general'.
CREATE TABLE IF NOT EXISTS site_settings (
  key              text PRIMARY KEY,
  value            jsonb NOT NULL,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_email text
);

-- \u2500\u2500\u2500 Media \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Metadata only. Bytes live in S3-compatible object storage; storage_key is what a
-- delete acts on. Keeping large files out of Postgres keeps backups and reads sane.
CREATE TABLE IF NOT EXISTS media_assets (
  id                 uuid PRIMARY KEY,
  storage_key        text NOT NULL UNIQUE,
  url                text NOT NULL,
  filename           text NOT NULL,
  mime_type          text NOT NULL,
  size_bytes         bigint NOT NULL DEFAULT 0,
  width              integer,
  height             integer,
  alt                text NOT NULL DEFAULT '',
  folder             text NOT NULL DEFAULT '',
  uploaded_by_email  text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_created_idx ON media_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_folder_idx ON media_assets (folder);
CREATE INDEX IF NOT EXISTS media_assets_search_idx
  ON media_assets USING gin (to_tsvector('english', filename || ' ' || alt));

-- \u2500\u2500\u2500 Activity log \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Append-only. The API never exposes an update or delete for this table.
CREATE TABLE IF NOT EXISTS activity_log (
  id           uuid PRIMARY KEY,
  actor_id     uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  actor_email  text,
  actor_name   text,
  action       text NOT NULL,
  entity_type  text,
  entity_id    text,
  entity_label text,
  outcome      text NOT NULL DEFAULT 'success',
  ip_address   text,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_recent_idx ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_actor_idx ON activity_log (actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_action_idx ON activity_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log (entity_type, entity_id);

-- \u2500\u2500\u2500 AI change requests \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- The review pipeline for AI-assisted changes. 'content' requests apply to CMS data on
-- approval; 'code' requests become a pull request, so a human still merges.
CREATE TABLE IF NOT EXISTS ai_change_requests (
  id                 uuid PRIMARY KEY,
  prompt             text NOT NULL,
  kind               text NOT NULL DEFAULT 'content',
  status             text NOT NULL DEFAULT 'queued',
  summary            text NOT NULL DEFAULT '',
  plan               jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_edits      jsonb NOT NULL DEFAULT '[]'::jsonb,
  code_edits         jsonb NOT NULL DEFAULT '[]'::jsonb,
  checks             jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_url        text,
  branch             text,
  pull_request_url   text,
  review_note        text,
  error_message      text,
  -- The prior state of everything a 'content' request touched, so an applied change
  -- can be rolled back after the fact.
  rollback_snapshot  jsonb,
  requested_by_email text,
  reviewed_by_email  text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_change_requests_status_idx
  ON ai_change_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_change_requests_recent_idx
  ON ai_change_requests (created_at DESC);
`
    )
  },
  {
    id: 2,
    name: "knowledge_base",
    sql: (
      /* sql */
      `
-- \u2500\u2500\u2500 AI assistant knowledge base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Curated facts the PUBLIC chatbot (api/chat) grounds its answers in, so the site owner
-- can teach the assistant without a code change to the static system prompt.
--
-- An entry is either a typed note or the text extracted from an uploaded PDF; 'source_kind'
-- records which. The bytes of a PDF live in object storage like any other media \u2014 only the
-- extracted text is stored here, because that is what retrieval needs.
--
-- Retrieval is native Postgres full-text search over 'search_text' (title + body), exactly as
-- content_items and media_assets already do. Deliberately NOT pgvector: that needs
-- CREATE EXTENSION, which managed Postgres may refuse, and would break the zero-extension
-- guarantee the rest of this schema keeps. 'english' is a core dictionary, no extension needed.
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id                uuid PRIMARY KEY,
  title             text NOT NULL DEFAULT '',
  body              text NOT NULL DEFAULT '',
  -- 'note' (typed) | 'pdf' (extracted). Kept as text, not an enum, so a new source needs
  -- no migration.
  source_kind       text NOT NULL DEFAULT 'note',
  -- Original filename for a PDF, so the UI can show what an entry came from.
  source_name       text,
  -- Where the uploaded document is readable, when the entry came from one.
  source_url        text,
  storage_key       text,
  -- 'active' entries are eligible for retrieval; 'disabled' are kept but never surfaced to
  -- the assistant, so an entry can be parked without deleting it.
  status            text NOT NULL DEFAULT 'active',
  tags              text[] NOT NULL DEFAULT '{}',
  -- Derived on write (title || ' ' || body). Never selected back; only fed to to_tsvector.
  search_text       text NOT NULL DEFAULT '',
  created_by_email  text,
  updated_by_email  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_entries_search_idx
  ON knowledge_entries USING gin (to_tsvector('english', search_text));
CREATE INDEX IF NOT EXISTS knowledge_entries_status_idx
  ON knowledge_entries (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_entries_recent_idx
  ON knowledge_entries (updated_at DESC);
`
    )
  },
  {
    id: 3,
    name: "seed_partner_logos",
    sql: (
      /* sql */
      `
-- Populate the homepage partners strip with the infrastructure providers, each with a
-- self-hosted brand logo (public/partners/*.svg). Before this, the strip's default content was
-- empty, so once the homepage was wired to the CMS it showed only whatever an administrator had
-- typed. This seeds the providers so the strip looks complete out of the box, while leaving any
-- partners the administrator already added in place \u2014 their entries are kept, the providers are
-- prepended. Guarded on the AWS entry so re-running (or an operator who already added AWS) is a
-- no-op rather than creating duplicates.
UPDATE site_sections
SET fields = jsonb_set(
  COALESCE(fields, '{}'::jsonb),
  '{items}',
  '[
    {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
    {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
    {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
    {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
    {"name":"AWS Activate","tagline":"Startup Program","logo":"/partners/aws-activate.svg","url":"https://aws.amazon.com/activate/"},
    {"name":"Resend","tagline":"Transactional Email","logo":"/partners/resend.svg","url":"https://resend.com"}
  ]'::jsonb || COALESCE(fields->'items', '[]'::jsonb)
)
WHERE key = 'home.partners'
  AND NOT (COALESCE(fields->'items', '[]'::jsonb) @> '[{"name":"Amazon Web Services"}]'::jsonb);
`
    )
  },
  {
    id: 4,
    name: "repair_partners_section",
    sql: (
      /* sql */
      `
-- Repair the homepage partners strip so it is present, visible and populated regardless of the
-- state it was left in while editing. Migration 3 only updated an existing row's items; if the
-- row was missing or had been hidden/unpublished, the strip would still not appear once the
-- homepage reads it from the CMS. This upserts the section: it creates it if absent, forces it
-- back to visible + published, and ensures the infrastructure providers are present (prepended,
-- keeping any partners already added). Idempotent \u2014 providers are only added when absent.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES (
  'home.partners', 'Partners strip', 'Home', 'logoStrip', true, 'published',
  '{"heading":"Working with","items":[
    {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
    {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
    {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
    {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
    {"name":"AWS Activate","tagline":"Startup Program","logo":"/partners/aws-activate.svg","url":"https://aws.amazon.com/activate/"},
    {"name":"Resend","tagline":"Transactional Email","logo":"/partners/resend.svg","url":"https://resend.com"}
  ]}'::jsonb,
  40
)
ON CONFLICT (key) DO UPDATE SET
  visible = true,
  status = 'published',
  fields = jsonb_set(
    COALESCE(site_sections.fields, '{}'::jsonb),
    '{items}',
    CASE
      WHEN COALESCE(site_sections.fields->'items', '[]'::jsonb) @> '[{"name":"Amazon Web Services"}]'::jsonb
        THEN site_sections.fields->'items'
      ELSE '[
        {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
        {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
        {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
        {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
        {"name":"AWS Activate","tagline":"Startup Program","logo":"/partners/aws-activate.svg","url":"https://aws.amazon.com/activate/"},
        {"name":"Resend","tagline":"Transactional Email","logo":"/partners/resend.svg","url":"https://resend.com"}
      ]'::jsonb || COALESCE(site_sections.fields->'items', '[]'::jsonb)
    END
  ),
  updated_at = now();
`
    )
  },
  {
    id: 5,
    name: "hero_current_copy",
    sql: (
      /* sql */
      `
-- The homepage hero is now rendered from this section. Set its content to the copy the site
-- already displays, so wiring it changes nothing visible. Only applied when the hero still holds
-- the original generic seed heading, so an operator who has edited it is left untouched. In the
-- heading, a newline splits the line and [[...]] marks the phrase shown in the accent colour.
UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "Technology Group \xB7 Building for Africa",
  "heading": "We build the technology\\n[[behind Africa''s next]]\\ngeneration of\\nbusinesses.",
  "subheading": "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
  "primaryCtaLabel": "Explore our products",
  "primaryCtaUrl": "/portfolio",
  "secondaryCtaLabel": "What we build",
  "secondaryCtaUrl": "/about"
}'::jsonb,
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'Technology products for financial services, commerce, and communication';
`
    )
  },
  {
    id: 6,
    name: "home_bands_current_copy",
    sql: (
      /* sql */
      `
-- The hero's statistics strip and the product band's heading are now rendered from these
-- sections, so set them to the copy the site already displays \u2014 wiring them changes nothing
-- visible. Each is guarded on its original seed value, so a band an operator has already edited
-- is left alone.
UPDATE site_sections
SET fields = fields || '{
  "heading": "Built for scale",
  "items": [
    {"value":"4","label":"Products in Ecosystem"},
    {"value":"99.99%","label":"Infrastructure SLA"},
    {"value":"< 14ms","label":"API Latency P50"},
    {"value":"AES-256","label":"Encryption Standard"}
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Products in the portfolio"}]'::jsonb;

UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "What we''re building",
  "heading": "Products and platforms.\\nBuilt to one standard.",
  "subheading": "ENICE Group takes hard problems in financial services and business communication and turns them into products people can rely on."
}'::jsonb,
    updated_at = now()
WHERE key = 'home.products'
  AND fields->>'heading' = 'What we build';
`
    )
  },
  {
    id: 7,
    name: "home_product_cards",
    sql: (
      /* sql */
      `
-- The homepage product band renders its cards from this section's items. Its seeded items were a
-- five-entry product list that the homepage never rendered, so set them to the three cards the
-- band actually shows \u2014 wiring the cards changes nothing visible, and they become editable.
-- Guarded on the original seed (the PulsePay entry), so a list an operator has already edited is
-- left untouched. Bullets are newline-separated in one field; card numbering is positional.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
  {
    "icon": "Banknote",
    "kicker": "Fintech",
    "title": "Financial Infrastructure Systems",
    "description": "Transaction networks, ledger databases, and virtual card infrastructure built for Nigeria''s digital economy, with room to expand across the region.",
    "bullets": "Virtual Card Issuance\\nTreasury and Ledger\\nKYC and Compliance Tooling"
  },
  {
    "icon": "BrainCircuit",
    "kicker": "Artificial Intelligence",
    "title": "Autonomous Enterprise AI",
    "description": "Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
    "bullets": "Autonomous Customer Support\\nPolicy-Bound AI Agents\\nWorkflow Automation"
  },
  {
    "icon": "Boxes",
    "kicker": "Product Engineering",
    "title": "Products built to operate",
    "description": "We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
    "bullets": "Product Ownership\\nPlatform Engineering\\nContinuous Operation"
  }
]'::jsonb),
    updated_at = now()
WHERE key = 'home.products'
  AND fields->'items' @> '[{"title":"PulsePay"}]'::jsonb;
`
    )
  },
  {
    id: 8,
    name: "home_faq_current_copy",
    sql: (
      /* sql */
      `
-- The homepage FAQ is now rendered from this section, and its FAQPage search markup is generated
-- from the same questions, so the two can never describe different things. Seed the section with
-- the questions the page already shows. Guarded on the items list still being empty, so an FAQ an
-- operator has already written is left untouched.
UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "Frequently asked",
  "heading": "Questions, answered.",
  "subheading": "A plain look at the company, the products, and the technology behind them.",
  "items": [
    {
      "question": "What does ENICE Group build?",
      "answer": "ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform. PulseAssist handles AI-powered business communication and customer support."
    },
    {
      "question": "Which problems are ENICE products built to solve?",
      "answer": "Our products focus on financial services, telecommunications, and business operations. PulsePay covers digital finance, PulseAssist covers business communication and customer support, and ePulse and PulseX extend the ecosystem into digital banking and digital assets."
    },
    {
      "question": "What does the ENICE Core provide?",
      "answer": "A shared AI and automation pipeline, a fast ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Every product inherits the same scale, security, and observability from day one."
    },
    {
      "question": "How does ENICE Group approach security and compliance?",
      "answer": "We run a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous monitoring. Every system is built for regulatory readiness from day one and aligned with SOC 2 control objectives."
    },
    {
      "question": "How can businesses access ENICE products?",
      "answer": "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, licensing, or integration requirements."
    }
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND COALESCE(jsonb_array_length(fields->'items'), 0) = 0;
`
    )
  },
  {
    id: 9,
    name: "about_contact_current_copy",
    sql: (
      /* sql */
      `
-- The About page header and principles band, and the Contact page header, now render from these
-- sections. Seed them with the copy those pages already show, so wiring changes nothing visible.
-- 'about.hero' did not exist before, so it is inserted; the other two are updated only while they
-- still hold their original seed values, leaving an edited band untouched.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.hero', 'About page header', 'About', 'hero', true, 'published',
  '{
  "eyebrow": "About ENICE Group",
  "heading": "We build technology products. [[Then we operate them.]]",
  "subheading": "ENICE Group is the parent company behind a growing set of software products. We find real problems in financial services, commerce, and business communication, then build and run the platforms that solve them."
}'::jsonb, 105)
ON CONFLICT (key) DO NOTHING;

UPDATE site_sections
SET fields = fields || '{
  "heading": "Our Principles",
  "subheading": "These aren''t aspirational values written for a careers page. They''re the standards we hold every decision, every system, and every person on the team to.",
  "items": [
    {
      "title": "Long-Term Thinking",
      "description": "We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won''t trade long-term integrity for short-term convenience."
    },
    {
      "title": "Engineering Excellence",
      "description": "We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty."
    },
    {
      "title": "Security by Design",
      "description": "Security isn''t added after a product ships. It''s built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners'' data as our responsibility."
    },
    {
      "title": "Customer Obsession",
      "description": "We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it."
    },
    {
      "title": "Institutional Quality",
      "description": "We build for enterprise, not for early adopters willing to tolerate rough edges. Our documentation, onboarding, support, and SLA commitments are built to satisfy legal, compliance, and procurement teams at serious organisations."
    },
    {
      "title": "Responsible AI",
      "description": "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don''t release a capability until we''re confident in its reliability and we can explain how it works."
    },
    {
      "title": "Continuous Innovation",
      "description": "Staying relevant takes sustained investment in research and experimentation. It isn''t one team''s job, it''s built into how every product team works. We set aside engineering time for exploratory work because what we build in five years doesn''t have a name yet."
    },
    {
      "title": "Ownership Mentality",
      "description": "Everyone at ENICE, from engineers to operations leads, is expected to think like an owner: accountable, deeply knowledgeable in their domain, and biased toward action. We trust people to lead, and we hold them to that standard."
    }
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'about.values'
  AND COALESCE(jsonb_array_length(fields->'items'), 0) = 0;

UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "Corporate Engagement",
  "heading": "Get in Touch",
  "subheading": "Reach the ENICE Group team about product access, platform integration, enterprise licensing, or technology partnerships."
}'::jsonb,
    updated_at = now()
WHERE key = 'contact.details'
  AND fields->>'heading' = 'Contact ENICE Group';
`
    )
  },
  {
    id: 10,
    name: "about_prose_bands",
    sql: (
      /* sql */
      `
-- The About page's five numbered prose bands now render from these sections. Create them with the
-- copy those bands already show, so wiring changes nothing visible. ON CONFLICT DO NOTHING means a
-- band an operator has already written is never overwritten, and re-running is a no-op.
--
-- Paragraphs are separated by a blank line inside 'body'. Note the doubled backslashes: this SQL
-- lives in a JavaScript template literal, where a lone backslash-n would become a real newline and
-- Postgres rejects an unescaped newline inside a JSON string.
--
-- 'about.intro' was seeded as an unused richText section with an empty body, rendering nowhere.
-- Remove it (only while still empty) so the About group carries no dead section; 'about.story'
-- replaces it, using a plain-paragraph type that inherits the page's own typography.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.story', 'Our Story', 'About', 'prose', true, 'published', '{
  "heading": "Our Story",
  "body": "ENICE Group started from one observation: the biggest problems facing African businesses aren''t problems of ambition, they''re problems of infrastructure. The software systems and financial rails that large organisations rely on elsewhere have historically been too expensive, too inaccessible, or simply missing for businesses in emerging markets.\\n\\nWe''re building more than one product on the same foundation. The same engineering standards and shared infrastructure can support multiple purpose-built platforms, each serving a distinct need and strengthening the system around it.\\n\\nThis isn''t a collection of separate experiments. It''s a deliberate approach: shared infrastructure compounds in value, and the quality of one product raises the bar for whatever we build next."
}'::jsonb, 130)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.mission', 'Our Mission', 'About', 'prose', true, 'published', '{
  "heading": "Our Mission",
  "body": "We want to build the technology layer that lets businesses, institutions, and developers across Africa, and eventually beyond, operate at real scale. Not software that works well enough, but software built with the reliability, security, and performance that institutional operations require.\\n\\nOur customers aren''t test users. They''re financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them with platforms that are secure by design and built to hold up under real commercial volume.\\n\\nWe''re aiming for structural impact, not just features. When payment infrastructure is reliable, commerce expands. When enterprise AI is trustworthy, teams get more done. When developer tools are solid, the next generation of companies gets built faster. That''s the impact we''re here for."
}'::jsonb, 140)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.vision', 'Our Vision', 'About', 'prose', true, 'published', '{
  "heading": "Our Vision",
  "body": "Over the next ten to twenty years, we want to build what Africa doesn''t yet have: a home-grown technology infrastructure group that competes globally, not one that just follows trends.\\n\\nWe''re building toward a future where African-originated financial infrastructure is trusted across multiple continents, where enterprise AI built here sets the regional standard for reliability, and where developer tools from our ecosystem are chosen by builders worldwide because they''re simply good.\\n\\nThat''s a ten-to-twenty-year project. It takes discipline and patience most organisations aren''t built to sustain. We''re structured for the long run, not the short cycle of a typical startup."
}'::jsonb, 150)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.ecosystem', 'Our Ecosystem', 'About', 'prose', true, 'published', '{
  "heading": "Our Ecosystem",
  "body": "The most important part of the ENICE Group model isn''t any single product, it''s the infrastructure they share. Every product we build runs on the same engineering foundation: the same security architecture, the same zero-trust access model, the same data isolation standards, and the same deployment pipeline.\\n\\nThat shared foundation pays off twice. Each new product reaches production-grade reliability faster, because the hard infrastructure problems are already solved at the group level. And each existing product gets stronger as we add new ones, through shared investment and shared operational standards.\\n\\nThe result is a set of products that gets more capable with each addition. Security improvements spread across the ecosystem. Infrastructure work lifts every product. Compliance work done once serves every regulated platform.\\n\\nThat''s why we call it an ecosystem rather than a collection of products. They''re built to compound."
}'::jsonb, 160)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.outlook', 'Looking Ahead', 'About', 'prose', true, 'published', '{
  "heading": "Looking Ahead",
  "body": "The financial and technological infrastructure African businesses depend on is still largely being built. That''s not a criticism, it''s just where things stand, and it''s the opportunity we''re focused on.\\n\\nWe want to build the systems businesses on this continent will run on for the next generation. This isn''t charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it.\\n\\nWe''re also building for a global market. What we build will scale across regions, meet international compliance standards, and compete with any equivalent platform anywhere. We''re not trying to be the best option in Nigeria or in Africa. We''re trying to be the best option, period.\\n\\nTo the businesses that use our products, and the engineers and operators who build with us: we''re committed to building technology that matters, to a standard that matters, and taking the time it takes to do it properly."
}'::jsonb, 170)
ON CONFLICT (key) DO NOTHING;

DELETE FROM site_sections
WHERE key = 'about.intro'
  AND COALESCE(jsonb_array_length(fields->'body'->'blocks'), 0) = 0;
`
    )
  },
  {
    id: 11,
    name: "portfolio_page_headers",
    sql: (
      /* sql */
      `
-- Each portfolio page's header (eyebrow, headline, supporting copy) now renders from its own
-- section. Create them with the copy those pages already show, so wiring changes nothing visible.
-- ON CONFLICT DO NOTHING leaves a header an operator has edited untouched and makes re-runs a no-op.
--
-- Two headings carry a [[\u2026]] marker: the ePulse and PulseX wordmarks style part of the name in the
-- accent colour, and that is expressed in the text rather than in markup so it stays editable.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.index', 'Products page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "ENICE Products",
  "heading": "Products built by ENICE Group",
  "subheading": "Payments, financial services, business communication, and digital commerce. Each product runs on the same infrastructure and is built to operate at scale."
}'::jsonb, 200)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay', 'PulsePay page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "Fintech Infrastructure Platform",
  "heading": "PulsePay",
  "subheading": "A virtual payment platform that issues Naira and USD cards, handles KYC verification, moves funds between users, and delivers value-added services with speed and reliability."
}'::jsonb, 210)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist', 'PulseAssist page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "Enterprise Conversational SaaS",
  "heading": "PulseAssist",
  "subheading": "A multi-tenant AI operations platform for telecoms and financial networks. It handles customer support routing, provides API-driven account management, and hands calls to live agents in real time when needed."
}'::jsonb, 220)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse', 'ePulse page', 'Portfolio', 'hero', true, 'published', '{
  "heading": "e[[Pulse]]",
  "subheading": "ePulse is ENICE Group''s upcoming global financial platform, built for people who **earn, send, and spend money across borders**. Designed for freelancers, remote workers, creators, and global businesses, ePulse aims to make international finance *simple and accessible*."
}'::jsonb, 230)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsex', 'PulseX page', 'Portfolio', 'hero', true, 'published', '{
  "heading": "Pulse[[X]]",
  "subheading": "PulseX is ENICE Group''s digital asset platform, designed to make cryptocurrency and digital finance **simple, secure, and accessible**. The platform will let users manage digital assets easily, while staying connected to the broader ENICE ecosystem."
}'::jsonb, 240)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection', 'Payment Collection page', 'Portfolio', 'hero', true, 'published', '{
  "heading": "PulsePay Payment Collection",
  "subheading": "Simple, reliable payment infrastructure for modern businesses. Accept and manage customer payments through a single, developer friendly integration."
}'::jsonb, 250)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 12,
    name: "home_bands_made_editable",
    sql: (
      /* sql */
      `
-- Seven homepage bands were hardcoded in React and could only be changed by a deploy: the featured
-- products, the ENICE Core, the technology stack, the company band, the founders' letter and the
-- hiring band. They are now sections, seeded here with the copy those bands already render, so
-- wiring them changes nothing visible and the next edit does not need an engineer.
--
-- ON CONFLICT DO NOTHING throughout, so this is a no-op on re-run and never overwrites an edit.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.portfolio', 'Featured products', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "Built and operated by ENICE",
  "heading": "The products we run.\\nNot a services menu.",
  "subheading": "Each one began as a problem we hit ourselves, and each one is a platform we operate day to day rather than hand over.",
  "items": [
    {"icon":"CreditCard","kicker":"Fintech infrastructure","title":"PulsePay","description":"A virtual payment platform for modern commerce: instant Naira card issuance, programmable wallets, embedded KYC, and peer-to-peer transfers built for Nigerian institutions.","bullets":"Cards: Naira & USD\\nMarket: Nigeria","url":"/portfolio/pulsepay"},
    {"icon":"BrainCircuit","kicker":"Enterprise AI","title":"PulseAssist","description":"An AI operations platform for banking, fintech, and telecoms, with automated queue handling, live agent handoff, and policy-bound workflow automation.","bullets":"Channels: WhatsApp, web, email, SMS, voice\\nTenancy: Multi-tenant","url":"/portfolio/pulseassist"},
    {"icon":"Banknote","kicker":"Fintech infrastructure","title":"PulsePay Payment Collection","description":"Payment infrastructure for businesses to accept and manage customer payments through a single, developer friendly API, with real time updates and webhook notifications.","bullets":"Launch: Q1 2027\\nIntegration: One API","url":"/portfolio/payment-collection"}
  ]
}'::jsonb, 32)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.core', 'The ENICE Core', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "What powers our products",
  "heading": "The ENICE Core.",
  "subheading": "Every product we operate runs on a shared infrastructure core, so the software customers use inherits scale, compliance, and reliability from the ground up.",
  "items": [
    {"icon":"Cpu","title":"Unified AI and Automation Pipeline","description":"Centralized LLM orchestration and vector search routing that powers products like PulseAssist across every tenant."},
    {"icon":"Database","title":"High-Velocity Ledger and Payment Core","description":"A fast transaction engine and virtual account infrastructure that anchors PulsePay and the financial products we build next."},
    {"icon":"FileCheck2","title":"Automated Compliance and KYC Layer","description":"Identity verification, fraud detection, and regulatory screening, run in real time and shared across every product."},
    {"icon":"Globe","title":"Global Cloud Grid","description":"Managed database clustering and serverless edge delivery, so the same infrastructure serves every product without each one reinventing it."}
  ]
}'::jsonb, 34)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.infrastructure', 'Technology stack', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "Technology foundation",
  "heading": "The stack underneath.",
  "subheading": "Every ENICE Group product runs on the same backbone. We chose it for reliability, compliance, and scale, not because it was the easy option.",
  "items": [
    {"kicker":"AWS","title":"Amazon Web Services","description":"Our main cloud backbone. It handles compute, storage, and edge delivery across every ENICE Group platform.","bullets":"Cloud infrastructure and security"},
    {"kicker":"GCP","title":"Google Cloud","description":"Runs PulseAssist''s AI pipeline: LLM orchestration and workflow automation across tenants, with Gemini as the model layer.","bullets":"Core AI engine and computational intelligence"},
    {"kicker":"PG","title":"Supabase","description":"Row-level security, real-time data streams, and managed Postgres for PulsePay''s transaction systems.","bullets":"Database infrastructure and auth"}
  ]
}'::jsonb, 36)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.company', 'Company band', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "The company",
  "heading": "ENICE Group is a product company.",
  "subheading": "We are the parent company behind a growing set of software platforms. We find real problems in financial services, commerce, and business communication, then build and run the products that solve them.",
  "items": [
    {"title":"We start from the friction","description":"Every product traces back to something that failed in ordinary use: a payment that should have been simple, a support queue nobody answered. We build from the specific problem outward, not from a category we want to be in."},
    {"title":"One core, many products","description":"Ledgers, identity, AI orchestration and compliance are solved once and shared. A new product inherits that foundation on its first day instead of rebuilding it, which is what makes a small team''s output look like a much larger one."},
    {"title":"We operate what we ship","description":"We own the products end to end \u2014 engineering, launch, and the day-to-day running of them. Nothing is handed to someone else to keep alive, which keeps the cost of a bad decision with the people who made it."},
    {"title":"Built to still be here","description":"We design for the version of these systems that exists in ten years: versioned APIs, documented internals, and infrastructure choices made for reliability rather than novelty. Regulated markets do not reward clever."}
  ]
}'::jsonb, 38)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.founders', 'Founders'' letter', 'Home', 'prose', true, 'published', '{
  "eyebrow": "From the founders",
  "heading": "A letter from the founders",
  "body": "Every good business runs on good infrastructure. That''s the idea behind ENICE Group. We don''t build technology for its own sake. We build products that solve real problems and give people and businesses infrastructure they can depend on for years.\\n\\nThat idea didn''t start in a boardroom. It came from everyday life in Nigeria: calling a company for help and waiting too long, dealing with poor service, hitting friction that shouldn''t exist. It came from financial platforms that failed exactly when we needed them, from declined international cards to simple payments that turned into a headache.\\n\\nWe decided that shouldn''t be normal. ENICE Group exists because African businesses and consumers deserve technology that is reliable, secure, and built to the same standard as anywhere else. Every product we launch is a step toward that, for Africa first, and for the world as we grow."
}'::jsonb, 40)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.careers', 'Hiring band', 'Home', 'cta', true, 'published', '{
  "eyebrow": "Join the builders",
  "heading": "Build products that matter.",
  "subheading": "We work with people who care about product quality, solid engineering, and technology that holds up at real scale. If that sounds like you, we want to hear from you.",
  "ctaLabel": "Meet the team",
  "ctaUrl": "/contact",
  "style": "standard"
}'::jsonb, 60)
ON CONFLICT (key) DO NOTHING;

-- The stats strip carried three claims nothing backs \u2014 a 99.99% SLA, a < 14ms p50 latency and an
-- encryption standard as a headline metric \u2014 plus a product count that was wrong (4 for five).
-- All four were deleted from the page long ago, but this section still served them, so any site
-- reading the CMS published them again. Replaced only while the row still holds those exact seeded
-- values, so an operator who has already curated this band is left alone.
UPDATE site_sections
SET fields = fields || '{
  "items": [
    {"value": "5", "label": "Products in the ecosystem"},
    {"value": "2", "label": "Offices in Nigeria"}
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Infrastructure SLA"}]'::jsonb;

-- The hero headline's hardcoded line breaks were tuned for one viewport and ragged at every other,
-- and the [[highlight]] put two lines of display-size accent colour at the top of the page. Both
-- are still available to an editor; the shipped copy simply no longer uses them. Guarded on the
-- original string, so an edited headline is untouched.
UPDATE site_sections
SET fields = jsonb_set(
      fields,
      '{heading}',
      '"We build the technology behind Africa''s next generation of businesses."'::jsonb
    ),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'We build the technology
[[behind Africa''s next]]
generation of
businesses.';
`
    )
  },
  {
    id: 13,
    name: "product_page_bands_and_roadmap_made_editable",
    sql: (
      /* sql */
      `
-- Migration 11 made each product page's *header* editable and stopped there. Everything below the
-- header stayed hardcoded in React: the capability grids, the facts strips, the sector tiles, the
-- compliance pills, the launch framing on the three unlaunched products, the homepage's platform
-- capabilities band, and the roadmap. Those are the most perishable things on the site \u2014 a
-- milestone slips, a channel is added, a mechanism lands \u2014 and every one of them needed an engineer
-- and a deploy to change.
--
-- Each band below is now a section, using an existing section type so the admin form and the
-- sanitiser already understand it, and seeded here with exactly the copy the page already renders.
-- Wiring therefore changes nothing visible; the next edit simply no longer needs a deploy. Each
-- component also keeps its built-in copy as a fallback, which is what paints before the CMS answers
-- and what survives an outage.
--
-- ON CONFLICT (key) DO NOTHING throughout, so this is a no-op on re-run and never overwrites an
-- edit an administrator has already made.
--
-- Two conventions are worth stating, because the code parses them back out:
--
--   * Launch-fact strips are \`statistics\` sections, which carry a value and a label and nothing
--     else. Which row carries the accent is a styling decision, not content, so it is not stored:
--     the first row is the status row and the component accents it by position.
--
--   * Roadmap milestones are \`steps\` rows, which carry a title and a description. A milestone needs
--     four more things, so they are written as \`label: value\` lines at the top of the description,
--     with the body after a blank line:
--
--         when: Q4 2026
--         status: in-progress
--         product: PulseAssist
--         tags: AI, B2B, Telecom
--
--         First rollout of support automation \u2026
--
--     Only leading lines matching when/status/product/tags are read as metadata; the first line
--     that does not starts the body. \`status\` accepts completed, in-progress or planned, and
--     anything else \u2014 including a missing status \u2014 resolves to planned rather than throwing. See
--     \`parseMilestone\` in src/components/site/Roadmap.tsx.

-- \u2500\u2500\u2500 Home \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.capabilities', 'Platform capabilities', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform capabilities",
  "heading": "How the platform is built.",
  "subheading": "Mechanisms in place across every product. Current availability is reported on the status page.",
  "items": [
    {"icon":"Gauge","kicker":"API delivery","title":"Edge","description":"Multi-region, served from the nearest edge"},
    {"icon":"Activity","kicker":"Tenant isolation","title":"Row-level","description":"Enforced in the database, not the application"},
    {"icon":"ShieldCheck","kicker":"Data encryption","title":"TLS + at rest","description":"Managed database and object storage"},
    {"icon":"Zap","kicker":"Card issuance","title":"< 5s","description":"Virtual card provisioning"},
    {"icon":"Lock","kicker":"KYC verification","title":"Real-time","description":"Automated compliance checks"}
  ]
}'::jsonb, 35)
ON CONFLICT (key) DO NOTHING;

-- Nine milestones. \`SECTION_SCHEMAS.steps\` caps its repeater at eight rows, which only bites on a
-- write path: this insert writes the JSON directly, so every milestone survives here.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.roadmap', 'Strategic roadmap', 'Home', 'steps', true, 'published', '{
  "heading": "Built step by step, for the long run.",
  "subheading": "Our roadmap follows the maturity of the platforms we operate, sequenced so each step builds on the last.",
  "items": [
    {"title":"Shared Ecosystem Framework","description":"when: Q1 2026\\nstatus: completed\\nproduct: ENICE Core\\ntags: Infrastructure, AI, Compliance\\n\\nThe unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product."},
    {"title":"Extended Pilot with Regional Treasury Partners","description":"when: Q3 2026\\nstatus: completed\\nproduct: PulsePay\\ntags: Fintech, Wallets, KYC\\n\\nProgrammable wallets, instant virtual card issuance, and embedded compliance controls, rolled out to a wider pilot group across West Africa."},
    {"title":"Enterprise B2B Launch","description":"when: Q4 2026\\nstatus: in-progress\\nproduct: PulseAssist\\ntags: AI, B2B, Telecom\\n\\nFirst rollout of support automation to banking, fintech, and telecom partners, with policy-bound agents and live-agent failover."},
    {"title":"Developer API Public Beta","description":"when: Q2 2026\\nstatus: in-progress\\nproduct: PulsePay\\ntags: API, Developer, Fintech\\n\\nThe ENICE Core API opens to verified integration partners, with wallet issuance, ledger, KYC, and Assist endpoints available in a sandbox."},
    {"title":"Multi-Currency Expansion","description":"when: Q3 2026\\nstatus: planned\\nproduct: PulsePay\\ntags: Fintech, Multi-Currency, Treasury\\n\\nMulti-currency wallet rails, programmable spend controls, and embedded treasury operations for the payment platform."},
    {"title":"Payment Collection Launch","description":"when: Q1 2027\\nstatus: planned\\nproduct: PulsePay\\ntags: Fintech, Payments, API\\n\\nPulsePay Payment Collection launches: a unified API for businesses to accept and manage customer payments, with real time status updates and webhook notifications."},
    {"title":"Global Digital Asset Exchange Private Beta","description":"when: Q3 2027\\nstatus: planned\\nproduct: PulseX\\ntags: Crypto, Exchange, Global\\n\\nPulseX opens to institutional and qualified retail participants, with support for major digital asset pairs, custody, and compliance reporting."},
    {"title":"Digital Banking Infrastructure Closed Alpha","description":"when: Q4 2027\\nstatus: planned\\nproduct: ePulse\\ntags: Banking, Alpha\\n\\nePulse begins closed alpha with select institutional partners: digital banking core, account management, and statement APIs."},
    {"title":"Universal Financial Hub","description":"when: 2027\\nstatus: planned\\nproduct: ENICE Core\\ntags: Infrastructure, Global, Liquidity\\n\\nA global virtual-dollar and asset infrastructure layer connecting institutional liquidity across markets through a single API."}
  ]
}'::jsonb, 45)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulsePay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay.stats', 'PulsePay facts strip', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulsePay at a glance",
  "items": [
    {"value":"Naira & USD","label":"Card currencies"},
    {"value":"2","label":"Currency rails (NGN + USD)"},
    {"value":"Every account","label":"KYC screening"}
  ]
}'::jsonb, 211)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay.features', 'PulsePay capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform Capabilities",
  "heading": "Everything a modern payments stack should be.",
  "subheading": "PulsePay covers the whole of everyday money: accounts, transfers, cards, bills, protection and a built-in assistant, in one platform.",
  "items": [
    {"icon":"Landmark","title":"Instant Naira Bank Accounts","description":"Get a dedicated Nigerian bank account in minutes to receive salaries, collect payments, and hold funds securely."},
    {"icon":"Send","title":"Fast Transfers & P2P Payments","description":"Send money instantly to any Nigerian bank account or transfer between PulsePay wallets with zero friction."},
    {"icon":"CreditCard","title":"Naira & USD Virtual Cards","description":"Issue Naira and USD virtual cards in seconds for seamless local checkouts, international subscriptions, and global online spend."},
    {"icon":"Receipt","title":"Bills, Airtime & Utilities","description":"Pay electricity, cable TV, internet, airtime, and data bills in seconds with instant receipts and automated recurring schedules."},
    {"icon":"ShieldCheck","title":"Built-in KYC & Fraud Protection","description":"Tiered identity verification, real-time transaction screening, and dual-control security protecting every account and transfer."},
    {"icon":"Sparkles","title":"Fin AI Financial Assistant","description":"Track spending, get smart cashflow insights, and execute transfers or bill payments using natural voice and text commands."}
  ]
}'::jsonb, 212)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay.compliance', 'PulsePay compliance', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Compliance & Regulation",
  "heading": "Built for regulated markets from the ground up.",
  "subheading": "PulsePay operates within Nigeria''s regulatory framework, with row-level security, KYC screening on every account, and audit logging of privileged actions.",
  "items": [
    {"title":"Row-Level Security"},
    {"title":"Tenant Isolation"},
    {"title":"Audit Logging"},
    {"title":"KYC Screening"}
  ]
}'::jsonb, 213)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulseAssist \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.stats', 'PulseAssist facts strip', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulseAssist at a glance",
  "items": [
    {"value":"WhatsApp \xB7 Web \xB7 Email \xB7 SMS \xB7 Voice","label":"Channels"},
    {"value":"Multi-tenant","label":"Architecture"}
  ]
}'::jsonb, 221)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.features', 'PulseAssist capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform Capabilities",
  "heading": "Operations that run themselves.",
  "subheading": "PulseAssist covers the full customer operations lifecycle, from first contact to resolution, without needing a human for every interaction.",
  "items": [
    {"icon":"Inbox","title":"Five channels, one inbox","description":"WhatsApp, web chat, email, SMS and voice answered from a single shared inbox, so support is consistent wherever people reach you."},
    {"icon":"MessageSquare","title":"Autonomous support routing","description":"AI-driven triage and routing that resolves common queries without human intervention."},
    {"icon":"ShieldCheck","title":"Policy-bound agents","description":"Conversational agents that operate strictly within configurable organisational policies."},
    {"icon":"Zap","title":"Real-time live-agent handoff","description":"Escalation to a human agent mid-conversation, with full context preserved."},
    {"icon":"Globe","title":"API-driven account management","description":"Agents can query and update account state through secure, scoped API integrations."},
    {"icon":"Network","title":"Multi-tenant architecture","description":"Enterprise-grade isolation between clients with dedicated model and routing configs."},
    {"icon":"FileCheck2","title":"Compliance-ready audit trails","description":"Every interaction is logged, timestamped, and exportable for regulatory review."}
  ]
}'::jsonb, 222)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.sectors', 'PulseAssist sectors served', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Sectors Served",
  "heading": "Built for businesses that put customer communication first.",
  "items": [
    {"icon":"CreditCard","title":"Fintech"},
    {"icon":"ShoppingBag","title":"E-commerce & Retail"},
    {"icon":"HeartPulse","title":"Healthcare & Wellness"},
    {"icon":"Cloud","title":"Technology & SaaS"}
  ]
}'::jsonb, 223)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.compliance', 'PulseAssist compliance', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Enterprise Compliance",
  "heading": "Every interaction is compliant by design.",
  "subheading": "PulseAssist maintains comprehensive audit trails of every agent interaction. Policy configurations are version-controlled, every model decision is logged, and all data is tenant-isolated, meeting the regulatory requirements of banking and telecom in Africa and beyond.",
  "items": [
    {"title":"Tenant Isolation"},
    {"title":"Audit Logs"},
    {"title":"Policy Versioning"},
    {"title":"Row-Level Security"}
  ]
}'::jsonb, 224)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 ePulse \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse.facts', 'ePulse launch facts', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "ePulse launch framing",
  "items": [
    {"value":"In Development","label":"Status"},
    {"value":"To Be Announced","label":"Expected Launch"}
  ]
}'::jsonb, 231)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse.audience', 'ePulse audience', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Built For",
  "heading": "People who live and work globally.",
  "items": [
    {"icon":"Briefcase","title":"Freelancers","description":"Get paid in USD, GBP, or EUR directly from international clients."},
    {"icon":"Users","title":"Remote Workers","description":"Receive your salary, save in multiple currencies, spend globally."},
    {"icon":"CreditCard","title":"Creators","description":"Monetise your content globally and manage earnings in one place."},
    {"icon":"Globe2","title":"Global Businesses","description":"Pay international suppliers and accept payments from anywhere."}
  ]
}'::jsonb, 232)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse.vision', 'ePulse vision', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "The Vision",
  "heading": "International finance, made simple.",
  "subheading": "The ePulse platform includes everything you need to live your financial life without borders, from day-to-day spending to long-distance transfers to lifestyle services.",
  "items": [
    {"icon":"Wallet","title":"Multi-currency accounts","description":"Hold and manage balances in the currencies that matter to you: NGN, USD, GBP, EUR and more, from a single account."},
    {"icon":"Building2","title":"Dedicated receiving accounts","description":"Local account details for supported countries, including the US, UK, and Europe. Get paid like a local from anywhere."},
    {"icon":"Send","title":"Fast international transfers","description":"Send money across borders with predictable timing, transparent fees, and clear pricing. No surprises."},
    {"icon":"Globe2","title":"Global payment solutions","description":"Pay and get paid anywhere your work takes you, from client invoices to vendor payments across continents."},
    {"icon":"Gift","title":"Gift card marketplace","description":"Buy and redeem gift cards from trusted global and local brands, all within the ePulse platform."},
    {"icon":"Plane","title":"Lifestyle services","description":"Book hotels, plan travel, and access premium experiences. Good finance should make life easier too."}
  ]
}'::jsonb, 233)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulseX \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsex.facts', 'PulseX launch facts', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulseX launch framing",
  "items": [
    {"value":"Planned Project","label":"Status"},
    {"value":"Q3 2027","label":"Launch"},
    {"value":"Digital Assets","label":"Category"}
  ]
}'::jsonb, 241)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsex.highlights', 'PulseX capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform Capabilities",
  "heading": "Digital assets, without the friction.",
  "subheading": "PulseX will let users manage digital assets easily, fully integrated across the broader ENICE Group ecosystem.",
  "items": [
    {"icon":"BarChart3","title":"Multi-asset trading","description":"Trade major digital assets with deep liquidity and institutional-grade execution: Bitcoin, Ethereum, and beyond."},
    {"icon":"Lock","title":"Secure custody","description":"Cold storage, multi-signature protection, and continuous on-chain monitoring for every asset in your portfolio."},
    {"icon":"Layers","title":"Ecosystem-native","description":"Move between PulseX, PulsePay, and ePulse without leaving the ENICE stack: one account, every service."},
    {"icon":"Globe","title":"Built for scale","description":"Global access with compliance and reporting designed for regulated markets from day one, in Africa, Europe, and beyond."},
    {"icon":"Zap","title":"Instant settlement","description":"Near-instant on-chain and off-chain settlement rails so your capital moves as fast as the market does."},
    {"icon":"ShieldCheck","title":"Regulatory-ready","description":"Compliance built in from the ground up: KYC, AML, and transaction monitoring at the core."}
  ]
}'::jsonb, 242)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulsePay Payment Collection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection.facts', 'Payment Collection launch facts', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "Payment Collection launch framing",
  "items": [
    {"value":"Planned","label":"Status"},
    {"value":"Q1 2027","label":"Launch"},
    {"value":"Payments","label":"Category"}
  ]
}'::jsonb, 251)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection.audience', 'Payment Collection audience', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Built For",
  "heading": "From online businesses to growing enterprises.",
  "items": [
    {"icon":"Globe2","title":"Online Businesses","description":"Accept customer payments without stitching together separate providers."},
    {"icon":"Code2","title":"SaaS Platforms","description":"Add payment collection to your product through one integration."},
    {"icon":"ShoppingCart","title":"Marketplaces","description":"Manage payments across many sellers and transactions from one place."},
    {"icon":"TrendingUp","title":"Growing Enterprises","description":"Infrastructure built to scale with transaction volume, not against it."}
  ]
}'::jsonb, 252)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection.capabilities', 'Payment Collection capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Key Capabilities",
  "heading": "Payments, made easier to collect and scale.",
  "subheading": "Payment Collection is being built as part of ENICE Group''s broader financial infrastructure, giving businesses the tools to run modern payment experiences.",
  "items": [
    {"icon":"Code2","title":"Unified payment API","description":"Accept payments through a single, developer friendly integration."},
    {"icon":"Zap","title":"Real time status updates","description":"Track transactions and payment status as they happen, not after the fact."},
    {"icon":"Webhook","title":"Webhook notifications","description":"Get notified the moment a payment is received, so your product can react instantly."},
    {"icon":"Store","title":"Merchant management","description":"View and manage merchants and transactions from a single, clear dashboard."},
    {"icon":"Users","title":"Built for platforms","description":"Designed for businesses that collect payments on behalf of others, at any scale."},
    {"icon":"CheckCircle2","title":"Reliable by design","description":"Payment infrastructure built to stay dependable as transaction volume grows."}
  ]
}'::jsonb, 253)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 14,
    name: "homepage_and_about_remaining_bands_made_editable",
    sql: (
      /* sql */
      `
-- The last content arrays still living in React on the two most-read pages. Migration 13 did this
-- for the product pages and the roadmap; these six bands were what it left behind:
--
--   home.principles     the three "Built around real problems" cards under the product grid
--   home.mechanisms     the mechanisms strip at the foot of the ENICE Core band, its sentence
--                       included \u2014 and, with it, the hero's trust-signal list
--   about.build         the "What We Build" paragraphs
--   about.verticals     the six sector tiles beneath them
--   about.leadership    the founding-team cards and the executive-contact note
--   about.closing       the closing statement and its attribution
--
-- Each uses an existing section type, so the admin form and \`sanitizeSectionFields\` already
-- understand every field, and each is seeded with exactly the copy the page already renders.
-- Wiring therefore changes nothing visible; the next edit simply no longer needs a deploy. Every
-- component also keeps its built-in copy as a fallback, which is what paints before the CMS answers
-- and what survives an outage \u2014 \`useSectionFields\` treats a degraded bootstrap as "not loaded".
--
-- ON CONFLICT (key) DO NOTHING throughout, so this is a no-op on re-run and never overwrites an
-- edit an administrator has already made.
--
-- Four conventions are worth stating, because the components read them back out:
--
--   * \`home.principles\` and \`about.verticals\` render no heading of their own, and neither does the
--     mechanisms strip. Their \`heading\` is seeded for the admin section list only \u2014 a row with no
--     heading is unnavigable there, and \`featureGrid\` requires the field regardless.
--
--   * The hero's trust-signal strip renders the *first three* rows of \`home.mechanisms\`. It was a
--     second hardcoded copy of the same three strings ("Row-level security", "Per-tenant
--     isolation", "Audit logging"), and \`hero\` has neither a repeater nor a spare text field to
--     put them on, so folding them in here is what makes them editable at all. The hero paints a
--     fixed tick against each one: that icon is the strip's design, not content.
--
--   * \`about.build\` interpolates \`{liveProducts}\` with the number of products whose stage is
--     \`available\`, read from the product registry. The figure used to be written by hand, which is
--     how it went stale the day a product shipped, and a seeded literal would go stale the same
--     way. \`**PulsePay**\` and \`**PulseAssist**\` are \`StyledText\`'s bold marker: a text field
--     cannot carry a \`<strong>\`, and should not be able to.
--
--   * \`about.leadership\`'s \`subheading\` is the note *under* the cards, not the lead above them.
--     \`featureGrid\` has one supporting-copy field and the note is the sentence that changes,
--     because it carries the contact address. The anchor stays in code: whichever part of the
--     sentence is the email address is rendered as a mailto link, so an edit can neither break the
--     link nor inject markup. The lead paragraph above the cards is still in React.

-- \u2500\u2500\u2500 Home \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.principles', 'Build principles', 'Home', 'featureGrid', true, 'published', '{
  "heading": "Build principles",
  "items": [
    {"title":"Built around real problems","description":"We start with problems people and businesses actually face."},
    {"title":"Built to grow","description":"Our products are designed to support users as their needs grow."},
    {"title":"Built in Africa","description":"We understand the realities of African markets and build with those realities in mind."}
  ]
}'::jsonb, 31)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.mechanisms', 'Platform mechanisms', 'Home', 'featureGrid', true, 'published', '{
  "heading": "Platform mechanisms",
  "subheading": "Regulated in the Federal Republic of Nigeria. These are mechanisms the platform implements, not certifications we hold.",
  "items": [
    {"icon":"ShieldCheck","title":"Row-level security"},
    {"icon":"Lock","title":"Per-tenant isolation"},
    {"icon":"Check","title":"Audit logging"},
    {"icon":"Wifi","title":"Encrypted in transit and at rest"}
  ]
}'::jsonb, 33)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 About \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.build', 'What We Build', 'About', 'prose', true, 'published', '{
  "heading": "What We Build",
  "body": "We find a real gap, design a product around what it takes to close it, build it to a high standard, launch it, and then operate it with the same discipline we used to build it. We don''t hand products off. We own the full lifecycle.\\n\\nWe work across areas where technical complexity meets real-world consequence: financial infrastructure and digital banking, AI-powered enterprise communication and automation, developer tools and API infrastructure, digital commerce systems, cloud infrastructure, and longer-horizon research.\\n\\nOur {liveProducts} current products are the foundation of this. **PulsePay** is our financial infrastructure platform, a Naira-native payment processing and digital banking system built for Nigerian businesses, from high-frequency transactions to compliance. **PulseAssist** is our enterprise AI platform, a communication and automation layer that helps enterprise teams cut down on procedural overhead.\\n\\nThese are the first two products in a lineup we plan to grow the same way: deliberately, and to a high standard."
}'::jsonb, 152)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.verticals', 'Sectors we build in', 'About', 'featureGrid', true, 'published', '{
  "heading": "Sectors we build in",
  "items": [
    {"title":"Financial Infrastructure","description":"Core transaction rails, digital banking architecture, and payment processing systems."},
    {"title":"Enterprise AI","description":"Automated communication and process automation for enterprise teams."},
    {"title":"Developer Infrastructure","description":"APIs, SDKs, and tooling that give builders a reliable foundation to scale on."},
    {"title":"Digital Commerce","description":"Commerce platforms built for high transaction volume and institutional standards."},
    {"title":"Cloud Infrastructure","description":"Region-aware deployment systems with security and compliance built into the architecture."},
    {"title":"Future Technology","description":"Long-horizon research programmes exploring what comes after our current products."}
  ]
}'::jsonb, 153)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.leadership', 'The Founding Team', 'About', 'featureGrid', true, 'published', '{
  "heading": "The Founding Team",
  "subheading": "Our founding team prefers to let the work speak. Executive contact is available through corporate@enicehq.com for qualified enterprise and partnership inquiries.",
  "items": [
    {"kicker":"CEO","title":"Founder & Chief Executive Officer","description":"Corporate strategy, venture direction, and ecosystem growth."},
    {"kicker":"CTO","title":"Chief Technology Officer","description":"Platform architecture, engineering standards, and infrastructure design."},
    {"kicker":"COO","title":"Chief Operations Officer","description":"Product delivery, partner operations, and compliance execution."}
  ]
}'::jsonb, 154)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.closing', 'Closing statement', 'About', 'prose', true, 'published', '{
  "heading": "\u2014 The Founders, ENICE Group",
  "body": "\\"The infrastructure a society depends on is the most durable thing it can build. That''s what we''re here to build.\\""
}'::jsonb, 172)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 15,
    name: "stored_header_and_footer_follow_the_new_information_architecture",
    sql: (
      /* sql */
      `
-- The header and footer are now read from the CMS instead of from hardcoded arrays in React, and
-- \`defaultSettings()\` was rewritten to the site's real information architecture at the same time:
-- a grouped header (Products with five children \xB7 Company \xB7 Resources with five children, CTA
-- "Contact") and four footer columns (Products \xB7 Developers \xB7 Company \xB7 Legal).
--
-- A database with no stored 'header' or 'footer' row needs nothing at all \u2014 \`getSettings()\` merges
-- stored values over \`defaultSettings()\`, so a fresh install already serves the new IA. This
-- migration exists solely for databases seeded or saved *before* that rewrite, which hold a
-- settings document that would otherwise keep overriding the new defaults and leave the live site
-- on the old four-link header and three-column footer.
--
-- Both statements are guarded on the *previous defaults* being still intact \u2014 the retired
-- \`nav-home\` item with a list of exactly four, and the retired \`Updates\` column with exactly three
-- \u2014 so an operator who has added, removed or reordered anything is left completely alone. The
-- guards also make this idempotent: once applied, neither marker is present, so a re-run matches
-- nothing.
--
-- \`value ||\` merges rather than replaces, so the header's \`showCta\` / \`sticky\` toggles and the
-- footer's tagline, copyright and \`showSocials\` survive untouched. \`site_settings\` stores one
-- JSONB document per key in \`value\` (the section tables use \`fields\`; this table does not).
--
-- The JSON below is field-for-field identical to \`defaultSettings()\` in
-- api-src/lib/repo/website.ts \u2014 same ids, labels, urls, order and children. A migrated database
-- that disagreed with a fresh install is precisely the bug this migration exists to prevent, so
-- the two must be edited together.
UPDATE site_settings
SET value = value || '{
  "items": [
    {"id":"nav-products","label":"Products","url":"/portfolio","visible":true,"children":[
      {"id":"nav-pulsepay","label":"PulsePay","url":"/portfolio/pulsepay","visible":true},
      {"id":"nav-pulseassist","label":"PulseAssist","url":"/portfolio/pulseassist","visible":true},
      {"id":"nav-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true},
      {"id":"nav-collection","label":"Payment Collection","url":"/portfolio/payment-collection","visible":true},
      {"id":"nav-epulse","label":"ePulse","url":"/portfolio/epulse","visible":true},
      {"id":"nav-pulsex","label":"PulseX","url":"/portfolio/pulsex","visible":true}
    ]},
    {"id":"nav-company","label":"Company","url":"/about","visible":true},
    {"id":"nav-resources","label":"Resources","url":"#","visible":true,"children":[
      {"id":"nav-docs","label":"Documentation","url":"/docs","visible":true},
      {"id":"nav-roadmap","label":"Roadmap","url":"/roadmap","visible":true},
      {"id":"nav-blog","label":"Blog","url":"/blog/","visible":true},
      {"id":"nav-news","label":"News & Changelog","url":"/news/","visible":true},
      {"id":"nav-status","label":"System Status","url":"/status","visible":true}
    ]}
  ],
  "ctaLabel": "Contact",
  "ctaUrl": "/contact"
}'::jsonb,
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND jsonb_array_length(value->'items') = 4
  AND value->'items' @> '[{"id":"nav-home"}]'::jsonb;

UPDATE site_settings
SET value = value || '{
  "columns": [
    {"id":"col-products","heading":"Products","links":[
      {"id":"f-pulsepay","label":"PulsePay","url":"/portfolio/pulsepay","visible":true},
      {"id":"f-pulseassist","label":"PulseAssist","url":"/portfolio/pulseassist","visible":true},
      {"id":"f-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true},
      {"id":"f-collection","label":"Payment Collection","url":"/portfolio/payment-collection","visible":true},
      {"id":"f-epulse","label":"ePulse","url":"/portfolio/epulse","visible":true},
      {"id":"f-pulsex","label":"PulseX","url":"/portfolio/pulsex","visible":true},
      {"id":"f-all-products","label":"All products","url":"/portfolio","visible":true}
    ]},
    {"id":"col-developers","heading":"Developers","links":[
      {"id":"f-docs","label":"API documentation","url":"/docs","visible":true},
      {"id":"f-roadmap","label":"Product roadmap","url":"/roadmap","visible":true},
      {"id":"f-status","label":"System status","url":"/status","visible":true}
    ]},
    {"id":"col-company","heading":"Company","links":[
      {"id":"f-about","label":"About ENICE Group","url":"/about","visible":true},
      {"id":"f-contact","label":"Contact","url":"/contact","visible":true},
      {"id":"f-blog","label":"Blog","url":"/blog/","visible":true},
      {"id":"f-news","label":"News & changelog","url":"/news/","visible":true},
      {"id":"f-announcements","label":"Announcements","url":"/announcements/","visible":true}
    ]},
    {"id":"col-legal","heading":"Legal","links":[
      {"id":"f-privacy","label":"Privacy policy","url":"/privacy","visible":true},
      {"id":"f-terms","label":"Terms of service","url":"/terms","visible":true},
      {"id":"f-compliance","label":"Regulatory compliance","url":"/compliance","visible":true}
    ]}
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND jsonb_array_length(value->'columns') = 3
  AND value->'columns' @> '[{"heading":"Updates"}]'::jsonb;
`
    )
  },
  {
    id: 16,
    name: "pulseassist_email_product_page",
    sql: (
      /* sql */
      `
-- PulseAssist Email is a shipping ENICE product that had no page on the company's own website,
-- while this site's own transactional mail -- contact replies, early-access confirmations -- has
-- been sent through it since #31. A product ENICE runs, sells and depends on, missing from its own
-- portfolio, is an omission rather than a decision.
--
-- It is framed as a PulseAssist product, the same way Payment Collection is a PulsePay product:
-- the product's own page presents it as part of the PulseAssist platform. The copy below is
-- condensed from that page (getpulseassist.com/email) and is identical to the in-code fallback in
-- DEFAULT_SECTIONS, verified string-for-string whenever either side is edited.
--
-- ON CONFLICT DO NOTHING throughout: safe to re-run, and it never overwrites an edit.

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email', 'PulseAssist Email page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "PulseAssist Email",
  "heading": "Professional email, on your own domain.",
  "subheading": "Send and receive email from the domain your customers already know. Mailboxes, templates, campaigns and automations in one console, with a REST API, signed webhooks and delivery analytics when you would rather run it from your own systems."
}'::jsonb, 225)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email.facts', 'PulseAssist Email facts strip', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulseAssist Email at a glance",
  "items": [
    {
      "value": "Your domain",
      "label": "Verified in live DNS"
    },
    {
      "value": "Send + receive",
      "label": "Inbound routing included"
    },
    {
      "value": "REST API",
      "label": "Scoped, rotatable keys"
    },
    {
      "value": "Webhooks",
      "label": "Signed delivery events"
    }
  ]
}'::jsonb, 226)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email.capabilities', 'PulseAssist Email capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "What you get",
  "heading": "Everything the product actually does.",
  "subheading": "This is the implementation rather than a roadmap. If something is missing from the list, it is because it has not been built yet.",
  "items": [
    {
      "icon": "Globe2",
      "title": "Your own sending domain",
      "description": "Mail goes out from your domain, not ours. The DKIM, SPF and MAIL FROM records are generated for you, then checked against public DNS \u2014 a domain is only marked connected once those records genuinely resolve."
    },
    {
      "icon": "Send",
      "title": "Transactional and bulk sending",
      "description": "A single message and a campaign run through the same pipeline, each with its own delivery status. Sends are recorded with the idempotency key you supplied, so a retried request cannot become a duplicate email."
    },
    {
      "icon": "Inbox",
      "title": "Inbound email and routing",
      "description": "Receive mail on your own domain and route it by recipient, sender or subject \u2014 to a mailbox, a team, or your own webhook. Inbound is part of the product rather than a forwarding workaround."
    },
    {
      "icon": "AtSign",
      "title": "Mailboxes and sending addresses",
      "description": "Mailboxes that receive and addresses that send, each tied to a verified domain. An address is claimed once across the platform, so two workspaces cannot share an identity."
    },
    {
      "icon": "Layers",
      "title": "Templates with version history",
      "description": "Write a template once and use it from the console or the API. Versions are append-only, so a campaign keeps sending the wording it was reviewed with even after the template moves on."
    },
    {
      "icon": "Sparkles",
      "title": "Automations and sequences",
      "description": "Multi-step sequences with delays between steps. Consent is re-checked when each step sends rather than when someone was enrolled, so an unsubscribe takes effect mid-sequence."
    },
    {
      "icon": "BarChart3",
      "title": "Delivery analytics",
      "description": "Delivered, bounced and complained totals with the rates behind them, measured against what the provider accepted rather than what was attempted. Rates are withheld until the sample is large enough to mean anything."
    },
    {
      "icon": "ShieldCheck",
      "title": "Suppression and deliverability protection",
      "description": "Hard bounces and complaints are suppressed automatically and permanently, and a suppressed address is refused before it costs another bounce. The list is yours to inspect, search and export."
    },
    {
      "icon": "KeyRound",
      "title": "REST API with scoped keys",
      "description": "A documented API for sending, addresses, suppressions, analytics and events. Keys carry scopes \u2014 a key that reads analytics cannot send mail \u2014 and any key can be rotated or revoked without downtime."
    },
    {
      "icon": "Webhook",
      "title": "Signed delivery webhooks",
      "description": "Register endpoints and receive delivery, bounce and complaint events as they happen, signed and deduplicated. Failed deliveries are retried and visible, so a broken endpoint does not fail quietly."
    },
    {
      "icon": "BrainCircuit",
      "title": "AI drafting and classification",
      "description": "Draft, rewrite, summarise and classify mail using the same AI that answers support in PulseAssist. It draws on its own credit pool, so ordinary sending never consumes it."
    },
    {
      "icon": "Code2",
      "title": "Usage you can see coming",
      "description": "Live usage against your plan''s allowances \u2014 sent this month, addresses, domains, endpoints \u2014 read from your entitlements rather than estimated, so a limit is visible while there is still time to act."
    }
  ]
}'::jsonb, 227)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email.setup', 'PulseAssist Email setup steps', 'Portfolio', 'steps', true, 'published', '{
  "heading": "Four steps, and the hard one is checked for you.",
  "subheading": "DNS is where email setup usually goes wrong, so the console names the records that are still outstanding and the ones that are published but wrong \u2014 the ones that never fix themselves while you wait.",
  "items": [
    {
      "title": "Add your domain",
      "description": "Enter the domain you want to send from. It is registered with the sending provider and the exact records it needs are generated for you."
    },
    {
      "title": "Publish the records",
      "description": "Add the DKIM, SPF and MAIL FROM records at your DNS provider. Each is shown with its host and value, and the console tells you which are still outstanding."
    },
    {
      "title": "Verification against real DNS",
      "description": "The records are looked up in public DNS, not just requested from the provider. A record that is published but wrong \u2014 a stale value, a proxied CNAME, a second SPF line \u2014 is reported as exactly that."
    },
    {
      "title": "Send, receive and watch it",
      "description": "Once the records agree, sending is live. Add mailboxes and routing rules for inbound, then follow delivery, bounces and complaints from the first message onward."
    }
  ]
}'::jsonb, 228)
ON CONFLICT (key) DO NOTHING;

-- Register the route as a system page so its SEO is manageable like every other built-in route.
INSERT INTO cms_pages (id, path, title, summary, status, sections, seo, system_route, published_at)
SELECT md5(random()::text || clock_timestamp()::text)::uuid, '/portfolio/pulseassist-email',
       'PulseAssist Email', 'Transactional and marketing email on a verified domain.',
       'published', '[]'::jsonb, '{}'::jsonb, true, now()
ON CONFLICT (path) DO NOTHING;

-- Add the product to the header's Products menu and the footer's Products column, but only where
-- they still hold the shipped structure and do not already list it -- so a navigation an operator
-- has customised is left alone, and a database that arrived via migration 15 (whose payload already
-- includes the link) is a no-op here.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'id' = 'nav-products'
                 THEN jsonb_set(item, '{children}',
                        COALESCE(item->'children', '[]'::jsonb)
                        || '[{"id":"nav-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true}]'::jsonb)
                 ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND value->'items' @> '[{"id":"nav-products"}]'::jsonb
  AND position('nav-pulseassist-email' in value::text) = 0;

UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                     AND item->'children' @> '[{"url":"/portfolio/pulsepay"}]'::jsonb
                    THEN jsonb_set(item, '{children}', (item->'children') ||
                           '[{"id":"nav-pride","label":"PRIDE","url":"/portfolio/pride","visible":true}]'::jsonb)
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND NOT (value->'items' @> '[{"children":[{"url":"/portfolio/pride"}]}]'::jsonb);

UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT jsonb_agg(
               CASE WHEN col->>'id' = 'col-products'
                 THEN jsonb_set(col, '{links}',
                        COALESCE(col->'links', '[]'::jsonb)
                        || '[{"id":"f-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true}]'::jsonb)
                 ELSE col END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND value->'columns' @> '[{"id":"col-products"}]'::jsonb
  AND position('f-pulseassist-email' in value::text) = 0;

-- The ecosystem is six products now. Corrected only where the strip still reads the seeded five,
-- so an edited band is untouched. The code derives this figure from the product registry; the
-- section only has to agree with it.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
    {"value": "6", "label": "Products in the ecosystem"},
    {"value": "2", "label": "Offices in Nigeria"}
  ]'::jsonb),
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"value":"5","label":"Products in the ecosystem"}]'::jsonb;
`
    )
  },
  {
    id: 17,
    name: "rename_payment_collection_to_devapay",
    sql: (
      /* sql */
      `
-- PulsePay Payment Collection is now DevaPay: its own brand rather than a PulsePay sub-product.
-- The route moved from /portfolio/payment-collection to /portfolio/devapay (with a 308 redirect in
-- vercel.json so the old address keeps working), so the section keys, the page record and every
-- stored label and URL have to follow. Without this an existing database would keep serving the
-- old name from the CMS over the new code.
--
-- Section keys are renamed rather than re-inserted, so any copy an operator has already edited
-- moves across with them. Guarded on the old key still existing, which also makes it idempotent.

UPDATE site_sections SET key = 'portfolio.devapay',
       label = 'DevaPay page', updated_at = now()
WHERE key = 'portfolio.payment-collection'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay');

UPDATE site_sections SET key = 'portfolio.devapay.facts',
       label = 'DevaPay launch facts', updated_at = now()
WHERE key = 'portfolio.payment-collection.facts'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay.facts');

UPDATE site_sections SET key = 'portfolio.devapay.audience',
       label = 'DevaPay audience', updated_at = now()
WHERE key = 'portfolio.payment-collection.audience'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay.audience');

UPDATE site_sections SET key = 'portfolio.devapay.capabilities',
       label = 'DevaPay capabilities', updated_at = now()
WHERE key = 'portfolio.payment-collection.capabilities'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay.capabilities');

-- The product name inside the seeded copy, wherever it was stored as the old brand.
UPDATE site_sections
SET fields = replace(replace(fields::text, 'PulsePay Payment Collection', 'DevaPay'), 'Payment Collection', 'DevaPay')::jsonb,
    updated_at = now()
WHERE fields::text LIKE '%Payment Collection%';

-- The managed page record and its address.
UPDATE cms_pages
SET path = '/portfolio/devapay', title = 'DevaPay',
    summary = 'Payment infrastructure for businesses, on one developer-friendly API.',
    updated_at = now()
WHERE path = '/portfolio/payment-collection'
  AND NOT EXISTS (SELECT 1 FROM cms_pages WHERE path = '/portfolio/devapay');

-- Navigation and footer: the stored label and URL both carried the old brand.
UPDATE site_settings
SET value = replace(
      replace(
        replace(value::text, '/portfolio/payment-collection', '/portfolio/devapay'),
        'PulsePay Payment Collection', 'DevaPay'),
      'Payment Collection', 'DevaPay')::jsonb,
    updated_at = now()
WHERE key IN ('header', 'footer')
  AND (position('payment-collection' in value::text) > 0
       OR position('Payment Collection' in value::text) > 0);

-- The About page's "What We Build" band interpolated a {liveProducts} count beside a sentence that
-- names PulsePay and PulseAssist. PulsePay is in pilot rather than generally available, so the
-- derived figure no longer matched the products the words name, and a number that contradicts the
-- sentence beside it is worse than no number. Dropped only where the token is still present.
UPDATE site_sections
SET fields = jsonb_set(fields, '{body}',
      to_jsonb(replace(fields->>'body', 'Our {liveProducts} current products', 'Our current products'))),
    updated_at = now()
WHERE key = 'about.build'
  AND position('{liveProducts}' in COALESCE(fields->>'body', '')) > 0;
`
    )
  },
  {
    id: 18,
    name: "partners_strip_current_providers",
    sql: (
      /* sql */
      `
-- The partners strip lists the providers the platform actually runs on: AWS, Google Cloud,
-- Supabase, Vercel, PulseAssist and Railway.
--
-- PulseAssist is in the list because the site genuinely runs on it: transactional email goes out
-- through PulseAssist Email (#31) and the assistant is the PulseAssist widget. It being an ENICE
-- product does not make it less of a dependency.
--
-- Removed: Resend, which PulseAssist Email replaced in #31, and AWS Activate, because a startup
-- credits programme is not infrastructure and listing it beside AWS itself read as two
-- partnerships where there is one. PulseAssist is deliberately not added: it is ENICE's own
-- product, and a company does not belong in its own partners strip.
--
-- This is needed because migrations 3 and 4 seed the retired set, so a database that ran those
-- would keep publishing Resend and AWS Activate over the new defaults. Guarded on one of the
-- retired entries still being present, which leaves a curated list alone and makes a re-run a
-- no-op.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
    {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
    {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
    {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
    {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
    {"name":"PulseAssist","tagline":"Support & Email Infrastructure","logo":"/partners/pulseassist.svg","url":"https://getpulseassist.com"},
    {"name":"Railway","tagline":"Application & Database Hosting","logo":"/partners/railway.svg","url":"https://railway.com"}
  ]'::jsonb),
    updated_at = now()
WHERE key = 'home.partners'
  AND (fields->'items' @> '[{"name":"AWS Activate"}]'::jsonb
       OR fields->'items' @> '[{"name":"Resend"}]'::jsonb
       OR NOT fields->'items' @> '[{"name":"PulseAssist"}]'::jsonb);

-- The homepage's "The stack underneath" band is gone: it restated the partners strip in longer
-- form, so the page named the same providers twice. Its section has no renderer left, and an admin
-- screen that edits copy nothing displays is a trap, so the row goes with the band.
DELETE FROM site_sections WHERE key = 'home.infrastructure';

-- Copy that read as machine-written: a "Built X / Built Y / Built Z" run of headings, two
-- sentence-fragment headlines, and em-dashed asides. Each is corrected only where the original
-- string is still in place, so an edited band is untouched.
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"Three areas we build in."'::jsonb), updated_at = now()
WHERE key = 'home.products' AND fields->>'heading' LIKE 'Products and platforms.%';

UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"The products we build and run."'::jsonb), updated_at = now()
WHERE key = 'home.portfolio' AND fields->>'heading' LIKE 'The products we run.%';

UPDATE site_sections
SET fields = replace(replace(replace(fields::text,
      '"Built around real problems"', '"Problems before products"'),
      '"Built to grow"', '"Room to grow"'),
      '"Built in Africa"', '"Grounded in African markets"')::jsonb,
    updated_at = now()
WHERE key = 'home.principles' AND fields::text LIKE '%Built around real problems%';

UPDATE site_sections
SET fields = replace(fields::text,
      'We own the products end to end \u2014 engineering, launch, and the day-to-day running of them.',
      'We own the products end to end: engineering, launch, and the day-to-day running of them.')::jsonb,
    updated_at = now()
WHERE key = 'home.company' AND position('end to end \u2014' in fields::text) > 0;
`
    )
  },
  {
    id: 19,
    name: "about_page_acronym_band",
    sql: (
      /* sql */
      `
-- The About page now opens, straight after the hero, by saying what the name is built from:
-- Empower, Nurture, Innovate, Create, Elevate. The page never explained its own acronym.
--
-- \`featureGrid\` because every other multi-item About band is one, and its row shape \u2014 \`title\` plus
-- \`description\` \u2014 is already word plus gloss. \`sanitizeSectionFields\` and the admin form therefore
-- need no changes.
--
-- Two conventions the component reads back out:
--
--   * The initial shown beside each word is derived from the word, not stored. A stored letter could
--     drift from editable text until the page claimed an acronym it no longer formed, and there is no
--     field for it in any case.
--
--   * Every \`description\` is deliberately empty. The five words are the company's own; a sentence
--     written here to pad each letter would be invented meaning dressed as brand copy. The field is
--     seeded so the owner can add one per letter from the Website Manager without a deploy, and the
--     component renders a row's gloss only when it is non-empty.
--
-- ON CONFLICT (key) DO NOTHING, so a re-run is a no-op and an administrator's edits are never
-- overwritten. The component keeps the same five words as its built-in fallback, which is what paints
-- before the CMS answers and what survives an outage.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.acronym', 'What the name stands for', 'About', 'featureGrid', true, 'published', '{
  "heading": "What the name stands for",
  "items": [
    {"title":"Empower","description":""},
    {"title":"Nurture","description":""},
    {"title":"Innovate","description":""},
    {"title":"Create","description":""},
    {"title":"Elevate","description":""}
  ]
}'::jsonb, 110)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 20,
    name: "trim_redundant_home_and_about_copy",
    sql: (
      /* sql */
      `
-- An editorial pass to cut repetition, not information. The About page carried five prose bands
-- that circled the same three ideas, and the home page repeated them. Every statement is guarded
-- so an administrator's own edits are left alone, and a re-run is a no-op.

-- "Our Vision" and "Our Ecosystem" were standalone bands that restated "Our Story" (shared
-- infrastructure compounds) and each other (a ten-to-twenty-year global ambition). Vision's
-- distinct point is folded into "Looking Ahead" below; both standalone bands go.
DELETE FROM site_sections WHERE key IN ('about.vision', 'about.ecosystem');

-- "Looking Ahead" absorbs the vision point and drops the overlap. Guarded on the old closing line.
UPDATE site_sections
SET fields = jsonb_set(fields, '{body}', '"The infrastructure African businesses depend on is still largely being built, and that gap is what we''re focused on \u2014 over a ten-to-twenty-year horizon most organisations aren''t structured to sustain. We''re building a home-grown technology group that competes globally, not one that follows trends.\\n\\nThis isn''t charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it \u2014 with systems businesses on this continent can run on for the next generation.\\n\\nWhat we build is made for a global market: it scales across regions, meets international compliance standards, and is built to compete with any equivalent platform anywhere. To the businesses and builders who rely on us \u2014 we''re committed to technology that matters, to a standard that matters, and to taking the time to do it properly."'::jsonb),
    updated_at = now()
WHERE key = 'about.outlook'
  AND position('best option, period' in COALESCE(fields->>'body', '')) > 0;

-- "Our Principles" was eight cards, a wall of text. Trimmed to five, dropping the three that
-- overlapped others: Institutional Quality, Continuous Innovation, Ownership Mentality.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
    {"title":"Long-Term Thinking","description":"We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won''t trade long-term integrity for short-term convenience."},
    {"title":"Engineering Excellence","description":"We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty."},
    {"title":"Security by Design","description":"Security isn''t added after a product ships. It''s built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners'' data as our responsibility."},
    {"title":"Customer Obsession","description":"We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it."},
    {"title":"Responsible AI","description":"AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don''t release a capability until we''re confident in its reliability and we can explain how it works."}
  ]'::jsonb),
    updated_at = now()
WHERE key = 'about.values'
  AND jsonb_array_length(fields->'items') > 5;

-- The founders' letter dropped from three paragraphs to two.
UPDATE site_sections
SET fields = jsonb_set(fields, '{body}', '"Every good business runs on good infrastructure \u2014 that''s the idea behind ENICE Group. We don''t build technology for its own sake; we build products that solve real problems and give businesses something they can depend on for years.\\n\\nThe idea came from everyday life in Nigeria: support queues nobody answered, payments that failed exactly when they mattered, cards declined for no reason. We decided that shouldn''t be normal. African businesses and consumers deserve technology built to the same standard as anywhere else \u2014 for Africa first, and the world as we grow."'::jsonb),
    updated_at = now()
WHERE key = 'home.founders'
  AND position('didn''t start in a boardroom' in COALESCE(fields->>'body', '')) > 0;

-- The "2 Offices in Nigeria" figure implied a physical office the company does not have yet. Only
-- the (real) product count remains in the hero stats strip.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[{"value":"6","label":"Products in the ecosystem"}]'::jsonb),
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Offices in Nigeria"}]'::jsonb;

-- PulseAssist page: it described only the AI support platform, so the "Compliance-ready audit
-- trails" capability card is replaced with the PulseAssist Email platform. The audit-trail claim
-- was also only partly true \u2014 logging exists, but "comprehensive audit trails of every agent
-- interaction / every model decision is logged" overstated it \u2014 so the compliance band is reworded
-- to the mechanisms actually in place (tenant isolation, row-level security, policy versioning) and
-- the "Audit Logs" pill is dropped. Migration 13 seeded the original strings, so these correct any
-- database that ran it; guarded on the old text so an edited band is left alone.
UPDATE site_sections
SET fields = jsonb_set(
      fields,
      '{items}',
      ((fields->'items') - 6) || '[{"icon":"Mail","title":"Email on your own domain","description":"PulseAssist Email sends transactional and marketing email from your own verified domain, with deliverability and sending reputation managed for you."}]'::jsonb
    ),
    updated_at = now()
WHERE key = 'portfolio.pulseassist.features'
  AND fields->'items' @> '[{"title":"Compliance-ready audit trails"}]'::jsonb;

UPDATE site_sections
SET fields = jsonb_set(
      jsonb_set(fields, '{subheading}', '"Policy configurations are version-controlled and every conversation runs with per-tenant data isolation and row-level security, built to meet the regulatory requirements of banking and telecom in Africa and beyond."'::jsonb),
      '{items}',
      '[{"title":"Tenant Isolation"},{"title":"Policy Versioning"},{"title":"Row-Level Security"}]'::jsonb
    ),
    updated_at = now()
WHERE key = 'portfolio.pulseassist.compliance'
  AND position('comprehensive audit trails' in COALESCE(fields->>'subheading', '')) > 0;
`
    )
  },
  {
    id: 21,
    name: "enice_acronym_updated",
    sql: (
      /* sql */
      `
-- The ENICE acronym now reads "Enabling Next-Generation Innovations in Customer Experience",
-- replacing the earlier Empower / Nurture / Innovate / Create / Elevate that migration 19 seeded.
-- The five list words carry the initials E, N, I, C, E; the connective "in" lives only in the
-- subheading, which the page shows as a lead above the list. Guarded on the old first word, so an
-- administrator's own edit is left alone and a re-run is a no-op.
UPDATE site_sections
SET fields = jsonb_set(
      jsonb_set(fields, '{subheading}', '"Enabling Next-Generation Innovations in Customer Experience."'::jsonb),
      '{items}',
      '[
        {"title":"Enabling","description":""},
        {"title":"Next-Generation","description":""},
        {"title":"Innovations","description":""},
        {"title":"Customer","description":""},
        {"title":"Experience","description":""}
      ]'::jsonb
    ),
    updated_at = now()
WHERE key = 'about.acronym'
  AND fields->'items' @> '[{"title":"Empower"}]'::jsonb;
`
    )
  },
  {
    id: 22,
    name: "drop_epulse_rename_pulsex_to_pride_devapay_2028",
    sql: (
      /* sql */
      `
-- Three product changes, applied to existing databases so the CMS cannot serve the old state over
-- the new code (the same reason migration 17 exists for the DevaPay rename):
--
--   * ePulse is discontinued. Its page, sections, roadmap entry and nav/footer links are removed,
--     and /portfolio/epulse redirects to /portfolio in vercel.json.
--   * PulseX is now PRIDE, at /portfolio/pride (with a 308 from /portfolio/pulsex).
--   * DevaPay's launch moves from Q1 2027 to 2028.
--
-- Also clears the homepage "Products in the ecosystem" figure, which the site no longer shows.
--
-- Every statement is guarded on the old state still being present, so a re-run is a no-op and
-- an administrator's own later edit is left alone.

-- ePulse: page sections and the managed page record.
DELETE FROM site_sections WHERE key = 'portfolio.epulse' OR key LIKE 'portfolio.epulse.%';
DELETE FROM cms_pages WHERE path = '/portfolio/epulse';

-- PulseX -> PRIDE: section keys are renamed rather than re-inserted, so edited copy moves across.
UPDATE site_sections SET key = 'portfolio.pride', label = 'PRIDE page', updated_at = now()
WHERE key = 'portfolio.pulsex'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.pride');
UPDATE site_sections SET key = 'portfolio.pride.facts', label = 'PRIDE launch facts', updated_at = now()
WHERE key = 'portfolio.pulsex.facts'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.pride.facts');
UPDATE site_sections SET key = 'portfolio.pride.highlights', label = 'PRIDE highlights', updated_at = now()
WHERE key = 'portfolio.pulsex.highlights'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.pride.highlights');

UPDATE cms_pages SET path = '/portfolio/pride', title = 'PRIDE', updated_at = now()
WHERE path = '/portfolio/pulsex'
  AND NOT EXISTS (SELECT 1 FROM cms_pages WHERE path = '/portfolio/pride');

-- Copy that names the products. ePulse's sentence fragments go first so the PulseX replacement
-- does not leave "PRIDE, PulsePay, and ePulse" behind.
UPDATE site_sections
SET fields = replace(replace(replace(replace(fields::text,
      'PulseX, PulsePay, and ePulse', 'PRIDE and PulsePay'),
      'deeply integrated with PulsePay and ePulse', 'built into the same ecosystem as PulsePay'),
      'and ePulse and PulseX extend the ecosystem into digital banking and digital assets',
      'DevaPay covers payment collection, and PRIDE extends the ecosystem into digital assets'),
      'PulseX', 'PRIDE')::jsonb,
    updated_at = now()
WHERE position('PulseX' in fields::text) > 0 OR position('ePulse' in fields::text) > 0;

-- Roadmap: drop the ePulse milestone, move DevaPay to 2028.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN item->>'title' = 'DevaPay Launch'
                    THEN jsonb_set(item, '{description}',
                           to_jsonb(replace(item->>'description', 'when: Q1 2027', 'when: 2028')))
                    ELSE item END
               ORDER BY (item->>'title' = 'DevaPay Launch'), ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE position('product: ePulse' in COALESCE(item->>'description', '')) = 0
    )),
    updated_at = now()
WHERE fields->'items' @> '[{"title":"DevaPay Launch"}]'::jsonb
  AND (position('product: ePulse' in fields::text) > 0 OR position('when: Q1 2027' in fields::text) > 0);

-- DevaPay's other launch figures: the facts strip and the homepage product tile.
-- In these two sections "Q1 2027" only ever appears as DevaPay's launch, so the value itself is
-- replaced rather than a serialised object (whose key order is Postgres's choice, not ours).
-- The homepage product tiles live under 'home.portfolio'.
UPDATE site_sections
SET fields = replace(fields::text, 'Q1 2027', '2028')::jsonb,
    updated_at = now()
WHERE key IN ('portfolio.devapay.facts', 'home.portfolio')
  AND position('Q1 2027' in fields::text) > 0;

-- Homepage statistics: the product count is no longer shown.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[]'::jsonb), updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Products in the ecosystem"}]'::jsonb;

-- Header: drop ePulse from every menu's children, then rename PulseX. Structured rather than a
-- text replace, because removing an object from a jsonb array by string surgery depends on the
-- key order Postgres chose when it stored it.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                    THEN jsonb_set(item, '{children}', (
                           SELECT COALESCE(jsonb_agg(child ORDER BY cord), '[]'::jsonb)
                           FROM jsonb_array_elements(item->'children') WITH ORDINALITY AS c(child, cord)
                           WHERE child->>'url' IS DISTINCT FROM '/portfolio/epulse'))
                    ELSE item END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
      WHERE item->>'url' IS DISTINCT FROM '/portfolio/epulse'
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND position('/portfolio/epulse' in value::text) > 0;

-- Footer: the same, one level down in each column's links.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                     AND item->'children' @> '[{"url":"/portfolio/pulsepay"}]'::jsonb
                    THEN jsonb_set(item, '{children}', (item->'children') ||
                           '[{"id":"nav-pride","label":"PRIDE","url":"/portfolio/pride","visible":true}]'::jsonb)
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND NOT (value->'items' @> '[{"children":[{"url":"/portfolio/pride"}]}]'::jsonb);

UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(col->'links') = 'array'
                    THEN jsonb_set(col, '{links}', (
                           SELECT COALESCE(jsonb_agg(link ORDER BY lord), '[]'::jsonb)
                           FROM jsonb_array_elements(col->'links') WITH ORDINALITY AS l(link, lord)
                           WHERE link->>'url' IS DISTINCT FROM '/portfolio/epulse'))
                    ELSE col END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND position('/portfolio/epulse' in value::text) > 0;

-- Both: PulseX's label and address. A plain replace is safe here \u2014 it rewrites values in place
-- without adding or removing anything.
UPDATE site_settings
SET value = replace(replace(replace(value::text,
      '/portfolio/pulsex', '/portfolio/pride'),
      '-pulsex"', '-pride"'),
      'PulseX', 'PRIDE')::jsonb,
    updated_at = now()
WHERE key IN ('header', 'footer')
  AND (position('pulsex' in value::text) > 0 OR position('PulseX' in value::text) > 0);
`
    )
  },
  {
    id: 23,
    name: "use_legal_entity_in_default_footer_copyright",
    sql: (
      /* sql */
      `
-- ENICE Group is the public brand; copyright belongs to ENICE Technology Limited. Update only
-- untouched generated copyright strings so an administrator's custom legal wording is preserved.
UPDATE site_settings
SET value = jsonb_set(
      value,
      '{copyright}',
      to_jsonb(replace(value->>'copyright', 'ENICE Group', 'ENICE Technology Limited'))
    ),
    updated_at = now()
WHERE key = 'footer'
  AND value->>'copyright' ~ '^\xA9 [0-9]{4} ENICE Group\\. All rights reserved\\.$';
`
    )
  },
  {
    id: 24,
    name: "separate_faga_from_pulseassist",
    sql: (
      /* sql */
      `
-- Faga is now the standalone email delivery platform. PulseAssist remains the AI customer-
-- operations platform. Move existing CMS content and navigation rather than leaving production
-- data on the retired PulseAssist Email identity.

UPDATE site_sections SET key = 'portfolio.faga', label = 'Faga page', updated_at = now()
WHERE key = 'portfolio.pulseassist-email'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.faga');
UPDATE site_sections SET key = 'portfolio.faga.facts', label = 'Faga facts strip', updated_at = now()
WHERE key = 'portfolio.pulseassist-email.facts'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.faga.facts');
UPDATE site_sections SET key = 'portfolio.faga.capabilities', label = 'Faga capabilities', updated_at = now()
WHERE key = 'portfolio.pulseassist-email.capabilities'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.faga.capabilities');
UPDATE site_sections SET key = 'portfolio.faga.setup', label = 'Faga setup steps', updated_at = now()
WHERE key = 'portfolio.pulseassist-email.setup'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.faga.setup');

-- If a Faga destination was already seeded, remove only the superseded duplicate rows.
DELETE FROM site_sections
WHERE key = 'portfolio.pulseassist-email' OR key LIKE 'portfolio.pulseassist-email.%';

UPDATE site_sections
SET fields = replace(
      replace(fields::text, 'PulseAssist Email', 'Faga'),
      'Draft, rewrite, summarise and classify mail using the same AI that answers support in PulseAssist. It draws on its own credit pool, so ordinary sending never consumes it.',
      'Draft, rewrite, summarise and classify mail with AI-assisted tools while keeping ordinary sending independent from AI usage.')::jsonb,
    updated_at = now()
WHERE key = 'portfolio.faga' OR key LIKE 'portfolio.faga.%';

UPDATE site_sections
SET fields = jsonb_set(fields, '{subheading}',
      '"Faga is an email delivery platform for transactional and marketing messages\u2014the same category of platform as SendGrid and Resend. Send and receive from your own domain, manage templates and campaigns, or integrate through the REST API and signed webhooks."'::jsonb),
    updated_at = now()
WHERE key = 'portfolio.faga'
  AND fields->>'subheading' = 'Send and receive email from the domain your customers already know. Mailboxes, templates, campaigns and automations in one console, with a REST API, signed webhooks and delivery analytics when you would rather run it from your own systems.';

-- Email delivery is no longer a PulseAssist capability card. Email remains one support channel in
-- its shared inbox, but the delivery platform itself belongs to Faga.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(COALESCE(fields->'items', '[]'::jsonb))
           WITH ORDINALITY AS t(item, ord)
      WHERE item->>'title' IS DISTINCT FROM 'Email on your own domain'
    )),
    updated_at = now()
WHERE key = 'portfolio.pulseassist.features'
  AND fields->'items' @> '[{"title":"Email on your own domain"}]'::jsonb;

UPDATE cms_pages
SET path = '/portfolio/faga', title = 'Faga',
    summary = 'Email delivery infrastructure for transactional and marketing messages.',
    seo = replace(
      replace(COALESCE(seo, '{}'::jsonb)::text, 'PulseAssist Email', 'Faga'),
      '/portfolio/pulseassist-email', '/portfolio/faga')::jsonb,
    updated_at = now()
WHERE path = '/portfolio/pulseassist-email'
  AND NOT EXISTS (SELECT 1 FROM cms_pages WHERE path = '/portfolio/faga');
DELETE FROM cms_pages
WHERE path = '/portfolio/pulseassist-email'
  AND EXISTS (SELECT 1 FROM cms_pages WHERE path = '/portfolio/faga');

UPDATE site_settings
SET value = replace(
      replace(
        replace(value::text, '/portfolio/pulseassist-email', '/portfolio/faga'),
        'pulseassist-email', 'faga'),
      'PulseAssist Email', 'Faga')::jsonb,
    updated_at = now()
WHERE key IN ('header', 'footer')
  AND (position('pulseassist-email' in value::text) > 0
       OR position('PulseAssist Email' in value::text) > 0);

-- Keep PulseAssist's infrastructure label AI-only in existing CMS data.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'name' = 'PulseAssist'
                    THEN jsonb_set(item, '{tagline}', '"AI Customer Operations"'::jsonb)
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'home.partners'
  AND fields->'items' @> '[{"name":"PulseAssist"}]'::jsonb;

-- Feature Faga on the homepage without disturbing the order or copy of existing cards.
UPDATE site_sections
SET fields = jsonb_set(
      fields,
      '{items}',
      COALESCE(fields->'items', '[]'::jsonb) || '[{
        "icon":"Mail",
        "kicker":"Email infrastructure",
        "title":"Faga",
        "description":"Faga handles the same email delivery work businesses use SendGrid or Resend for: transactional and marketing messages, verified domains, templates, webhooks, analytics, and API-driven sending.",
        "bullets":"Delivery: Transactional & marketing\\nIntegration: REST API & webhooks",
        "url":"/portfolio/faga"
      }]'::jsonb
    ),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND position('/portfolio/faga' in fields::text) = 0;

-- Refresh the PulseAssist homepage card so it is positioned only as customer-support AI.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'url' = '/portfolio/pulseassist'
                    THEN '{
                      "icon":"BrainCircuit",
                      "kicker":"CUSTOMER SUPPORT AI",
                      "title":"PulseAssist",
                      "description":"An AI support platform built for growing businesses, startups, and digital teams, with automated queue handling, live agent handoff, and smart customer workflow tools.",
                      "bullets":"Channels and more.: WhatsApp, web, Telegram, SMS, voice\\nTenancy: Multi-tenant",
                      "url":"/portfolio/pulseassist"
                    }'::jsonb
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND fields->'items' @> '[{"url":"/portfolio/pulseassist"}]'::jsonb;

-- Apply the supplied Digital Payments copy to the PulsePay homepage card.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'url' = '/portfolio/pulsepay'
                    THEN '{
                      "icon":"CreditCard",
                      "kicker":"DIGITAL PAYMENTS",
                      "title":"PulsePay",
                      "description":"A virtual payment platform for modern commerce: instant Naira and USD card issuance, programmable wallets, embedded KYC, and fast peer-to-peer transfers built for businesses and individuals.",
                      "bullets":"Cards: Naira & USD\\nMarket: Nigeria",
                      "url":"/portfolio/pulsepay"
                    }'::jsonb
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND fields->'items' @> '[{"url":"/portfolio/pulsepay"}]'::jsonb;

-- Remove the Global Cloud Grid homepage card from existing CMS data.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(COALESCE(fields->'items', '[]'::jsonb))
           WITH ORDINALITY AS t(item, ord)
      WHERE item->>'title' IS DISTINCT FROM 'Global Cloud Grid'
    )),
    updated_at = now()
WHERE key = 'home.core'
  AND fields->'items' @> '[{"title":"Global Cloud Grid"}]'::jsonb;

-- Apply the updated FINTECH category copy to the existing production CMS row.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'title' = 'Financial Infrastructure Systems'
                    THEN '{
                      "icon":"Banknote",
                      "kicker":"FINTECH",
                      "title":"Financial Solutions & Payments",
                      "description":"Flexible credit, transaction networks, and virtual card infrastructure built for Nigeria''s digital economy, with room to expand across the region.",
                      "bullets":"Virtual Card Issuance\\nTreasury and Ledger\\nKYC and Compliance Tooling"
                    }'::jsonb
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'home.products'
  AND fields->'items' @> '[{"title":"Financial Infrastructure Systems"}]'::jsonb;

-- Apply the supplied company positioning and remove the retired pillar-card block.
UPDATE site_sections
SET fields = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(fields, '{eyebrow}', '"THE COMPANY"'::jsonb),
          '{heading}', '"ENICE Group builds digital products."'::jsonb),
        '{subheading}',
        '"We are the parent company behind a growing suite of software platforms. We identify real challenges across financial services, commerce, and communication, then design, launch, and operate the products that solve them."'::jsonb
      ),
      '{items}', '[]'::jsonb
    ),
    updated_at = now()
WHERE key = 'home.company';

UPDATE site_sections
SET fields = replace(
      replace(fields::text,
        'PulsePay is our digital financial platform. PulseAssist handles AI-powered business communication and customer support.',
        'PulsePay is our digital financial platform, PulseAssist is our AI customer-operations platform, and Faga provides email delivery infrastructure.'),
      'PulseAssist covers business communication and customer support, DevaPay covers payment collection',
      'PulseAssist provides AI customer operations, Faga provides transactional and marketing email infrastructure, DevaPay covers payment collection')::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND (position('PulseAssist handles AI-powered business communication' in fields::text) > 0
       OR position('PulseAssist covers business communication' in fields::text) > 0);

UPDATE site_sections
SET fields = replace(
      fields::text,
      'A shared AI and automation pipeline, a fast ledger and payment core, an automated KYC and compliance layer, and a global cloud grid.',
      'A shared AI and automation pipeline, a fast ledger and payment core, and an automated KYC and compliance layer.')::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND position('global cloud grid' in lower(fields::text)) > 0;
`
    )
  },
  {
    id: 25,
    name: "feature_pride_instead_of_devapay_on_homepage",
    sql: (
      /* sql */
      `
-- PRIDE launches in Q3 2027, ahead of DevaPay's 2028 timeline. Replace the DevaPay homepage
-- preview with PRIDE while leaving DevaPay available everywhere else in the portfolio.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'url' = '/portfolio/devapay'
                    THEN '{
                      "icon":"Bitcoin",
                      "kicker":"DIGITAL ASSETS",
                      "title":"PRIDE",
                      "description":"ENICE Group''s digital asset platform, designed to make cryptocurrency and digital finance simple, secure, and accessible within the ENICE ecosystem.",
                      "bullets":"Launch: Q3 2027\\nCategory: Digital Assets",
                      "url":"/portfolio/pride"
                    }'::jsonb
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE item->>'url' IS DISTINCT FROM '/portfolio/pride'
    )),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND fields->'items' @> '[{"url":"/portfolio/devapay"}]'::jsonb;
`
    )
  },
  {
    id: 26,
    name: "replace_capabilities_with_enice_engine",
    sql: (
      /* sql */
      `
-- Remove the retired Platform Capabilities band and replace the homepage Core presentation with
-- the ENICE Engine copy. Migrations 12-14 seeded these rows, so production data must be updated
-- explicitly rather than relying on changed defaults.
DELETE FROM site_sections WHERE key = 'home.capabilities';

UPDATE site_sections
SET label = 'The ENICE Engine',
    fields = '{
      "eyebrow":"WHAT POWERS OUR PRODUCTS",
      "heading":"The ENICE Engine",
      "subheading":"All of our apps share the same underlying technology\u2014making every product faster, more reliable, and secure right out of the box.",
      "items":[
        {
          "icon":"Cpu",
          "title":"AI & Automation",
          "description":"Centralized AI tools and smart workflows that power products like PulseAssist to handle customer support and communication seamlessly."
        },
        {
          "icon":"Database",
          "title":"Fast Payments & Ledgers",
          "description":"A reliable transaction engine and virtual account system that powers PulsePay and future financial tools we build."
        },
        {
          "icon":"FileCheck2",
          "title":"Built-In Compliance & KYC",
          "description":"Identity verification, fraud checks, and security screening running automatically in real time across all our products."
        }
      ]
    }'::jsonb,
    updated_at = now()
WHERE key = 'home.core';

UPDATE site_sections
SET fields = '{
      "heading":"ENICE Engine safeguards",
      "subheading":"Built in compliance with applicable standards in the Federal Republic of Nigeria. Our products operate with enterprise-grade data protection, strict privacy controls, and end-to-end security architecture across all systems.",
      "items":[
        {"icon":"ShieldCheck","title":"ROW-LEVEL SECURITY"},
        {"icon":"Lock","title":"PER-TENANT ISOLATION"},
        {"icon":"Check","title":"AUDIT LOGGING"},
        {"icon":"Wifi","title":"ENCRYPTED IN TRANSIT AND AT REST"}
      ]
    }'::jsonb,
    updated_at = now()
WHERE key = 'home.mechanisms';

UPDATE site_sections
SET fields = replace(
      replace(fields::text,
        'What does the ENICE Core provide?',
        'What does the ENICE Engine provide?'),
      'A shared AI and automation pipeline, a fast ledger and payment core, and an automated KYC and compliance layer. Every product inherits the same scale, security, and observability from day one.',
      'Shared AI and automation, fast payments and ledgers, and built-in compliance and KYC. Every product starts with the same reliable, secure foundation.')::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND position('ENICE Core' in fields::text) > 0;
`
    )
  },
  {
    id: 27,
    name: "use_pride_name_everywhere",
    sql: (
      /* sql */
      `
-- The digital asset product is PRIDE. Correct the remaining live hero heading while preserving
-- any administrator-authored replacement and keeping historical redirects/migration matches.
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"PRIDE"'::jsonb),
    updated_at = now()
WHERE key = 'portfolio.pride'
  AND fields->>'heading' = 'Pulse[[X]]';
`
    )
  },
  {
    id: 28,
    name: "make_homepage_shorter_and_clearer",
    sql: (
      /* sql */
      `
-- Tighten the landing page without changing the named product cards. Retired homepage rows stay in
-- the database to preserve editor work, but their defaults and renderers are removed.

UPDATE site_settings
SET value = jsonb_set(
      value,
      '{tagline}',
      '"ENICE builds and runs software for payments, customer support, email, and digital assets."'::jsonb
    ),
    updated_at = now()
WHERE key = 'footer'
  AND value->>'tagline' = 'ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.';

UPDATE site_sections
SET fields = jsonb_set(fields, '{eyebrow}', '"AI, payments and digital products"'::jsonb),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'eyebrow' = 'Technology Group \xB7 Building for Africa';
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"We build software businesses can use every day."'::jsonb),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'We build the technology behind Africa''s next generation of businesses.';
UPDATE site_sections
SET fields = jsonb_set(fields, '{subheading}',
      '"ENICE builds and runs tools for customer support, payments, email, and digital assets."'::jsonb),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'subheading' = 'ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.';

UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"Infrastructure and platform providers"'::jsonb),
    updated_at = now()
WHERE key = 'home.partners'
  AND fields->>'heading' IN ('Working with', 'Built on trusted infrastructure partners');

UPDATE site_sections
SET fields = jsonb_set(fields, '{eyebrow}', '"Our products"'::jsonb), updated_at = now()
WHERE key = 'home.portfolio' AND fields->>'eyebrow' = 'Built and operated by ENICE';
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"Products we build and run."'::jsonb), updated_at = now()
WHERE key = 'home.portfolio' AND fields->>'heading' = 'The products we build and run.';
UPDATE site_sections
SET fields = jsonb_set(fields, '{subheading}',
      '"Tools for payments, customer support, email, and digital assets."'::jsonb),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND fields->>'subheading' = 'Each one began as a problem we hit ourselves, and each one is a platform we operate day to day rather than hand over.';

UPDATE site_sections
SET fields = jsonb_set(fields, '{eyebrow}', '"What we build"'::jsonb), updated_at = now()
WHERE key = 'home.products' AND fields->>'eyebrow' = 'What we''re building';
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"Three areas we work in."'::jsonb), updated_at = now()
WHERE key = 'home.products' AND fields->>'heading' = 'Three areas we build in.';
UPDATE site_sections
SET fields = jsonb_set(fields, '{subheading}',
      '"Payments, customer support, and software products built for businesses in Africa."'::jsonb),
    updated_at = now()
WHERE key = 'home.products'
  AND fields->>'subheading' = 'ENICE Group takes hard problems in financial services and business communication and turns them into products people can rely on.';

UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT jsonb_agg(
               CASE
                 WHEN item = '{
                   "icon":"BrainCircuit",
                   "kicker":"Artificial Intelligence",
                   "title":"Autonomous Enterprise AI",
                   "description":"Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
                   "bullets":"Autonomous Customer Support\\nPolicy-Bound AI Agents\\nWorkflow Automation"
                 }'::jsonb THEN '{
                   "icon":"BrainCircuit",
                   "kicker":"AI SUPPORT",
                   "title":"AI for customer support",
                   "description":"AI tools that answer common questions, route work, and hand conversations to people when needed.",
                   "bullets":"Customer Support\\nRules and Approval Steps\\nWorkflows and Handoffs"
                 }'::jsonb
                 WHEN item = '{
                   "icon":"Boxes",
                   "kicker":"Product Engineering",
                   "title":"Products built to operate",
                   "description":"We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
                   "bullets":"Product Ownership\\nPlatform Engineering\\nContinuous Operation"
                 }'::jsonb THEN '{
                   "icon":"Boxes",
                   "kicker":"SOFTWARE PRODUCTS",
                   "title":"Software we build and run",
                   "description":"We design, launch, and maintain our own products instead of handing them off after release.",
                   "bullets":"Product Design\\nPlatform Engineering\\nDaily Operation"
                 }'::jsonb
                 ELSE item
               END
               ORDER BY ord)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'home.products'
  AND (
    fields->'items' @> '[{
      "icon":"BrainCircuit",
      "kicker":"Artificial Intelligence",
      "title":"Autonomous Enterprise AI",
      "description":"Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
      "bullets":"Autonomous Customer Support\\nPolicy-Bound AI Agents\\nWorkflow Automation"
    }]'::jsonb
    OR fields->'items' @> '[{
      "icon":"Boxes",
      "kicker":"Product Engineering",
      "title":"Products built to operate",
      "description":"We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
      "bullets":"Product Ownership\\nPlatform Engineering\\nContinuous Operation"
    }]'::jsonb
  );

UPDATE site_sections
SET fields = jsonb_set(fields, '{eyebrow}', '"Work with us"'::jsonb), updated_at = now()
WHERE key = 'home.careers' AND fields->>'eyebrow' = 'Join the builders';
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"Build useful products."'::jsonb), updated_at = now()
WHERE key = 'home.careers' AND fields->>'heading' = 'Build products that matter.';
UPDATE site_sections
SET fields = jsonb_set(fields, '{subheading}',
      '"We work with engineers and product builders who care about clear thinking, solid work, and reliable software."'::jsonb),
    updated_at = now()
WHERE key = 'home.careers'
  AND fields->>'subheading' = 'We work with people who care about product quality, solid engineering, and technology that holds up at real scale. If that sounds like you, we want to hear from you.';
UPDATE site_sections
SET fields = jsonb_set(fields, '{ctaLabel}', '"Contact the team"'::jsonb), updated_at = now()
WHERE key = 'home.careers' AND fields->>'ctaLabel' = 'Meet the team';
`
    )
  },
  {
    id: 29,
    name: "remove_public_vercel_and_railway_partners",
    sql: (
      /* sql */
      `
-- Keep deployment providers private by removing them only from the public partner section.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(COALESCE(fields->'items', '[]'::jsonb))
           WITH ORDINALITY AS t(item, ord)
      WHERE item->>'name' NOT IN ('Vercel', 'Railway')
    )),
    updated_at = now()
WHERE key = 'home.partners'
  AND (fields->'items' @> '[{"name":"Vercel"}]'::jsonb
       OR fields->'items' @> '[{"name":"Railway"}]'::jsonb);
`
    )
  },
  {
    id: 30,
    name: "retire_devapay_and_pride",
    sql: (
      /* sql */
      `
-- The portfolio is now PulsePay, PulseAssist and Faga. DevaPay and PRIDE are retired: their pages,
-- sections, homepage tiles, roadmap milestones and nav/footer links are removed, and both routes
-- redirect to /portfolio in vercel.json. Same structure as migration 22 (the ePulse removal), and
-- every statement is guarded on the old state still being present, so a re-run is a no-op.

DELETE FROM site_sections
WHERE key IN ('portfolio.devapay', 'portfolio.pride')
   OR key LIKE 'portfolio.devapay.%'
   OR key LIKE 'portfolio.pride.%';
DELETE FROM cms_pages WHERE path IN ('/portfolio/devapay', '/portfolio/pride');

-- Homepage product tiles.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE COALESCE(item->>'url', '') NOT IN ('/portfolio/devapay', '/portfolio/pride')
    )),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND jsonb_typeof(fields->'items') = 'array'
  AND (position('/portfolio/devapay' in fields::text) > 0
       OR position('/portfolio/pride' in fields::text) > 0);

-- Roadmap milestones about either product.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE position('product: PRIDE' in COALESCE(item->>'description', '')) = 0
        AND COALESCE(item->>'title', '') <> 'DevaPay Launch'
    )),
    updated_at = now()
WHERE key = 'home.roadmap'
  AND jsonb_typeof(fields->'items') = 'array'
  AND (position('product: PRIDE' in fields::text) > 0
       OR fields->'items' @> '[{"title":"DevaPay Launch"}]'::jsonb);

-- The FAQ sentence that lists the portfolio.
UPDATE site_sections
SET fields = replace(fields::text,
      ', Faga provides transactional and marketing email infrastructure, DevaPay covers payment collection, and PRIDE extends the ecosystem into digital assets.',
      ', and Faga provides transactional and marketing email infrastructure.')::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND position('DevaPay covers payment collection' in fields::text) > 0;

-- Copy that described the old five-product portfolio. Each replacement only fires while the stored
-- value is still the untouched old default, so an administrator's own wording is left alone.
UPDATE site_sections
SET fields = fields || jsonb_build_object(
      'eyebrow', '',
      'heading', 'Unified technology solutions for growing enterprises',
      'subheading', 'We build and manage scalable platforms designed to handle business transactions, customer relations, and digital messaging seamlessly.',
      'secondaryCtaLabel', 'Talk to our team',
      'secondaryCtaUrl', '/contact'),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'We build software businesses can use every day.'
  AND fields->>'subheading' = 'ENICE builds and runs tools for customer support, payments, email, and digital assets.';

UPDATE site_sections
SET fields = fields || jsonb_build_object(
      'heading', 'Start with the product you need, or run all three together',
      'subheading', 'Every product is built on the same ENICE Engine, so payments, conversations and email share one secure foundation.'),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND fields->>'heading' = 'Products we build and run.';

UPDATE site_settings
SET value = jsonb_set(value, '{tagline}',
      to_jsonb('ENICE builds and runs software for payments, customer support, and email.'::text)),
    updated_at = now()
WHERE key = 'footer'
  AND value->>'tagline' = 'ENICE builds and runs software for payments, customer support, email, and digital assets.';

-- Header: drop both products from every menu (top level and children).
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                    THEN jsonb_set(item, '{children}', (
                           SELECT COALESCE(jsonb_agg(child ORDER BY cord), '[]'::jsonb)
                           FROM jsonb_array_elements(item->'children') WITH ORDINALITY AS c(child, cord)
                           WHERE COALESCE(child->>'url', '') NOT IN ('/portfolio/devapay', '/portfolio/pride')))
                    ELSE item END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
      WHERE COALESCE(item->>'url', '') NOT IN ('/portfolio/devapay', '/portfolio/pride')
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND (position('/portfolio/devapay' in value::text) > 0
       OR position('/portfolio/pride' in value::text) > 0);

-- Footer: the same, one level down in each column's links.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                     AND item->'children' @> '[{"url":"/portfolio/pulsepay"}]'::jsonb
                    THEN jsonb_set(item, '{children}', (item->'children') ||
                           '[{"id":"nav-pride","label":"PRIDE","url":"/portfolio/pride","visible":true}]'::jsonb)
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND NOT (value->'items' @> '[{"children":[{"url":"/portfolio/pride"}]}]'::jsonb);

UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(col->'links') = 'array'
                    THEN jsonb_set(col, '{links}', (
                           SELECT COALESCE(jsonb_agg(link ORDER BY lord), '[]'::jsonb)
                           FROM jsonb_array_elements(col->'links') WITH ORDINALITY AS l(link, lord)
                           WHERE COALESCE(link->>'url', '') NOT IN ('/portfolio/devapay', '/portfolio/pride')))
                    ELSE col END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND (position('/portfolio/devapay' in value::text) > 0
       OR position('/portfolio/pride' in value::text) > 0);
`
    )
  },
  {
    id: 31,
    name: "retire_pulseassist_and_faga_restore_pride",
    sql: (
      /* sql */
      `
-- The portfolio is now PulsePay and PRIDE. PulseAssist, Faga and the beta page are retired: their
-- sections, page records, nav and footer links and homepage tiles are removed, and their routes
-- redirect to /portfolio in vercel.json. PRIDE returns to the site, so its page and sections are
-- re-seeded where a previous migration deleted them.
--
-- Every statement is guarded on the old state still being present, so a re-run is a no-op and an
-- administrator's own later edit is left alone.

-- Retired product pages, their sections and their managed page records.
DELETE FROM site_sections
WHERE key IN ('portfolio.pulseassist', 'portfolio.faga')
   OR key LIKE 'portfolio.pulseassist.%'
   OR key LIKE 'portfolio.faga.%';
DELETE FROM cms_pages
WHERE path IN ('/portfolio/pulseassist', '/portfolio/faga', '/about-pulseassist-beta');

-- PRIDE: the page record and the three sections its page reads.
INSERT INTO cms_pages (id, path, title, summary, status, sections, seo, system_route, published_at)
SELECT md5(random()::text || clock_timestamp()::text)::uuid, '/portfolio/pride',
       'PRIDE', 'Digital asset trading and custody.',
       'published', '[]'::jsonb, '{}'::jsonb, true, now()
ON CONFLICT (path) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, sort_order, fields, updated_at)
VALUES
  ('portfolio.pride', 'PRIDE page', 'Portfolio', 'hero', 230,
   '{"eyebrow":"Digital Assets","heading":"PRIDE","subheading":"PRIDE is ENICE Group''s digital asset platform, designed to make cryptocurrency and digital finance simple, secure, and accessible, inside the same account as PulsePay."}'::jsonb,
   now()),
  ('portfolio.pride.facts', 'PRIDE launch facts', 'Portfolio', 'statistics', 231,
   '{"heading":"At launch","items":[{"value":"2027","label":"Public launch"},{"value":"Same ledger","label":"As PulsePay"},{"value":"Self-custody option","label":"Keys stay with the holder"}]}'::jsonb,
   now()),
  ('portfolio.pride.highlights', 'PRIDE highlights', 'Portfolio', 'featureGrid', 232,
   '{"eyebrow":"Platform Capabilities","heading":"What PRIDE does.","subheading":"The scope the platform is being built to, not a claim that any of it is live today.","items":[{"icon":"BarChart3","title":"Trading","description":"Buy and sell digital assets from the balance already held on PulsePay, with pricing shown before an order is placed."},{"icon":"Lock","title":"Custody","description":"Assets held with the same isolation and audit trail as money on the payment platform, with a self-custody option for holders who want it."},{"icon":"Globe","title":"Cross-ecosystem transfers","description":"Move value between the payment and asset sides of the ecosystem without leaving ENICE or repeating identity checks."},{"icon":"ShieldCheck","title":"Regulatory-ready","description":"KYC, AML and transaction monitoring run on the same controls as PulsePay, from the first transaction."}]}'::jsonb,
   now())
ON CONFLICT (key) DO NOTHING;

-- Homepage product tiles: drop the retired products, keep PulsePay, add PRIDE.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE COALESCE(item->>'url', '') NOT IN (
        '/portfolio/pulseassist', '/portfolio/faga', '/portfolio/payment-collection',
        '/portfolio/epulse', '/portfolio/pulsex', '/portfolio/devapay')
    )),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND jsonb_typeof(fields->'items') = 'array'
  AND (position('/portfolio/pulseassist' in fields::text) > 0
       OR position('/portfolio/faga' in fields::text) > 0
       OR position('/portfolio/payment-collection' in fields::text) > 0
       OR position('/portfolio/epulse' in fields::text) > 0
       OR position('/portfolio/pulsex' in fields::text) > 0);

UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (fields->'items') || '[
      {"icon":"Bitcoin","kicker":"DIGITAL ASSETS","title":"PRIDE","description":"ENICE Group''s digital asset platform for cryptocurrency trading, secure custody and cross-ecosystem digital finance, built on the same ledger as PulsePay.","bullets":"Launch: 2027\\nCategory: Digital assets","url":"/portfolio/pride"}
    ]'::jsonb),
    updated_at = now()
WHERE key = 'home.portfolio'
  AND jsonb_typeof(fields->'items') = 'array'
  AND position('/portfolio/pride' in fields::text) = 0;

-- Roadmap milestones about the retired products, plus the PRIDE milestones that replace them.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE position('product: PulseAssist' in COALESCE(item->>'description', '')) = 0
        AND position('product: Faga' in COALESCE(item->>'description', '')) = 0
        AND position('product: PulseX' in COALESCE(item->>'description', '')) = 0
        AND position('product: ePulse' in COALESCE(item->>'description', '')) = 0
        AND position('product: DevaPay' in COALESCE(item->>'description', '')) = 0
    )),
    updated_at = now()
WHERE key = 'home.roadmap'
  AND jsonb_typeof(fields->'items') = 'array'
  AND (position('product: PulseAssist' in fields::text) > 0
       OR position('product: Faga' in fields::text) > 0
       OR position('product: PulseX' in fields::text) > 0
       OR position('product: ePulse' in fields::text) > 0
       OR position('product: DevaPay' in fields::text) > 0);

-- PRIDE milestones, so the roadmap still describes the second product after the rows above.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (fields->'items') || '[
      {"title":"PRIDE Waitlist and Platform Preview","description":"when: Q4 2026\\nstatus: in-progress\\nproduct: PRIDE\\ntags: Digital Assets, Custody\\n\\nEarly access to the digital asset platform for users already holding funds on PulsePay, ahead of the public launch."},
      {"title":"PRIDE Public Launch","description":"when: 2027\\nstatus: planned\\nproduct: PRIDE\\ntags: Digital Assets, Trading\\n\\nTrading, custody and cross-ecosystem transfers open to PulsePay account holders."}
    ]'::jsonb),
    updated_at = now()
WHERE key = 'home.roadmap'
  AND jsonb_typeof(fields->'items') = 'array'
  AND position('product: PRIDE' in fields::text) = 0;

-- Header and footer: drop the retired products from every menu.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                    THEN jsonb_set(item, '{children}', (
                           SELECT COALESCE(jsonb_agg(child ORDER BY cord), '[]'::jsonb)
                           FROM jsonb_array_elements(item->'children') WITH ORDINALITY AS c(child, cord)
                           WHERE COALESCE(child->>'url', '') NOT IN ('/portfolio/pulseassist', '/portfolio/faga')))
                    ELSE item END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND (position('/portfolio/pulseassist' in value::text) > 0
       OR position('/portfolio/faga' in value::text) > 0);

UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                     AND item->'children' @> '[{"url":"/portfolio/pulsepay"}]'::jsonb
                    THEN jsonb_set(item, '{children}', (item->'children') ||
                           '[{"id":"nav-pride","label":"PRIDE","url":"/portfolio/pride","visible":true}]'::jsonb)
                    ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND NOT (value->'items' @> '[{"children":[{"url":"/portfolio/pride"}]}]'::jsonb);

UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(col->'links') = 'array'
                    THEN jsonb_set(col, '{links}', (
                           SELECT COALESCE(jsonb_agg(link ORDER BY lord), '[]'::jsonb)
                           FROM jsonb_array_elements(col->'links') WITH ORDINALITY AS l(link, lord)
                           WHERE COALESCE(link->>'url', '') NOT IN ('/portfolio/pulseassist', '/portfolio/faga')))
                    ELSE col END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND (position('/portfolio/pulseassist' in value::text) > 0
       OR position('/portfolio/faga' in value::text) > 0);

UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT jsonb_agg(
               CASE WHEN jsonb_typeof(col->'links') = 'array'
                     AND col->'links' @> '[{"url":"/portfolio/pulsepay"}]'::jsonb
                    THEN jsonb_set(col, '{links}', (col->'links') ||
                           '[{"id":"f-pride","label":"PRIDE","url":"/portfolio/pride","visible":true}]'::jsonb)
                    ELSE col END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND NOT (value->'columns' @> '[{"links":[{"url":"/portfolio/pride"}]}]'::jsonb);

-- Partners strip: the company's own products are not partners.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(item ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE COALESCE(item->>'name', '') <> 'PulseAssist'
    )),
    updated_at = now()
WHERE key = 'home.partners'
  AND jsonb_typeof(fields->'items') = 'array'
  AND position('PulseAssist' in fields::text) > 0;

-- The FAQ answers that listed the old portfolio.
UPDATE site_sections
SET fields = replace(replace(fields::text,
      'ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform, PulseAssist is our AI customer-operations platform, and Faga provides email delivery infrastructure.',
      'ENICE Group builds and operates technology products for financial services and digital assets. PulsePay is our digital payments platform and PRIDE is our digital asset platform, both running on the same shared infrastructure.'),
      'Our products focus on financial services, telecommunications, and business operations. PulsePay covers digital finance, PulseAssist provides AI customer operations, and Faga provides transactional and marketing email infrastructure.',
      'Our products focus on payments and digital finance. PulsePay covers cards, wallets and transfers for businesses and individuals, and PRIDE covers trading and custody of digital assets in the same account.')::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND (position('PulseAssist' in fields::text) > 0 OR position('Faga' in fields::text) > 0);
`
    )
  },
  {
    id: 32,
    name: "homepage_hero_platform_positioning",
    sql: (
      /* sql */
      `
-- The hero now says what the platform is rather than what it hopes to be. Guarded on the old
-- default still being in place, so an administrator's own wording is left alone.
UPDATE site_sections
SET fields = fields || jsonb_build_object(
      'heading', 'One ledger. Two products. One API.',
      'subheading', 'ENICE builds payment and digital asset infrastructure: PulsePay for cards, wallets and transfers, PRIDE for trading and custody, both on the same core.'),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'Unified technology solutions for growing enterprises';
`
    )
  },
  {
    id: 33,
    name: "homepage_hero_infrastructure_positioning",
    sql: (
      /* sql */
      `
-- Replace the console-style hero wording with the approved positioning. Guarded on the previous
-- default, so anything an administrator has written themselves survives.
UPDATE site_sections
SET fields = fields || jsonb_build_object(
      'eyebrow', 'Financial technology & digital infrastructure',
      'heading', 'Building the infrastructure behind modern finance.',
      'subheading', 'ENICE develops financial technology and digital asset infrastructure through PulsePay and PRIDE, creating solutions that simplify payments and expand access to digital financial services.',
      'primaryCtaLabel', 'Discover our solutions',
      'secondaryCtaLabel', 'Contact ENICE'),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'One ledger. Two products. One API.';
`
    )
  },
  {
    id: 34,
    name: "drop_partners_strip",
    sql: (
      /* sql */
      `
-- The infrastructure logo strip is no longer part of the homepage. Its section is removed so the
-- admin panel does not offer a band the site does not render.
DELETE FROM site_sections WHERE key = 'home.partners';
`
    )
  },
  {
    id: 35,
    name: "footer_tagline_two_products",
    sql: (
      /* sql */
      `
-- The footer described products that are no longer part of the company. Replace it only where the
-- old default is still in place, so an edited tagline is left alone.
UPDATE site_sections
SET fields = jsonb_set(fields, '{tagline}', to_jsonb('ENICE builds and runs payment and digital asset infrastructure for businesses across Africa.'::text)),
    updated_at = now()
WHERE key = 'site.footer'
  AND fields->>'tagline' = 'ENICE builds and runs software for payments, customer support, and email.';
`
    )
  },
  {
    id: 36,
    name: "pulsepay_waitlist",
    sql: (
      /* sql */
      `
-- PulsePay waitlist registrations. Stored in the CMS database rather than the email provider's
-- audience on purpose: the list has to survive a provider change, and the team needs to see who
-- registered even when no provider is configured.
CREATE TABLE IF NOT EXISTS pulsepay_waitlist (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  -- Normalised to +<digits> by the application; '' when none was given.
  phone text NOT NULL DEFAULT '',
  interests text[] NOT NULL DEFAULT '{}',
  segment text,
  status text NOT NULL DEFAULT 'new',

  -- Consent is its own fact, not a side effect of registering. consent_at records when it was
  -- given; unsubscribed_at records when it was withdrawn. A person with unsubscribed_at set stays
  -- on file (so they are not re-added) but is never notified.
  consent boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  unsubscribed_at timestamptz,

  source text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  last_contacted_at timestamptz,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT pulsepay_waitlist_status_check
    CHECK (status IN ('new','contacted','qualified','invited','onboarded','not_interested')),
  CONSTRAINT pulsepay_waitlist_segment_check
    CHECK (segment IS NULL OR segment IN ('individual','business','developer')),
  CONSTRAINT pulsepay_waitlist_consent_check
    CHECK (NOT consent OR consent_at IS NOT NULL)
);

-- One registration per person, whatever capitalisation they typed.
CREATE UNIQUE INDEX IF NOT EXISTS pulsepay_waitlist_email_key
  ON pulsepay_waitlist (lower(email));

-- The same phone number cannot register twice either. Partial, because phone is optional and
-- many rows legitimately have none.
CREATE UNIQUE INDEX IF NOT EXISTS pulsepay_waitlist_phone_key
  ON pulsepay_waitlist (phone) WHERE phone <> '';

CREATE INDEX IF NOT EXISTS pulsepay_waitlist_created_idx
  ON pulsepay_waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS pulsepay_waitlist_status_idx
  ON pulsepay_waitlist (status);
CREATE INDEX IF NOT EXISTS pulsepay_waitlist_interests_idx
  ON pulsepay_waitlist USING gin (interests);
`
    )
  }
];
var MIGRATIONS_TABLE_SQL = (
  /* sql */
  `
CREATE TABLE IF NOT EXISTS cms_migrations (
  id         integer PRIMARY KEY,
  name       text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`
);
var MIGRATION_LOCK_KEY = "8324119407551002";

// api-src/lib/db.ts
var DatabaseNotConfiguredError = class extends Error {
  constructor() {
    super(
      "The Website Manager database is not configured. Set DATABASE_URL to a Postgres connection string (a pooled endpoint is recommended). If the database was attached through a Vercel integration under a prefix, the prefixed name is also accepted \u2014 the value simply has to begin with postgres:// or postgresql://."
    );
    this.name = "DatabaseNotConfiguredError";
  }
};
function isUniqueViolation(error) {
  return Boolean(error) && error.code === "23505";
}
var client = null;
var POSTGRES_URL = /^postgres(ql)?:\/\/[^\s]/i;
function isPostgresUrl(value) {
  return POSTGRES_URL.test(value);
}
var URL_VARIABLES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING"
];
function resolveDatabaseUrl(env = process.env) {
  const match = findEnv(URL_VARIABLES, isPostgresUrl, env);
  return match === null ? null : { url: match.value, variable: match.name };
}
function isDatabaseConfigured() {
  return resolveDatabaseUrl() !== null;
}
function sslOptions(url) {
  if (/[?&]sslmode=/i.test(url)) return {};
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return { ssl: false };
    }
  } catch {
  }
  return { ssl: "require" };
}
function db() {
  if (client) return client;
  const resolved = resolveDatabaseUrl();
  if (resolved === null) throw new DatabaseNotConfiguredError();
  const { url, variable } = resolved;
  console.log(`[db] connecting using ${variable}`);
  client = src_default(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    // Named prepared statements are incompatible with transaction-mode poolers.
    prepare: false,
    // Spread, never assigned: see sslOptions on why `ssl: undefined` would disable TLS.
    ...sslOptions(url),
    // Postgres emits notices for every `IF NOT EXISTS` no-op during migration; they are
    // expected and would otherwise fill the function logs on each cold start.
    onnotice: () => {
    },
    transform: { undefined: null }
  });
  return client;
}
function newId() {
  return randomUUID();
}
var migrationPromise = null;
async function ensureMigrated() {
  if (!isDatabaseConfigured()) throw new DatabaseNotConfiguredError();
  if (migrationPromise) return migrationPromise;
  migrationPromise = runMigrations().catch((error) => {
    migrationPromise = null;
    throw error;
  });
  return migrationPromise;
}
async function runMigrations() {
  const sql = db();
  await sql.unsafe(MIGRATIONS_TABLE_SQL).simple();
  const applied = await sql`SELECT id FROM cms_migrations`;
  const appliedIds = new Set(applied.map((row) => row.id));
  const pending = MIGRATIONS.filter((migration) => !appliedIds.has(migration.id));
  if (pending.length === 0) return;
  await sql`SELECT pg_advisory_lock(${MIGRATION_LOCK_KEY}::bigint)`;
  try {
    const nowApplied = await sql`SELECT id FROM cms_migrations`;
    const nowAppliedIds = new Set(nowApplied.map((row) => row.id));
    for (const migration of MIGRATIONS) {
      if (nowAppliedIds.has(migration.id)) continue;
      await sql.unsafe(migration.sql).simple();
      await sql`
        INSERT INTO cms_migrations (id, name)
        VALUES (${migration.id}, ${migration.name})
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`[cms] applied migration ${migration.id}: ${migration.name}`);
    }
  } finally {
    await sql`SELECT pg_advisory_unlock(${MIGRATION_LOCK_KEY}::bigint)`;
  }
}
async function consumeRateLimit(key, max, windowMs) {
  const sql = db();
  const rows = await sql`
    INSERT INTO cms_rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + ${`${windowMs} milliseconds`}::interval)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN cms_rate_limits.reset_at < now() THEN 1
        ELSE cms_rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN cms_rate_limits.reset_at < now()
          THEN now() + ${`${windowMs} milliseconds`}::interval
        ELSE cms_rate_limits.reset_at
      END
    RETURNING count, reset_at
  `;
  const row = rows[0];
  const count = row?.count ?? 1;
  return {
    limited: count > max,
    remaining: Math.max(0, max - count),
    resetAt: row?.reset_at ?? new Date(Date.now() + windowMs)
  };
}

// src/lib/waitlist.ts
var WAITLIST_INTERESTS = [
  { id: "transfers", label: "Instant transfers and payments" },
  { id: "airtime", label: "Airtime and data purchases" },
  { id: "dollar_cards", label: "Virtual dollar cards" },
  { id: "bills", label: "Bill payments" },
  { id: "rewards", label: "Cashback and rewards" },
  { id: "assistant", label: "Fin, your financial assistant" },
  { id: "savings", label: "Money management and savings" }
];
var INTEREST_IDS = WAITLIST_INTERESTS.map((i) => i.id);
var WAITLIST_LIMITS = {
  name: 200,
  email: 200,
  phone: 24,
  notes: 2e3
};
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function normalizePhone(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (!hasPlus && digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
  }
  if (digits.length < 8 || digits.length > 15) return "";
  return `+${digits}`;
}
function validateWaitlist(values2) {
  const errors = {};
  const name = values2.name.trim();
  if (!name) errors.name = "Please enter your name.";
  else if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > WAITLIST_LIMITS.name)
    errors.name = `Please keep this under ${WAITLIST_LIMITS.name} characters.`;
  const email = values2.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > WAITLIST_LIMITS.email)
    errors.email = "Please enter a valid email address.";
  if (values2.phone.trim() && !normalizePhone(values2.phone))
    errors.phone = "Please enter a valid phone number, with country code if outside Nigeria.";
  if (values2.interests.some((i) => !INTEREST_IDS.includes(i)))
    errors.interests = "One of the selected options is not valid.";
  if (!values2.consent)
    errors.consent = "Please confirm you are happy for us to contact you about the launch.";
  return errors;
}

// api-src/lib/repo/waitlist.ts
async function joinWaitlist(input) {
  const sql = db();
  try {
    await sql`
      INSERT INTO pulsepay_waitlist
        (id, name, email, phone, interests, consent, consent_at, source)
      VALUES (
        ${newId()}, ${input.name}, ${input.email.toLowerCase()}, ${input.phone},
        ${input.interests}, ${input.consent}, ${input.consent ? sql`now()` : null}, ${input.source}
      )
    `;
    return "joined";
  } catch (error) {
    if (isUniqueViolation(error)) return "already_joined";
    throw error;
  }
}

// src/lib/email/types.ts
var MAX_DISPLAY_NAME = 120;
function displayName(raw) {
  const clean = raw.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_DISPLAY_NAME).trim();
  if (!clean) return "";
  return /^[A-Za-z0-9 !#$%&'*+\-/=?^_`{|}~.]+$/.test(clean) ? clean : `"${clean.replace(/([\\"])/g, "\\$1")}"`;
}
function formatAddress(sender) {
  const address = `${sender.localPart}@${sender.domain}`;
  const name = sender.name ? displayName(sender.name) : "";
  return name ? `${name} <${address}>` : address;
}
var AUTO_REPLY_HEADERS = {
  "Auto-Submitted": "auto-replied",
  "X-Auto-Response-Suppress": "All"
};
var EmailProviderConfigError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "EmailProviderConfigError";
  }
};
var EmailSendError = class extends Error {
  constructor(message, status = null, provider = null) {
    super(message);
    this.status = status;
    this.provider = provider;
    this.name = "EmailSendError";
  }
  status;
  provider;
};
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function isTransientStatus(status) {
  if (status === null) return false;
  return status === 429 || status >= 500;
}
async function withRetry(label, call2, shouldRetry, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    last = await call2();
    if (!shouldRetry(last)) return last;
    if (i < attempts - 1) {
      const backoff2 = 400 * 2 ** i;
      console.warn(`[email] ${label} hit a transient error; retrying in ${backoff2}ms`);
      await sleep(backoff2);
    }
  }
  return last;
}
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null
  };
}
function joinName(firstName, lastName) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}
function toRecipientArray(to) {
  return Array.isArray(to) ? to : [to];
}

// src/lib/email/provider-faga.server.ts
var DEFAULT_BASE_URL = "https://getpulseassist.com";
function config() {
  const apiKey = process.env.FAGA_API_KEY || process.env.PULSEASSIST_API_KEY;
  if (!apiKey) {
    throw new EmailProviderConfigError(
      "FAGA_API_KEY is not configured (PULSEASSIST_API_KEY is accepted as a legacy fallback)."
    );
  }
  const fromDomain = process.env.EMAIL_FROM_DOMAIN;
  if (!fromDomain) {
    throw new EmailProviderConfigError(
      "EMAIL_FROM_DOMAIN is not configured. It must be a domain verified in Faga."
    );
  }
  const baseUrl = (process.env.FAGA_API_URL || process.env.PULSEASSIST_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return { apiKey, baseUrl, fromDomain };
}
async function call(path, init = {}) {
  const { apiKey, baseUrl } = config();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json"
  };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;
  let res;
  try {
    res = await fetch(`${baseUrl}/v1${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body ? JSON.stringify(init.body) : void 0
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: `Could not reach Faga at ${baseUrl}: ${String(err)}`,
      code: null
    };
  }
  const text = await res.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }
  if (!res.ok) {
    const p = parsed ?? {};
    const detail = typeof p.detail === "string" && p.detail || typeof p.title === "string" && p.title || typeof p.error === "string" && p.error || `Faga returned ${res.status}`;
    const code = typeof p.code === "string" ? p.code : null;
    return { ok: false, status: res.status, data: null, error: detail, code };
  }
  return { ok: true, status: res.status, data: parsed ?? null, error: null, code: null };
}
async function callWithRetry(label, path, init = {}, attempts = 3) {
  let last = {
    ok: false,
    status: 0,
    data: null,
    error: "not attempted",
    code: null
  };
  for (let i = 0; i < attempts; i++) {
    last = await call(path, init);
    if (last.ok) return last;
    const retryable = last.status === 0 || isTransientStatus(last.status);
    if (!retryable) return last;
    if (i < attempts - 1) {
      const backoff2 = 400 * 2 ** i;
      console.warn(`[faga] ${label} failed (${last.status}); retrying in ${backoff2}ms`);
      await sleep(backoff2);
    }
  }
  return last;
}
function isConfigRefusal(res) {
  if (res.status === 401) return true;
  if (res.status !== 403) return false;
  const code = res.code ?? "";
  return /CAPABILITY|ENTITLEMENT|PLAN|SUBSCRIPTION|SCOPE/i.test(code);
}
var listIdCache = /* @__PURE__ */ new Map();
async function resolveListId(audience) {
  const pinEnvVars = [audience.idEnvVars?.faga, audience.idEnvVars?.pulseassist].filter(
    (name) => Boolean(name)
  );
  const pinned = pinEnvVars.map((name) => process.env[name]).find(Boolean);
  if (pinned && /^\d+$/.test(pinned.trim())) return Number(pinned.trim());
  const cached = listIdCache.get(audience.name);
  if (cached) return cached;
  const existing = await callWithRetry("lists.list", "/email/lists");
  if (!existing.ok) {
    if (isConfigRefusal(existing))
      throw new EmailProviderConfigError(existing.error ?? "Faga refused the API key.");
    throw new EmailSendError(
      `Could not list audiences: ${existing.error}`,
      existing.status,
      "faga"
    );
  }
  const found = (existing.data?.lists ?? []).find((l) => l.name === audience.name);
  if (found) {
    listIdCache.set(audience.name, found.id);
    return found.id;
  }
  const created = await callWithRetry("lists.create", "/email/lists", {
    method: "POST",
    body: { name: audience.name, description: "Created automatically by the ENICE website." }
  });
  if (!created.ok || !created.data?.list?.id) {
    const reread = await callWithRetry("lists.list(retry)", "/email/lists");
    const raced = (reread.data?.lists ?? []).find((l) => l.name === audience.name);
    if (raced) {
      listIdCache.set(audience.name, raced.id);
      return raced.id;
    }
    throw new EmailSendError(
      `Could not create the "${audience.name}" audience: ${created.error}`,
      created.status,
      "faga"
    );
  }
  listIdCache.set(audience.name, created.data.list.id);
  return created.data.list.id;
}
function toAudienceContact(c) {
  return {
    id: String(c.id),
    email: c.email,
    name: c.name ?? c.email,
    attributes: c.attributes ?? {},
    createdAt: c.createdAt
  };
}
async function fetchContact(email) {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const res = await callWithRetry(
    "contacts.search",
    `/email/contacts?limit=25&search=${encodeURIComponent(target)}`
  );
  if (!res.ok) {
    if (isConfigRefusal(res))
      throw new EmailProviderConfigError(res.error ?? "Faga refused the API key.");
    throw new EmailSendError(`Could not look up the contact: ${res.error}`, res.status, "faga");
  }
  return (res.data?.contacts ?? []).find((c) => c.email.trim().toLowerCase() === target) ?? null;
}
var fagaProvider = {
  name: "faga",
  async send(message) {
    const { fromDomain } = config();
    if (message.from.domain.toLowerCase() !== fromDomain.toLowerCase()) {
      throw new EmailProviderConfigError(
        `Refusing to send as "${message.from.localPart}@${message.from.domain}": Faga sends from the account's verified domain, which is configured as "${fromDomain}". Verify the domain in Faga and set EMAIL_FROM_DOMAIN to match.`
      );
    }
    const recipients = toRecipientArray(message.to);
    const res = await callWithRetry("email.send", "/emails", {
      method: "POST",
      body: {
        // A local part only — see the note above.
        from: message.from.localPart,
        /*
         * The display name, sent separately because `from` cannot carry it.
         *
         * Without this the API composes a bare `noreply@enicehq.com` and every message the site
         * sends arrives showing a raw address — which the recipient's inbox lists as though it were
         * machine-generated. ENICE's own team read contact-form enquiries that way: an automated
         * notice rather than a person writing in. Faga sanitises the value server-side, so a
         * visitor's typed name cannot forge a header through it.
         */
        ...message.from.name ? { fromName: message.from.name } : {},
        ...message.headers && Object.keys(message.headers).length > 0 ? { headers: message.headers } : {},
        to: recipients.length === 1 ? recipients[0] : recipients,
        ...message.replyTo ? { replyTo: message.replyTo } : {},
        subject: message.subject,
        html: message.html,
        ...message.text ? { text: message.text } : {}
      },
      idempotencyKey: message.idempotencyKey
    });
    if (!res.ok) {
      if (isConfigRefusal(res)) {
        throw new EmailProviderConfigError(res.error ?? "Faga refused the API key.");
      }
      throw new EmailSendError(res.error ?? "Faga refused the message.", res.status, "faga");
    }
    return { id: res.data?.id ?? res.data?.sendId ?? null, provider: "faga" };
  },
  async findContact(email) {
    const contact = await fetchContact(email);
    return contact ? toAudienceContact(contact) : null;
  },
  async upsertContact(input) {
    const email = input.email.trim().toLowerCase();
    const listId = await resolveListId(input.audience);
    const existing = await fetchContact(email);
    if (existing) {
      const merged = { ...existing.attributes ?? {}, ...input.attributes };
      const updated = await callWithRetry(
        "contacts.update",
        `/email/contacts/${existing.id}`,
        { method: "PATCH", body: { name: existing.name ?? input.name, attributes: merged } }
      );
      if (!updated.ok) {
        throw new EmailSendError(
          `Could not update the contact: ${updated.error}`,
          updated.status,
          "faga"
        );
      }
      await addToList(listId, existing.id);
      return { outcome: "updated" };
    }
    const created = await callWithRetry(
      "contacts.create",
      "/email/contacts",
      {
        method: "POST",
        body: {
          email,
          name: input.name,
          attributes: input.attributes,
          source: "enice_website"
        }
      }
    );
    if (!created.ok || !created.data?.contact?.id) {
      if (isConfigRefusal(created)) {
        throw new EmailProviderConfigError(created.error ?? "Faga refused the API key.");
      }
      throw new EmailSendError(
        `Could not create the contact: ${created.error}`,
        created.status,
        "faga"
      );
    }
    await addToList(listId, created.data.contact.id);
    return { outcome: "created" };
  },
  async updateContactAttributes(email, attributes) {
    const existing = await fetchContact(email);
    if (!existing) return false;
    const merged = { ...existing.attributes ?? {}, ...attributes };
    const res = await callWithRetry(
      "contacts.update(attributes)",
      `/email/contacts/${existing.id}`,
      { method: "PATCH", body: { attributes: merged } }
    );
    if (!res.ok) {
      throw new EmailSendError(`Could not update the contact: ${res.error}`, res.status, "faga");
    }
    return true;
  },
  async listAudienceContacts(audience, limit) {
    const listId = await resolveListId(audience);
    const capped = Math.min(Math.max(limit, 1), 100);
    const res = await callWithRetry(
      "contacts.list",
      `/email/contacts?limit=${capped}&listId=${listId}`
    );
    if (!res.ok) {
      if (isConfigRefusal(res))
        throw new EmailProviderConfigError(res.error ?? "Faga refused the API key.");
      throw new EmailSendError(`Could not list the audience: ${res.error}`, res.status, "faga");
    }
    const contacts = (res.data?.contacts ?? []).map(toAudienceContact);
    return { contacts, hasMore: Boolean(res.data?.nextAfterId) };
  }
};
async function addToList(listId, contactId) {
  const res = await callWithRetry("lists.addMembers", `/email/lists/${listId}/members`, {
    method: "POST",
    body: { contactIds: [Number(contactId)] }
  });
  if (!res.ok && !/exist|already|duplicate/i.test(res.error ?? "")) {
    throw new EmailSendError(
      `Could not add the contact to the audience: ${res.error}`,
      res.status,
      "faga"
    );
  }
}

// node_modules/postal-mime/src/decode-strings.js
var textEncoder = new TextEncoder();
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}
function decodeBase64(base64) {
  let bufferLength = Math.ceil(base64.length / 4) * 3;
  const len = base64.length;
  let p = 0;
  if (base64.length % 4 === 3) {
    bufferLength--;
  } else if (base64.length % 4 === 2) {
    bufferLength -= 2;
  } else if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i += 4) {
    let encoded1 = base64Lookup[base64.charCodeAt(i)];
    let encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    let encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    let encoded4 = base64Lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arrayBuffer;
}
var charsetAliases = /* @__PURE__ */ new Map([
  ["iso-8859-8-i", "iso-8859-8"],
  ["iso-8859-8-e", "iso-8859-8"]
]);
function getDecoder(charset) {
  charset = (charset || "utf8").trim().toLowerCase();
  charset = charsetAliases.get(charset) || charset;
  let decoder;
  try {
    decoder = new TextDecoder(charset);
  } catch (err) {
    decoder = new TextDecoder("windows-1252");
  }
  return decoder;
}
async function blobToArrayBuffer(blob) {
  if ("arrayBuffer" in blob) {
    return await blob.arrayBuffer();
  }
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.onload = function(e) {
      resolve(e.target.result);
    };
    fr.onerror = function(e) {
      reject(fr.error);
    };
    fr.readAsArrayBuffer(blob);
  });
}
function getHex(c) {
  if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
    return String.fromCharCode(c);
  }
  return false;
}
function decodeWord(charset, encoding, str) {
  let splitPos = charset.indexOf("*");
  if (splitPos >= 0) {
    charset = charset.substr(0, splitPos);
  }
  encoding = encoding.toUpperCase();
  let byteStr;
  if (encoding === "Q") {
    str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
    let buf = textEncoder.encode(str);
    let encodedBytes = [];
    for (let i = 0, len = buf.length; i < len; i++) {
      let c = buf[i];
      if (i <= len - 2 && c === 61) {
        let c1 = getHex(buf[i + 1]);
        let c2 = getHex(buf[i + 2]);
        if (c1 && c2) {
          let c3 = parseInt(c1 + c2, 16);
          encodedBytes.push(c3);
          i += 2;
          continue;
        }
      }
      encodedBytes.push(c);
    }
    byteStr = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(byteStr);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, encodedBytes[i]);
    }
  } else if (encoding === "B") {
    byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
  } else {
    byteStr = textEncoder.encode(str);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeWords(str) {
  let joinString = true;
  let done = false;
  while (!done) {
    let result = (str || "").toString().replace(
      /(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g,
      (match, left, chLeft, encodedLeftStr, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(
      /(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g,
      (match, left, chLeft, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(
      /=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g,
      (m, charset, encoding, text) => decodeWord(charset, encoding, text)
    );
    if (joinString && result.indexOf("\uFFFD") >= 0) {
      joinString = false;
    } else {
      return result;
    }
  }
}
function decodeURIComponentWithCharset(encodedStr, charset) {
  charset = charset || "utf-8";
  let encodedBytes = [];
  for (let i = 0; i < encodedStr.length; i++) {
    let c = encodedStr.charAt(i);
    if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
      let byte = encodedStr.substr(i + 1, 2);
      i += 2;
      encodedBytes.push(parseInt(byte, 16));
    } else if (c.charCodeAt(0) > 126) {
      c = textEncoder.encode(c);
      for (let j = 0; j < c.length; j++) {
        encodedBytes.push(c[j]);
      }
    } else {
      encodedBytes.push(c.charCodeAt(0));
    }
  }
  const byteStr = new ArrayBuffer(encodedBytes.length);
  const dataView = new DataView(byteStr);
  for (let i = 0, len = encodedBytes.length; i < len; i++) {
    dataView.setUint8(i, encodedBytes[i]);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeParameterValueContinuations(header) {
  let paramKeys = /* @__PURE__ */ new Map();
  Object.keys(header.params).forEach((key) => {
    let match = key.match(/\*((\d+)\*?)?$/);
    if (!match) {
      return;
    }
    let actualKey = key.substr(0, match.index).toLowerCase();
    let nr = Number(match[2]) || 0;
    let paramVal;
    if (!paramKeys.has(actualKey)) {
      paramVal = {
        charset: false,
        values: []
      };
      paramKeys.set(actualKey, paramVal);
    } else {
      paramVal = paramKeys.get(actualKey);
    }
    let value = header.params[key];
    if (nr === 0 && match[0].charAt(match[0].length - 1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
      paramVal.charset = match[1] || "utf-8";
      value = match[2];
    }
    paramVal.values.push({ nr, value });
    delete header.params[key];
  });
  paramKeys.forEach((paramVal, key) => {
    header.params[key] = decodeURIComponentWithCharset(
      paramVal.values.sort((a, b2) => a.nr - b2.nr).map((a) => a.value).join(""),
      paramVal.charset
    );
  });
}

// node_modules/postal-mime/src/pass-through-decoder.js
var PassThroughDecoder = class {
  constructor() {
    this.chunks = [];
  }
  update(line) {
    this.chunks.push(line);
    this.chunks.push("\n");
  }
  finalize() {
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};

// node_modules/postal-mime/src/base64-decoder.js
var Base64Decoder = class {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.chunks = [];
    this.remainder = "";
  }
  update(buffer2) {
    let str = this.decoder.decode(buffer2);
    str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
    this.remainder += str;
    if (this.remainder.length >= this.maxChunkSize) {
      let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
      let base64Str;
      if (allowedBytes === this.remainder.length) {
        base64Str = this.remainder;
        this.remainder = "";
      } else {
        base64Str = this.remainder.substr(0, allowedBytes);
        this.remainder = this.remainder.substr(allowedBytes);
      }
      if (base64Str.length) {
        this.chunks.push(decodeBase64(base64Str));
      }
    }
  }
  finalize() {
    if (this.remainder && !/^=+$/.test(this.remainder)) {
      this.chunks.push(decodeBase64(this.remainder));
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};

// node_modules/postal-mime/src/qp-decoder.js
var VALID_QP_REGEX = /^=[a-f0-9]{2}$/i;
var QP_SPLIT_REGEX = /(?==[a-f0-9]{2})/i;
var SOFT_LINE_BREAK_REGEX = /=\r?\n/g;
var PARTIAL_QP_ENDING_REGEX = /=[a-fA-F0-9]?$/;
var QPDecoder = class {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.remainder = "";
    this.chunks = [];
  }
  decodeQPBytes(encodedBytes) {
    let buf = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(buf);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, parseInt(encodedBytes[i], 16));
    }
    return buf;
  }
  decodeChunks(str) {
    str = str.replace(SOFT_LINE_BREAK_REGEX, "");
    let list = str.split(QP_SPLIT_REGEX);
    let encodedBytes = [];
    for (let part of list) {
      if (part.charAt(0) !== "=") {
        if (encodedBytes.length) {
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
        }
        this.chunks.push(part);
        continue;
      }
      if (part.length === 3) {
        if (VALID_QP_REGEX.test(part)) {
          encodedBytes.push(part.substr(1));
        } else {
          if (encodedBytes.length) {
            this.chunks.push(this.decodeQPBytes(encodedBytes));
            encodedBytes = [];
          }
          this.chunks.push(part);
        }
        continue;
      }
      if (part.length > 3) {
        const firstThree = part.substr(0, 3);
        if (VALID_QP_REGEX.test(firstThree)) {
          encodedBytes.push(part.substr(1, 2));
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
          part = part.substr(3);
          this.chunks.push(part);
        } else {
          if (encodedBytes.length) {
            this.chunks.push(this.decodeQPBytes(encodedBytes));
            encodedBytes = [];
          }
          this.chunks.push(part);
        }
      }
    }
    if (encodedBytes.length) {
      this.chunks.push(this.decodeQPBytes(encodedBytes));
    }
  }
  update(buffer2) {
    let str = this.decoder.decode(buffer2) + "\n";
    str = this.remainder + str;
    if (str.length < this.maxChunkSize) {
      this.remainder = str;
      return;
    }
    this.remainder = "";
    let partialEnding = str.match(PARTIAL_QP_ENDING_REGEX);
    if (partialEnding) {
      if (partialEnding.index === 0) {
        this.remainder = str;
        return;
      }
      this.remainder = str.substr(partialEnding.index);
      str = str.substr(0, partialEnding.index);
    }
    this.decodeChunks(str);
  }
  finalize() {
    if (this.remainder.length) {
      this.decodeChunks(this.remainder);
      this.remainder = "";
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};

// node_modules/postal-mime/src/mime-node.js
var defaultDecoder = getDecoder();
var MimeNode = class {
  constructor(options) {
    this.options = options || {};
    this.postalMime = this.options.postalMime;
    this.root = !!this.options.parentNode;
    this.childNodes = [];
    if (this.options.parentNode) {
      this.parentNode = this.options.parentNode;
      this.depth = this.parentNode.depth + 1;
      if (this.depth > this.options.maxNestingDepth) {
        throw new Error(`Maximum MIME nesting depth of ${this.options.maxNestingDepth} levels exceeded`);
      }
      this.options.parentNode.childNodes.push(this);
    } else {
      this.depth = 0;
    }
    this.state = "header";
    this.headerLines = [];
    this.headerSize = 0;
    const parentMultipartType = this.options.parentMultipartType || null;
    const defaultContentType = parentMultipartType === "digest" ? "message/rfc822" : "text/plain";
    this.contentType = {
      value: defaultContentType,
      default: true
    };
    this.contentTransferEncoding = {
      value: "8bit"
    };
    this.contentDisposition = {
      value: ""
    };
    this.headers = [];
    this.contentDecoder = false;
  }
  setupContentDecoder(transferEncoding) {
    if (/base64/i.test(transferEncoding)) {
      this.contentDecoder = new Base64Decoder();
    } else if (/quoted-printable/i.test(transferEncoding)) {
      this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
    } else {
      this.contentDecoder = new PassThroughDecoder();
    }
  }
  async finalize() {
    if (this.state === "finished") {
      return;
    }
    if (this.state === "header") {
      this.processHeaders();
    }
    let boundaries = this.postalMime.boundaries;
    for (let i = boundaries.length - 1; i >= 0; i--) {
      let boundary = boundaries[i];
      if (boundary.node === this) {
        boundaries.splice(i, 1);
        break;
      }
    }
    await this.finalizeChildNodes();
    this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
    this.contentDecoder = false;
    this.state = "finished";
  }
  async finalizeChildNodes() {
    for (let childNode of this.childNodes) {
      await childNode.finalize();
    }
  }
  // Strip RFC 822 comments (parenthesized text) from structured header values
  stripComments(str) {
    let result = "";
    let depth = 0;
    let escaped = false;
    let inQuote = false;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charAt(i);
      if (escaped) {
        if (depth === 0) {
          result += chr;
        }
        escaped = false;
        continue;
      }
      if (chr === "\\") {
        escaped = true;
        if (depth === 0) {
          result += chr;
        }
        continue;
      }
      if (chr === '"' && depth === 0) {
        inQuote = !inQuote;
        result += chr;
        continue;
      }
      if (!inQuote) {
        if (chr === "(") {
          depth++;
          continue;
        }
        if (chr === ")" && depth > 0) {
          depth--;
          continue;
        }
      }
      if (depth === 0) {
        result += chr;
      }
    }
    return result;
  }
  parseStructuredHeader(str) {
    str = this.stripComments(str);
    let response = {
      value: false,
      params: {}
    };
    let key = false;
    let value = "";
    let stage = "value";
    let quote = false;
    let escaped = false;
    let chr;
    for (let i = 0, len = str.length; i < len; i++) {
      chr = str.charAt(i);
      switch (stage) {
        case "key":
          if (chr === "=") {
            key = value.trim().toLowerCase();
            stage = "value";
            value = "";
            break;
          }
          value += chr;
          break;
        case "value":
          if (escaped) {
            value += chr;
          } else if (chr === "\\") {
            escaped = true;
            continue;
          } else if (quote && chr === quote) {
            quote = false;
          } else if (!quote && chr === '"') {
            quote = chr;
          } else if (!quote && chr === ";") {
            if (key === false) {
              response.value = value.trim();
            } else {
              response.params[key] = value.trim();
            }
            stage = "key";
            value = "";
          } else {
            value += chr;
          }
          escaped = false;
          break;
      }
    }
    value = value.trim();
    if (stage === "value") {
      if (key === false) {
        response.value = value;
      } else {
        response.params[key] = value;
      }
    } else if (value) {
      response.params[value.toLowerCase()] = "";
    }
    if (response.value) {
      response.value = response.value.toLowerCase();
    }
    decodeParameterValueContinuations(response);
    return response;
  }
  decodeFlowedText(str, delSp) {
    return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
      if (previousValue.endsWith(" ") && previousValue !== "-- " && !previousValue.endsWith("\n-- ")) {
        if (delSp) {
          return previousValue.slice(0, -1) + currentValue;
        } else {
          return previousValue + currentValue;
        }
      } else {
        return previousValue + "\n" + currentValue;
      }
    }).replace(/^ /gm, "");
  }
  getTextContent() {
    if (!this.content) {
      return "";
    }
    let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
    if (/^flowed$/i.test(this.contentType.parsed.params.format)) {
      str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
    }
    return str;
  }
  processHeaders() {
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let line = this.headerLines[i];
      if (i && /^\s/.test(line)) {
        this.headerLines[i - 1] += "\n" + line;
        this.headerLines.splice(i, 1);
      }
    }
    this.rawHeaderLines = [];
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let rawLine = this.headerLines[i];
      let sep = rawLine.indexOf(":");
      let rawKey = sep < 0 ? rawLine.trim() : rawLine.substr(0, sep).trim();
      this.rawHeaderLines.push({
        key: rawKey.toLowerCase(),
        line: rawLine
      });
      let normalizedLine = rawLine.replace(/\s+/g, " ");
      sep = normalizedLine.indexOf(":");
      let key = sep < 0 ? normalizedLine.trim() : normalizedLine.substr(0, sep).trim();
      let value = sep < 0 ? "" : normalizedLine.substr(sep + 1).trim();
      this.headers.push({ key: key.toLowerCase(), originalKey: key, value });
      switch (key.toLowerCase()) {
        case "content-type":
          if (this.contentType.default) {
            this.contentType = { value, parsed: {} };
          }
          break;
        case "content-transfer-encoding":
          this.contentTransferEncoding = { value, parsed: {} };
          break;
        case "content-disposition":
          this.contentDisposition = { value, parsed: {} };
          break;
        case "content-id":
          this.contentId = value;
          break;
        case "content-description":
          this.contentDescription = value;
          break;
      }
    }
    this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
    this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
    if (this.contentType.multipart && this.contentType.parsed.params.boundary) {
      this.postalMime.boundaries.push({
        value: textEncoder.encode(this.contentType.parsed.params.boundary),
        node: this
      });
    }
    this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
    this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
    this.setupContentDecoder(this.contentTransferEncoding.encoding);
  }
  feed(line) {
    switch (this.state) {
      case "header":
        if (!line.length) {
          this.state = "body";
          return this.processHeaders();
        }
        this.headerSize += line.length;
        if (this.headerSize > this.options.maxHeadersSize) {
          let error = new Error(`Maximum header size of ${this.options.maxHeadersSize} bytes exceeded`);
          throw error;
        }
        this.headerLines.push(defaultDecoder.decode(line));
        break;
      case "body": {
        this.contentDecoder.update(line);
      }
    }
  }
};

// node_modules/postal-mime/src/html-entities.js
var htmlEntities = {
  "&AElig": "\xC6",
  "&AElig;": "\xC6",
  "&AMP": "&",
  "&AMP;": "&",
  "&Aacute": "\xC1",
  "&Aacute;": "\xC1",
  "&Abreve;": "\u0102",
  "&Acirc": "\xC2",
  "&Acirc;": "\xC2",
  "&Acy;": "\u0410",
  "&Afr;": "\u{1D504}",
  "&Agrave": "\xC0",
  "&Agrave;": "\xC0",
  "&Alpha;": "\u0391",
  "&Amacr;": "\u0100",
  "&And;": "\u2A53",
  "&Aogon;": "\u0104",
  "&Aopf;": "\u{1D538}",
  "&ApplyFunction;": "\u2061",
  "&Aring": "\xC5",
  "&Aring;": "\xC5",
  "&Ascr;": "\u{1D49C}",
  "&Assign;": "\u2254",
  "&Atilde": "\xC3",
  "&Atilde;": "\xC3",
  "&Auml": "\xC4",
  "&Auml;": "\xC4",
  "&Backslash;": "\u2216",
  "&Barv;": "\u2AE7",
  "&Barwed;": "\u2306",
  "&Bcy;": "\u0411",
  "&Because;": "\u2235",
  "&Bernoullis;": "\u212C",
  "&Beta;": "\u0392",
  "&Bfr;": "\u{1D505}",
  "&Bopf;": "\u{1D539}",
  "&Breve;": "\u02D8",
  "&Bscr;": "\u212C",
  "&Bumpeq;": "\u224E",
  "&CHcy;": "\u0427",
  "&COPY": "\xA9",
  "&COPY;": "\xA9",
  "&Cacute;": "\u0106",
  "&Cap;": "\u22D2",
  "&CapitalDifferentialD;": "\u2145",
  "&Cayleys;": "\u212D",
  "&Ccaron;": "\u010C",
  "&Ccedil": "\xC7",
  "&Ccedil;": "\xC7",
  "&Ccirc;": "\u0108",
  "&Cconint;": "\u2230",
  "&Cdot;": "\u010A",
  "&Cedilla;": "\xB8",
  "&CenterDot;": "\xB7",
  "&Cfr;": "\u212D",
  "&Chi;": "\u03A7",
  "&CircleDot;": "\u2299",
  "&CircleMinus;": "\u2296",
  "&CirclePlus;": "\u2295",
  "&CircleTimes;": "\u2297",
  "&ClockwiseContourIntegral;": "\u2232",
  "&CloseCurlyDoubleQuote;": "\u201D",
  "&CloseCurlyQuote;": "\u2019",
  "&Colon;": "\u2237",
  "&Colone;": "\u2A74",
  "&Congruent;": "\u2261",
  "&Conint;": "\u222F",
  "&ContourIntegral;": "\u222E",
  "&Copf;": "\u2102",
  "&Coproduct;": "\u2210",
  "&CounterClockwiseContourIntegral;": "\u2233",
  "&Cross;": "\u2A2F",
  "&Cscr;": "\u{1D49E}",
  "&Cup;": "\u22D3",
  "&CupCap;": "\u224D",
  "&DD;": "\u2145",
  "&DDotrahd;": "\u2911",
  "&DJcy;": "\u0402",
  "&DScy;": "\u0405",
  "&DZcy;": "\u040F",
  "&Dagger;": "\u2021",
  "&Darr;": "\u21A1",
  "&Dashv;": "\u2AE4",
  "&Dcaron;": "\u010E",
  "&Dcy;": "\u0414",
  "&Del;": "\u2207",
  "&Delta;": "\u0394",
  "&Dfr;": "\u{1D507}",
  "&DiacriticalAcute;": "\xB4",
  "&DiacriticalDot;": "\u02D9",
  "&DiacriticalDoubleAcute;": "\u02DD",
  "&DiacriticalGrave;": "`",
  "&DiacriticalTilde;": "\u02DC",
  "&Diamond;": "\u22C4",
  "&DifferentialD;": "\u2146",
  "&Dopf;": "\u{1D53B}",
  "&Dot;": "\xA8",
  "&DotDot;": "\u20DC",
  "&DotEqual;": "\u2250",
  "&DoubleContourIntegral;": "\u222F",
  "&DoubleDot;": "\xA8",
  "&DoubleDownArrow;": "\u21D3",
  "&DoubleLeftArrow;": "\u21D0",
  "&DoubleLeftRightArrow;": "\u21D4",
  "&DoubleLeftTee;": "\u2AE4",
  "&DoubleLongLeftArrow;": "\u27F8",
  "&DoubleLongLeftRightArrow;": "\u27FA",
  "&DoubleLongRightArrow;": "\u27F9",
  "&DoubleRightArrow;": "\u21D2",
  "&DoubleRightTee;": "\u22A8",
  "&DoubleUpArrow;": "\u21D1",
  "&DoubleUpDownArrow;": "\u21D5",
  "&DoubleVerticalBar;": "\u2225",
  "&DownArrow;": "\u2193",
  "&DownArrowBar;": "\u2913",
  "&DownArrowUpArrow;": "\u21F5",
  "&DownBreve;": "\u0311",
  "&DownLeftRightVector;": "\u2950",
  "&DownLeftTeeVector;": "\u295E",
  "&DownLeftVector;": "\u21BD",
  "&DownLeftVectorBar;": "\u2956",
  "&DownRightTeeVector;": "\u295F",
  "&DownRightVector;": "\u21C1",
  "&DownRightVectorBar;": "\u2957",
  "&DownTee;": "\u22A4",
  "&DownTeeArrow;": "\u21A7",
  "&Downarrow;": "\u21D3",
  "&Dscr;": "\u{1D49F}",
  "&Dstrok;": "\u0110",
  "&ENG;": "\u014A",
  "&ETH": "\xD0",
  "&ETH;": "\xD0",
  "&Eacute": "\xC9",
  "&Eacute;": "\xC9",
  "&Ecaron;": "\u011A",
  "&Ecirc": "\xCA",
  "&Ecirc;": "\xCA",
  "&Ecy;": "\u042D",
  "&Edot;": "\u0116",
  "&Efr;": "\u{1D508}",
  "&Egrave": "\xC8",
  "&Egrave;": "\xC8",
  "&Element;": "\u2208",
  "&Emacr;": "\u0112",
  "&EmptySmallSquare;": "\u25FB",
  "&EmptyVerySmallSquare;": "\u25AB",
  "&Eogon;": "\u0118",
  "&Eopf;": "\u{1D53C}",
  "&Epsilon;": "\u0395",
  "&Equal;": "\u2A75",
  "&EqualTilde;": "\u2242",
  "&Equilibrium;": "\u21CC",
  "&Escr;": "\u2130",
  "&Esim;": "\u2A73",
  "&Eta;": "\u0397",
  "&Euml": "\xCB",
  "&Euml;": "\xCB",
  "&Exists;": "\u2203",
  "&ExponentialE;": "\u2147",
  "&Fcy;": "\u0424",
  "&Ffr;": "\u{1D509}",
  "&FilledSmallSquare;": "\u25FC",
  "&FilledVerySmallSquare;": "\u25AA",
  "&Fopf;": "\u{1D53D}",
  "&ForAll;": "\u2200",
  "&Fouriertrf;": "\u2131",
  "&Fscr;": "\u2131",
  "&GJcy;": "\u0403",
  "&GT": ">",
  "&GT;": ">",
  "&Gamma;": "\u0393",
  "&Gammad;": "\u03DC",
  "&Gbreve;": "\u011E",
  "&Gcedil;": "\u0122",
  "&Gcirc;": "\u011C",
  "&Gcy;": "\u0413",
  "&Gdot;": "\u0120",
  "&Gfr;": "\u{1D50A}",
  "&Gg;": "\u22D9",
  "&Gopf;": "\u{1D53E}",
  "&GreaterEqual;": "\u2265",
  "&GreaterEqualLess;": "\u22DB",
  "&GreaterFullEqual;": "\u2267",
  "&GreaterGreater;": "\u2AA2",
  "&GreaterLess;": "\u2277",
  "&GreaterSlantEqual;": "\u2A7E",
  "&GreaterTilde;": "\u2273",
  "&Gscr;": "\u{1D4A2}",
  "&Gt;": "\u226B",
  "&HARDcy;": "\u042A",
  "&Hacek;": "\u02C7",
  "&Hat;": "^",
  "&Hcirc;": "\u0124",
  "&Hfr;": "\u210C",
  "&HilbertSpace;": "\u210B",
  "&Hopf;": "\u210D",
  "&HorizontalLine;": "\u2500",
  "&Hscr;": "\u210B",
  "&Hstrok;": "\u0126",
  "&HumpDownHump;": "\u224E",
  "&HumpEqual;": "\u224F",
  "&IEcy;": "\u0415",
  "&IJlig;": "\u0132",
  "&IOcy;": "\u0401",
  "&Iacute": "\xCD",
  "&Iacute;": "\xCD",
  "&Icirc": "\xCE",
  "&Icirc;": "\xCE",
  "&Icy;": "\u0418",
  "&Idot;": "\u0130",
  "&Ifr;": "\u2111",
  "&Igrave": "\xCC",
  "&Igrave;": "\xCC",
  "&Im;": "\u2111",
  "&Imacr;": "\u012A",
  "&ImaginaryI;": "\u2148",
  "&Implies;": "\u21D2",
  "&Int;": "\u222C",
  "&Integral;": "\u222B",
  "&Intersection;": "\u22C2",
  "&InvisibleComma;": "\u2063",
  "&InvisibleTimes;": "\u2062",
  "&Iogon;": "\u012E",
  "&Iopf;": "\u{1D540}",
  "&Iota;": "\u0399",
  "&Iscr;": "\u2110",
  "&Itilde;": "\u0128",
  "&Iukcy;": "\u0406",
  "&Iuml": "\xCF",
  "&Iuml;": "\xCF",
  "&Jcirc;": "\u0134",
  "&Jcy;": "\u0419",
  "&Jfr;": "\u{1D50D}",
  "&Jopf;": "\u{1D541}",
  "&Jscr;": "\u{1D4A5}",
  "&Jsercy;": "\u0408",
  "&Jukcy;": "\u0404",
  "&KHcy;": "\u0425",
  "&KJcy;": "\u040C",
  "&Kappa;": "\u039A",
  "&Kcedil;": "\u0136",
  "&Kcy;": "\u041A",
  "&Kfr;": "\u{1D50E}",
  "&Kopf;": "\u{1D542}",
  "&Kscr;": "\u{1D4A6}",
  "&LJcy;": "\u0409",
  "&LT": "<",
  "&LT;": "<",
  "&Lacute;": "\u0139",
  "&Lambda;": "\u039B",
  "&Lang;": "\u27EA",
  "&Laplacetrf;": "\u2112",
  "&Larr;": "\u219E",
  "&Lcaron;": "\u013D",
  "&Lcedil;": "\u013B",
  "&Lcy;": "\u041B",
  "&LeftAngleBracket;": "\u27E8",
  "&LeftArrow;": "\u2190",
  "&LeftArrowBar;": "\u21E4",
  "&LeftArrowRightArrow;": "\u21C6",
  "&LeftCeiling;": "\u2308",
  "&LeftDoubleBracket;": "\u27E6",
  "&LeftDownTeeVector;": "\u2961",
  "&LeftDownVector;": "\u21C3",
  "&LeftDownVectorBar;": "\u2959",
  "&LeftFloor;": "\u230A",
  "&LeftRightArrow;": "\u2194",
  "&LeftRightVector;": "\u294E",
  "&LeftTee;": "\u22A3",
  "&LeftTeeArrow;": "\u21A4",
  "&LeftTeeVector;": "\u295A",
  "&LeftTriangle;": "\u22B2",
  "&LeftTriangleBar;": "\u29CF",
  "&LeftTriangleEqual;": "\u22B4",
  "&LeftUpDownVector;": "\u2951",
  "&LeftUpTeeVector;": "\u2960",
  "&LeftUpVector;": "\u21BF",
  "&LeftUpVectorBar;": "\u2958",
  "&LeftVector;": "\u21BC",
  "&LeftVectorBar;": "\u2952",
  "&Leftarrow;": "\u21D0",
  "&Leftrightarrow;": "\u21D4",
  "&LessEqualGreater;": "\u22DA",
  "&LessFullEqual;": "\u2266",
  "&LessGreater;": "\u2276",
  "&LessLess;": "\u2AA1",
  "&LessSlantEqual;": "\u2A7D",
  "&LessTilde;": "\u2272",
  "&Lfr;": "\u{1D50F}",
  "&Ll;": "\u22D8",
  "&Lleftarrow;": "\u21DA",
  "&Lmidot;": "\u013F",
  "&LongLeftArrow;": "\u27F5",
  "&LongLeftRightArrow;": "\u27F7",
  "&LongRightArrow;": "\u27F6",
  "&Longleftarrow;": "\u27F8",
  "&Longleftrightarrow;": "\u27FA",
  "&Longrightarrow;": "\u27F9",
  "&Lopf;": "\u{1D543}",
  "&LowerLeftArrow;": "\u2199",
  "&LowerRightArrow;": "\u2198",
  "&Lscr;": "\u2112",
  "&Lsh;": "\u21B0",
  "&Lstrok;": "\u0141",
  "&Lt;": "\u226A",
  "&Map;": "\u2905",
  "&Mcy;": "\u041C",
  "&MediumSpace;": "\u205F",
  "&Mellintrf;": "\u2133",
  "&Mfr;": "\u{1D510}",
  "&MinusPlus;": "\u2213",
  "&Mopf;": "\u{1D544}",
  "&Mscr;": "\u2133",
  "&Mu;": "\u039C",
  "&NJcy;": "\u040A",
  "&Nacute;": "\u0143",
  "&Ncaron;": "\u0147",
  "&Ncedil;": "\u0145",
  "&Ncy;": "\u041D",
  "&NegativeMediumSpace;": "\u200B",
  "&NegativeThickSpace;": "\u200B",
  "&NegativeThinSpace;": "\u200B",
  "&NegativeVeryThinSpace;": "\u200B",
  "&NestedGreaterGreater;": "\u226B",
  "&NestedLessLess;": "\u226A",
  "&NewLine;": "\n",
  "&Nfr;": "\u{1D511}",
  "&NoBreak;": "\u2060",
  "&NonBreakingSpace;": "\xA0",
  "&Nopf;": "\u2115",
  "&Not;": "\u2AEC",
  "&NotCongruent;": "\u2262",
  "&NotCupCap;": "\u226D",
  "&NotDoubleVerticalBar;": "\u2226",
  "&NotElement;": "\u2209",
  "&NotEqual;": "\u2260",
  "&NotEqualTilde;": "\u2242\u0338",
  "&NotExists;": "\u2204",
  "&NotGreater;": "\u226F",
  "&NotGreaterEqual;": "\u2271",
  "&NotGreaterFullEqual;": "\u2267\u0338",
  "&NotGreaterGreater;": "\u226B\u0338",
  "&NotGreaterLess;": "\u2279",
  "&NotGreaterSlantEqual;": "\u2A7E\u0338",
  "&NotGreaterTilde;": "\u2275",
  "&NotHumpDownHump;": "\u224E\u0338",
  "&NotHumpEqual;": "\u224F\u0338",
  "&NotLeftTriangle;": "\u22EA",
  "&NotLeftTriangleBar;": "\u29CF\u0338",
  "&NotLeftTriangleEqual;": "\u22EC",
  "&NotLess;": "\u226E",
  "&NotLessEqual;": "\u2270",
  "&NotLessGreater;": "\u2278",
  "&NotLessLess;": "\u226A\u0338",
  "&NotLessSlantEqual;": "\u2A7D\u0338",
  "&NotLessTilde;": "\u2274",
  "&NotNestedGreaterGreater;": "\u2AA2\u0338",
  "&NotNestedLessLess;": "\u2AA1\u0338",
  "&NotPrecedes;": "\u2280",
  "&NotPrecedesEqual;": "\u2AAF\u0338",
  "&NotPrecedesSlantEqual;": "\u22E0",
  "&NotReverseElement;": "\u220C",
  "&NotRightTriangle;": "\u22EB",
  "&NotRightTriangleBar;": "\u29D0\u0338",
  "&NotRightTriangleEqual;": "\u22ED",
  "&NotSquareSubset;": "\u228F\u0338",
  "&NotSquareSubsetEqual;": "\u22E2",
  "&NotSquareSuperset;": "\u2290\u0338",
  "&NotSquareSupersetEqual;": "\u22E3",
  "&NotSubset;": "\u2282\u20D2",
  "&NotSubsetEqual;": "\u2288",
  "&NotSucceeds;": "\u2281",
  "&NotSucceedsEqual;": "\u2AB0\u0338",
  "&NotSucceedsSlantEqual;": "\u22E1",
  "&NotSucceedsTilde;": "\u227F\u0338",
  "&NotSuperset;": "\u2283\u20D2",
  "&NotSupersetEqual;": "\u2289",
  "&NotTilde;": "\u2241",
  "&NotTildeEqual;": "\u2244",
  "&NotTildeFullEqual;": "\u2247",
  "&NotTildeTilde;": "\u2249",
  "&NotVerticalBar;": "\u2224",
  "&Nscr;": "\u{1D4A9}",
  "&Ntilde": "\xD1",
  "&Ntilde;": "\xD1",
  "&Nu;": "\u039D",
  "&OElig;": "\u0152",
  "&Oacute": "\xD3",
  "&Oacute;": "\xD3",
  "&Ocirc": "\xD4",
  "&Ocirc;": "\xD4",
  "&Ocy;": "\u041E",
  "&Odblac;": "\u0150",
  "&Ofr;": "\u{1D512}",
  "&Ograve": "\xD2",
  "&Ograve;": "\xD2",
  "&Omacr;": "\u014C",
  "&Omega;": "\u03A9",
  "&Omicron;": "\u039F",
  "&Oopf;": "\u{1D546}",
  "&OpenCurlyDoubleQuote;": "\u201C",
  "&OpenCurlyQuote;": "\u2018",
  "&Or;": "\u2A54",
  "&Oscr;": "\u{1D4AA}",
  "&Oslash": "\xD8",
  "&Oslash;": "\xD8",
  "&Otilde": "\xD5",
  "&Otilde;": "\xD5",
  "&Otimes;": "\u2A37",
  "&Ouml": "\xD6",
  "&Ouml;": "\xD6",
  "&OverBar;": "\u203E",
  "&OverBrace;": "\u23DE",
  "&OverBracket;": "\u23B4",
  "&OverParenthesis;": "\u23DC",
  "&PartialD;": "\u2202",
  "&Pcy;": "\u041F",
  "&Pfr;": "\u{1D513}",
  "&Phi;": "\u03A6",
  "&Pi;": "\u03A0",
  "&PlusMinus;": "\xB1",
  "&Poincareplane;": "\u210C",
  "&Popf;": "\u2119",
  "&Pr;": "\u2ABB",
  "&Precedes;": "\u227A",
  "&PrecedesEqual;": "\u2AAF",
  "&PrecedesSlantEqual;": "\u227C",
  "&PrecedesTilde;": "\u227E",
  "&Prime;": "\u2033",
  "&Product;": "\u220F",
  "&Proportion;": "\u2237",
  "&Proportional;": "\u221D",
  "&Pscr;": "\u{1D4AB}",
  "&Psi;": "\u03A8",
  "&QUOT": '"',
  "&QUOT;": '"',
  "&Qfr;": "\u{1D514}",
  "&Qopf;": "\u211A",
  "&Qscr;": "\u{1D4AC}",
  "&RBarr;": "\u2910",
  "&REG": "\xAE",
  "&REG;": "\xAE",
  "&Racute;": "\u0154",
  "&Rang;": "\u27EB",
  "&Rarr;": "\u21A0",
  "&Rarrtl;": "\u2916",
  "&Rcaron;": "\u0158",
  "&Rcedil;": "\u0156",
  "&Rcy;": "\u0420",
  "&Re;": "\u211C",
  "&ReverseElement;": "\u220B",
  "&ReverseEquilibrium;": "\u21CB",
  "&ReverseUpEquilibrium;": "\u296F",
  "&Rfr;": "\u211C",
  "&Rho;": "\u03A1",
  "&RightAngleBracket;": "\u27E9",
  "&RightArrow;": "\u2192",
  "&RightArrowBar;": "\u21E5",
  "&RightArrowLeftArrow;": "\u21C4",
  "&RightCeiling;": "\u2309",
  "&RightDoubleBracket;": "\u27E7",
  "&RightDownTeeVector;": "\u295D",
  "&RightDownVector;": "\u21C2",
  "&RightDownVectorBar;": "\u2955",
  "&RightFloor;": "\u230B",
  "&RightTee;": "\u22A2",
  "&RightTeeArrow;": "\u21A6",
  "&RightTeeVector;": "\u295B",
  "&RightTriangle;": "\u22B3",
  "&RightTriangleBar;": "\u29D0",
  "&RightTriangleEqual;": "\u22B5",
  "&RightUpDownVector;": "\u294F",
  "&RightUpTeeVector;": "\u295C",
  "&RightUpVector;": "\u21BE",
  "&RightUpVectorBar;": "\u2954",
  "&RightVector;": "\u21C0",
  "&RightVectorBar;": "\u2953",
  "&Rightarrow;": "\u21D2",
  "&Ropf;": "\u211D",
  "&RoundImplies;": "\u2970",
  "&Rrightarrow;": "\u21DB",
  "&Rscr;": "\u211B",
  "&Rsh;": "\u21B1",
  "&RuleDelayed;": "\u29F4",
  "&SHCHcy;": "\u0429",
  "&SHcy;": "\u0428",
  "&SOFTcy;": "\u042C",
  "&Sacute;": "\u015A",
  "&Sc;": "\u2ABC",
  "&Scaron;": "\u0160",
  "&Scedil;": "\u015E",
  "&Scirc;": "\u015C",
  "&Scy;": "\u0421",
  "&Sfr;": "\u{1D516}",
  "&ShortDownArrow;": "\u2193",
  "&ShortLeftArrow;": "\u2190",
  "&ShortRightArrow;": "\u2192",
  "&ShortUpArrow;": "\u2191",
  "&Sigma;": "\u03A3",
  "&SmallCircle;": "\u2218",
  "&Sopf;": "\u{1D54A}",
  "&Sqrt;": "\u221A",
  "&Square;": "\u25A1",
  "&SquareIntersection;": "\u2293",
  "&SquareSubset;": "\u228F",
  "&SquareSubsetEqual;": "\u2291",
  "&SquareSuperset;": "\u2290",
  "&SquareSupersetEqual;": "\u2292",
  "&SquareUnion;": "\u2294",
  "&Sscr;": "\u{1D4AE}",
  "&Star;": "\u22C6",
  "&Sub;": "\u22D0",
  "&Subset;": "\u22D0",
  "&SubsetEqual;": "\u2286",
  "&Succeeds;": "\u227B",
  "&SucceedsEqual;": "\u2AB0",
  "&SucceedsSlantEqual;": "\u227D",
  "&SucceedsTilde;": "\u227F",
  "&SuchThat;": "\u220B",
  "&Sum;": "\u2211",
  "&Sup;": "\u22D1",
  "&Superset;": "\u2283",
  "&SupersetEqual;": "\u2287",
  "&Supset;": "\u22D1",
  "&THORN": "\xDE",
  "&THORN;": "\xDE",
  "&TRADE;": "\u2122",
  "&TSHcy;": "\u040B",
  "&TScy;": "\u0426",
  "&Tab;": "	",
  "&Tau;": "\u03A4",
  "&Tcaron;": "\u0164",
  "&Tcedil;": "\u0162",
  "&Tcy;": "\u0422",
  "&Tfr;": "\u{1D517}",
  "&Therefore;": "\u2234",
  "&Theta;": "\u0398",
  "&ThickSpace;": "\u205F\u200A",
  "&ThinSpace;": "\u2009",
  "&Tilde;": "\u223C",
  "&TildeEqual;": "\u2243",
  "&TildeFullEqual;": "\u2245",
  "&TildeTilde;": "\u2248",
  "&Topf;": "\u{1D54B}",
  "&TripleDot;": "\u20DB",
  "&Tscr;": "\u{1D4AF}",
  "&Tstrok;": "\u0166",
  "&Uacute": "\xDA",
  "&Uacute;": "\xDA",
  "&Uarr;": "\u219F",
  "&Uarrocir;": "\u2949",
  "&Ubrcy;": "\u040E",
  "&Ubreve;": "\u016C",
  "&Ucirc": "\xDB",
  "&Ucirc;": "\xDB",
  "&Ucy;": "\u0423",
  "&Udblac;": "\u0170",
  "&Ufr;": "\u{1D518}",
  "&Ugrave": "\xD9",
  "&Ugrave;": "\xD9",
  "&Umacr;": "\u016A",
  "&UnderBar;": "_",
  "&UnderBrace;": "\u23DF",
  "&UnderBracket;": "\u23B5",
  "&UnderParenthesis;": "\u23DD",
  "&Union;": "\u22C3",
  "&UnionPlus;": "\u228E",
  "&Uogon;": "\u0172",
  "&Uopf;": "\u{1D54C}",
  "&UpArrow;": "\u2191",
  "&UpArrowBar;": "\u2912",
  "&UpArrowDownArrow;": "\u21C5",
  "&UpDownArrow;": "\u2195",
  "&UpEquilibrium;": "\u296E",
  "&UpTee;": "\u22A5",
  "&UpTeeArrow;": "\u21A5",
  "&Uparrow;": "\u21D1",
  "&Updownarrow;": "\u21D5",
  "&UpperLeftArrow;": "\u2196",
  "&UpperRightArrow;": "\u2197",
  "&Upsi;": "\u03D2",
  "&Upsilon;": "\u03A5",
  "&Uring;": "\u016E",
  "&Uscr;": "\u{1D4B0}",
  "&Utilde;": "\u0168",
  "&Uuml": "\xDC",
  "&Uuml;": "\xDC",
  "&VDash;": "\u22AB",
  "&Vbar;": "\u2AEB",
  "&Vcy;": "\u0412",
  "&Vdash;": "\u22A9",
  "&Vdashl;": "\u2AE6",
  "&Vee;": "\u22C1",
  "&Verbar;": "\u2016",
  "&Vert;": "\u2016",
  "&VerticalBar;": "\u2223",
  "&VerticalLine;": "|",
  "&VerticalSeparator;": "\u2758",
  "&VerticalTilde;": "\u2240",
  "&VeryThinSpace;": "\u200A",
  "&Vfr;": "\u{1D519}",
  "&Vopf;": "\u{1D54D}",
  "&Vscr;": "\u{1D4B1}",
  "&Vvdash;": "\u22AA",
  "&Wcirc;": "\u0174",
  "&Wedge;": "\u22C0",
  "&Wfr;": "\u{1D51A}",
  "&Wopf;": "\u{1D54E}",
  "&Wscr;": "\u{1D4B2}",
  "&Xfr;": "\u{1D51B}",
  "&Xi;": "\u039E",
  "&Xopf;": "\u{1D54F}",
  "&Xscr;": "\u{1D4B3}",
  "&YAcy;": "\u042F",
  "&YIcy;": "\u0407",
  "&YUcy;": "\u042E",
  "&Yacute": "\xDD",
  "&Yacute;": "\xDD",
  "&Ycirc;": "\u0176",
  "&Ycy;": "\u042B",
  "&Yfr;": "\u{1D51C}",
  "&Yopf;": "\u{1D550}",
  "&Yscr;": "\u{1D4B4}",
  "&Yuml;": "\u0178",
  "&ZHcy;": "\u0416",
  "&Zacute;": "\u0179",
  "&Zcaron;": "\u017D",
  "&Zcy;": "\u0417",
  "&Zdot;": "\u017B",
  "&ZeroWidthSpace;": "\u200B",
  "&Zeta;": "\u0396",
  "&Zfr;": "\u2128",
  "&Zopf;": "\u2124",
  "&Zscr;": "\u{1D4B5}",
  "&aacute": "\xE1",
  "&aacute;": "\xE1",
  "&abreve;": "\u0103",
  "&ac;": "\u223E",
  "&acE;": "\u223E\u0333",
  "&acd;": "\u223F",
  "&acirc": "\xE2",
  "&acirc;": "\xE2",
  "&acute": "\xB4",
  "&acute;": "\xB4",
  "&acy;": "\u0430",
  "&aelig": "\xE6",
  "&aelig;": "\xE6",
  "&af;": "\u2061",
  "&afr;": "\u{1D51E}",
  "&agrave": "\xE0",
  "&agrave;": "\xE0",
  "&alefsym;": "\u2135",
  "&aleph;": "\u2135",
  "&alpha;": "\u03B1",
  "&amacr;": "\u0101",
  "&amalg;": "\u2A3F",
  "&amp": "&",
  "&amp;": "&",
  "&and;": "\u2227",
  "&andand;": "\u2A55",
  "&andd;": "\u2A5C",
  "&andslope;": "\u2A58",
  "&andv;": "\u2A5A",
  "&ang;": "\u2220",
  "&ange;": "\u29A4",
  "&angle;": "\u2220",
  "&angmsd;": "\u2221",
  "&angmsdaa;": "\u29A8",
  "&angmsdab;": "\u29A9",
  "&angmsdac;": "\u29AA",
  "&angmsdad;": "\u29AB",
  "&angmsdae;": "\u29AC",
  "&angmsdaf;": "\u29AD",
  "&angmsdag;": "\u29AE",
  "&angmsdah;": "\u29AF",
  "&angrt;": "\u221F",
  "&angrtvb;": "\u22BE",
  "&angrtvbd;": "\u299D",
  "&angsph;": "\u2222",
  "&angst;": "\xC5",
  "&angzarr;": "\u237C",
  "&aogon;": "\u0105",
  "&aopf;": "\u{1D552}",
  "&ap;": "\u2248",
  "&apE;": "\u2A70",
  "&apacir;": "\u2A6F",
  "&ape;": "\u224A",
  "&apid;": "\u224B",
  "&apos;": "'",
  "&approx;": "\u2248",
  "&approxeq;": "\u224A",
  "&aring": "\xE5",
  "&aring;": "\xE5",
  "&ascr;": "\u{1D4B6}",
  "&ast;": "*",
  "&asymp;": "\u2248",
  "&asympeq;": "\u224D",
  "&atilde": "\xE3",
  "&atilde;": "\xE3",
  "&auml": "\xE4",
  "&auml;": "\xE4",
  "&awconint;": "\u2233",
  "&awint;": "\u2A11",
  "&bNot;": "\u2AED",
  "&backcong;": "\u224C",
  "&backepsilon;": "\u03F6",
  "&backprime;": "\u2035",
  "&backsim;": "\u223D",
  "&backsimeq;": "\u22CD",
  "&barvee;": "\u22BD",
  "&barwed;": "\u2305",
  "&barwedge;": "\u2305",
  "&bbrk;": "\u23B5",
  "&bbrktbrk;": "\u23B6",
  "&bcong;": "\u224C",
  "&bcy;": "\u0431",
  "&bdquo;": "\u201E",
  "&becaus;": "\u2235",
  "&because;": "\u2235",
  "&bemptyv;": "\u29B0",
  "&bepsi;": "\u03F6",
  "&bernou;": "\u212C",
  "&beta;": "\u03B2",
  "&beth;": "\u2136",
  "&between;": "\u226C",
  "&bfr;": "\u{1D51F}",
  "&bigcap;": "\u22C2",
  "&bigcirc;": "\u25EF",
  "&bigcup;": "\u22C3",
  "&bigodot;": "\u2A00",
  "&bigoplus;": "\u2A01",
  "&bigotimes;": "\u2A02",
  "&bigsqcup;": "\u2A06",
  "&bigstar;": "\u2605",
  "&bigtriangledown;": "\u25BD",
  "&bigtriangleup;": "\u25B3",
  "&biguplus;": "\u2A04",
  "&bigvee;": "\u22C1",
  "&bigwedge;": "\u22C0",
  "&bkarow;": "\u290D",
  "&blacklozenge;": "\u29EB",
  "&blacksquare;": "\u25AA",
  "&blacktriangle;": "\u25B4",
  "&blacktriangledown;": "\u25BE",
  "&blacktriangleleft;": "\u25C2",
  "&blacktriangleright;": "\u25B8",
  "&blank;": "\u2423",
  "&blk12;": "\u2592",
  "&blk14;": "\u2591",
  "&blk34;": "\u2593",
  "&block;": "\u2588",
  "&bne;": "=\u20E5",
  "&bnequiv;": "\u2261\u20E5",
  "&bnot;": "\u2310",
  "&bopf;": "\u{1D553}",
  "&bot;": "\u22A5",
  "&bottom;": "\u22A5",
  "&bowtie;": "\u22C8",
  "&boxDL;": "\u2557",
  "&boxDR;": "\u2554",
  "&boxDl;": "\u2556",
  "&boxDr;": "\u2553",
  "&boxH;": "\u2550",
  "&boxHD;": "\u2566",
  "&boxHU;": "\u2569",
  "&boxHd;": "\u2564",
  "&boxHu;": "\u2567",
  "&boxUL;": "\u255D",
  "&boxUR;": "\u255A",
  "&boxUl;": "\u255C",
  "&boxUr;": "\u2559",
  "&boxV;": "\u2551",
  "&boxVH;": "\u256C",
  "&boxVL;": "\u2563",
  "&boxVR;": "\u2560",
  "&boxVh;": "\u256B",
  "&boxVl;": "\u2562",
  "&boxVr;": "\u255F",
  "&boxbox;": "\u29C9",
  "&boxdL;": "\u2555",
  "&boxdR;": "\u2552",
  "&boxdl;": "\u2510",
  "&boxdr;": "\u250C",
  "&boxh;": "\u2500",
  "&boxhD;": "\u2565",
  "&boxhU;": "\u2568",
  "&boxhd;": "\u252C",
  "&boxhu;": "\u2534",
  "&boxminus;": "\u229F",
  "&boxplus;": "\u229E",
  "&boxtimes;": "\u22A0",
  "&boxuL;": "\u255B",
  "&boxuR;": "\u2558",
  "&boxul;": "\u2518",
  "&boxur;": "\u2514",
  "&boxv;": "\u2502",
  "&boxvH;": "\u256A",
  "&boxvL;": "\u2561",
  "&boxvR;": "\u255E",
  "&boxvh;": "\u253C",
  "&boxvl;": "\u2524",
  "&boxvr;": "\u251C",
  "&bprime;": "\u2035",
  "&breve;": "\u02D8",
  "&brvbar": "\xA6",
  "&brvbar;": "\xA6",
  "&bscr;": "\u{1D4B7}",
  "&bsemi;": "\u204F",
  "&bsim;": "\u223D",
  "&bsime;": "\u22CD",
  "&bsol;": "\\",
  "&bsolb;": "\u29C5",
  "&bsolhsub;": "\u27C8",
  "&bull;": "\u2022",
  "&bullet;": "\u2022",
  "&bump;": "\u224E",
  "&bumpE;": "\u2AAE",
  "&bumpe;": "\u224F",
  "&bumpeq;": "\u224F",
  "&cacute;": "\u0107",
  "&cap;": "\u2229",
  "&capand;": "\u2A44",
  "&capbrcup;": "\u2A49",
  "&capcap;": "\u2A4B",
  "&capcup;": "\u2A47",
  "&capdot;": "\u2A40",
  "&caps;": "\u2229\uFE00",
  "&caret;": "\u2041",
  "&caron;": "\u02C7",
  "&ccaps;": "\u2A4D",
  "&ccaron;": "\u010D",
  "&ccedil": "\xE7",
  "&ccedil;": "\xE7",
  "&ccirc;": "\u0109",
  "&ccups;": "\u2A4C",
  "&ccupssm;": "\u2A50",
  "&cdot;": "\u010B",
  "&cedil": "\xB8",
  "&cedil;": "\xB8",
  "&cemptyv;": "\u29B2",
  "&cent": "\xA2",
  "&cent;": "\xA2",
  "&centerdot;": "\xB7",
  "&cfr;": "\u{1D520}",
  "&chcy;": "\u0447",
  "&check;": "\u2713",
  "&checkmark;": "\u2713",
  "&chi;": "\u03C7",
  "&cir;": "\u25CB",
  "&cirE;": "\u29C3",
  "&circ;": "\u02C6",
  "&circeq;": "\u2257",
  "&circlearrowleft;": "\u21BA",
  "&circlearrowright;": "\u21BB",
  "&circledR;": "\xAE",
  "&circledS;": "\u24C8",
  "&circledast;": "\u229B",
  "&circledcirc;": "\u229A",
  "&circleddash;": "\u229D",
  "&cire;": "\u2257",
  "&cirfnint;": "\u2A10",
  "&cirmid;": "\u2AEF",
  "&cirscir;": "\u29C2",
  "&clubs;": "\u2663",
  "&clubsuit;": "\u2663",
  "&colon;": ":",
  "&colone;": "\u2254",
  "&coloneq;": "\u2254",
  "&comma;": ",",
  "&commat;": "@",
  "&comp;": "\u2201",
  "&compfn;": "\u2218",
  "&complement;": "\u2201",
  "&complexes;": "\u2102",
  "&cong;": "\u2245",
  "&congdot;": "\u2A6D",
  "&conint;": "\u222E",
  "&copf;": "\u{1D554}",
  "&coprod;": "\u2210",
  "&copy": "\xA9",
  "&copy;": "\xA9",
  "&copysr;": "\u2117",
  "&crarr;": "\u21B5",
  "&cross;": "\u2717",
  "&cscr;": "\u{1D4B8}",
  "&csub;": "\u2ACF",
  "&csube;": "\u2AD1",
  "&csup;": "\u2AD0",
  "&csupe;": "\u2AD2",
  "&ctdot;": "\u22EF",
  "&cudarrl;": "\u2938",
  "&cudarrr;": "\u2935",
  "&cuepr;": "\u22DE",
  "&cuesc;": "\u22DF",
  "&cularr;": "\u21B6",
  "&cularrp;": "\u293D",
  "&cup;": "\u222A",
  "&cupbrcap;": "\u2A48",
  "&cupcap;": "\u2A46",
  "&cupcup;": "\u2A4A",
  "&cupdot;": "\u228D",
  "&cupor;": "\u2A45",
  "&cups;": "\u222A\uFE00",
  "&curarr;": "\u21B7",
  "&curarrm;": "\u293C",
  "&curlyeqprec;": "\u22DE",
  "&curlyeqsucc;": "\u22DF",
  "&curlyvee;": "\u22CE",
  "&curlywedge;": "\u22CF",
  "&curren": "\xA4",
  "&curren;": "\xA4",
  "&curvearrowleft;": "\u21B6",
  "&curvearrowright;": "\u21B7",
  "&cuvee;": "\u22CE",
  "&cuwed;": "\u22CF",
  "&cwconint;": "\u2232",
  "&cwint;": "\u2231",
  "&cylcty;": "\u232D",
  "&dArr;": "\u21D3",
  "&dHar;": "\u2965",
  "&dagger;": "\u2020",
  "&daleth;": "\u2138",
  "&darr;": "\u2193",
  "&dash;": "\u2010",
  "&dashv;": "\u22A3",
  "&dbkarow;": "\u290F",
  "&dblac;": "\u02DD",
  "&dcaron;": "\u010F",
  "&dcy;": "\u0434",
  "&dd;": "\u2146",
  "&ddagger;": "\u2021",
  "&ddarr;": "\u21CA",
  "&ddotseq;": "\u2A77",
  "&deg": "\xB0",
  "&deg;": "\xB0",
  "&delta;": "\u03B4",
  "&demptyv;": "\u29B1",
  "&dfisht;": "\u297F",
  "&dfr;": "\u{1D521}",
  "&dharl;": "\u21C3",
  "&dharr;": "\u21C2",
  "&diam;": "\u22C4",
  "&diamond;": "\u22C4",
  "&diamondsuit;": "\u2666",
  "&diams;": "\u2666",
  "&die;": "\xA8",
  "&digamma;": "\u03DD",
  "&disin;": "\u22F2",
  "&div;": "\xF7",
  "&divide": "\xF7",
  "&divide;": "\xF7",
  "&divideontimes;": "\u22C7",
  "&divonx;": "\u22C7",
  "&djcy;": "\u0452",
  "&dlcorn;": "\u231E",
  "&dlcrop;": "\u230D",
  "&dollar;": "$",
  "&dopf;": "\u{1D555}",
  "&dot;": "\u02D9",
  "&doteq;": "\u2250",
  "&doteqdot;": "\u2251",
  "&dotminus;": "\u2238",
  "&dotplus;": "\u2214",
  "&dotsquare;": "\u22A1",
  "&doublebarwedge;": "\u2306",
  "&downarrow;": "\u2193",
  "&downdownarrows;": "\u21CA",
  "&downharpoonleft;": "\u21C3",
  "&downharpoonright;": "\u21C2",
  "&drbkarow;": "\u2910",
  "&drcorn;": "\u231F",
  "&drcrop;": "\u230C",
  "&dscr;": "\u{1D4B9}",
  "&dscy;": "\u0455",
  "&dsol;": "\u29F6",
  "&dstrok;": "\u0111",
  "&dtdot;": "\u22F1",
  "&dtri;": "\u25BF",
  "&dtrif;": "\u25BE",
  "&duarr;": "\u21F5",
  "&duhar;": "\u296F",
  "&dwangle;": "\u29A6",
  "&dzcy;": "\u045F",
  "&dzigrarr;": "\u27FF",
  "&eDDot;": "\u2A77",
  "&eDot;": "\u2251",
  "&eacute": "\xE9",
  "&eacute;": "\xE9",
  "&easter;": "\u2A6E",
  "&ecaron;": "\u011B",
  "&ecir;": "\u2256",
  "&ecirc": "\xEA",
  "&ecirc;": "\xEA",
  "&ecolon;": "\u2255",
  "&ecy;": "\u044D",
  "&edot;": "\u0117",
  "&ee;": "\u2147",
  "&efDot;": "\u2252",
  "&efr;": "\u{1D522}",
  "&eg;": "\u2A9A",
  "&egrave": "\xE8",
  "&egrave;": "\xE8",
  "&egs;": "\u2A96",
  "&egsdot;": "\u2A98",
  "&el;": "\u2A99",
  "&elinters;": "\u23E7",
  "&ell;": "\u2113",
  "&els;": "\u2A95",
  "&elsdot;": "\u2A97",
  "&emacr;": "\u0113",
  "&empty;": "\u2205",
  "&emptyset;": "\u2205",
  "&emptyv;": "\u2205",
  "&emsp13;": "\u2004",
  "&emsp14;": "\u2005",
  "&emsp;": "\u2003",
  "&eng;": "\u014B",
  "&ensp;": "\u2002",
  "&eogon;": "\u0119",
  "&eopf;": "\u{1D556}",
  "&epar;": "\u22D5",
  "&eparsl;": "\u29E3",
  "&eplus;": "\u2A71",
  "&epsi;": "\u03B5",
  "&epsilon;": "\u03B5",
  "&epsiv;": "\u03F5",
  "&eqcirc;": "\u2256",
  "&eqcolon;": "\u2255",
  "&eqsim;": "\u2242",
  "&eqslantgtr;": "\u2A96",
  "&eqslantless;": "\u2A95",
  "&equals;": "=",
  "&equest;": "\u225F",
  "&equiv;": "\u2261",
  "&equivDD;": "\u2A78",
  "&eqvparsl;": "\u29E5",
  "&erDot;": "\u2253",
  "&erarr;": "\u2971",
  "&escr;": "\u212F",
  "&esdot;": "\u2250",
  "&esim;": "\u2242",
  "&eta;": "\u03B7",
  "&eth": "\xF0",
  "&eth;": "\xF0",
  "&euml": "\xEB",
  "&euml;": "\xEB",
  "&euro;": "\u20AC",
  "&excl;": "!",
  "&exist;": "\u2203",
  "&expectation;": "\u2130",
  "&exponentiale;": "\u2147",
  "&fallingdotseq;": "\u2252",
  "&fcy;": "\u0444",
  "&female;": "\u2640",
  "&ffilig;": "\uFB03",
  "&fflig;": "\uFB00",
  "&ffllig;": "\uFB04",
  "&ffr;": "\u{1D523}",
  "&filig;": "\uFB01",
  "&fjlig;": "fj",
  "&flat;": "\u266D",
  "&fllig;": "\uFB02",
  "&fltns;": "\u25B1",
  "&fnof;": "\u0192",
  "&fopf;": "\u{1D557}",
  "&forall;": "\u2200",
  "&fork;": "\u22D4",
  "&forkv;": "\u2AD9",
  "&fpartint;": "\u2A0D",
  "&frac12": "\xBD",
  "&frac12;": "\xBD",
  "&frac13;": "\u2153",
  "&frac14": "\xBC",
  "&frac14;": "\xBC",
  "&frac15;": "\u2155",
  "&frac16;": "\u2159",
  "&frac18;": "\u215B",
  "&frac23;": "\u2154",
  "&frac25;": "\u2156",
  "&frac34": "\xBE",
  "&frac34;": "\xBE",
  "&frac35;": "\u2157",
  "&frac38;": "\u215C",
  "&frac45;": "\u2158",
  "&frac56;": "\u215A",
  "&frac58;": "\u215D",
  "&frac78;": "\u215E",
  "&frasl;": "\u2044",
  "&frown;": "\u2322",
  "&fscr;": "\u{1D4BB}",
  "&gE;": "\u2267",
  "&gEl;": "\u2A8C",
  "&gacute;": "\u01F5",
  "&gamma;": "\u03B3",
  "&gammad;": "\u03DD",
  "&gap;": "\u2A86",
  "&gbreve;": "\u011F",
  "&gcirc;": "\u011D",
  "&gcy;": "\u0433",
  "&gdot;": "\u0121",
  "&ge;": "\u2265",
  "&gel;": "\u22DB",
  "&geq;": "\u2265",
  "&geqq;": "\u2267",
  "&geqslant;": "\u2A7E",
  "&ges;": "\u2A7E",
  "&gescc;": "\u2AA9",
  "&gesdot;": "\u2A80",
  "&gesdoto;": "\u2A82",
  "&gesdotol;": "\u2A84",
  "&gesl;": "\u22DB\uFE00",
  "&gesles;": "\u2A94",
  "&gfr;": "\u{1D524}",
  "&gg;": "\u226B",
  "&ggg;": "\u22D9",
  "&gimel;": "\u2137",
  "&gjcy;": "\u0453",
  "&gl;": "\u2277",
  "&glE;": "\u2A92",
  "&gla;": "\u2AA5",
  "&glj;": "\u2AA4",
  "&gnE;": "\u2269",
  "&gnap;": "\u2A8A",
  "&gnapprox;": "\u2A8A",
  "&gne;": "\u2A88",
  "&gneq;": "\u2A88",
  "&gneqq;": "\u2269",
  "&gnsim;": "\u22E7",
  "&gopf;": "\u{1D558}",
  "&grave;": "`",
  "&gscr;": "\u210A",
  "&gsim;": "\u2273",
  "&gsime;": "\u2A8E",
  "&gsiml;": "\u2A90",
  "&gt": ">",
  "&gt;": ">",
  "&gtcc;": "\u2AA7",
  "&gtcir;": "\u2A7A",
  "&gtdot;": "\u22D7",
  "&gtlPar;": "\u2995",
  "&gtquest;": "\u2A7C",
  "&gtrapprox;": "\u2A86",
  "&gtrarr;": "\u2978",
  "&gtrdot;": "\u22D7",
  "&gtreqless;": "\u22DB",
  "&gtreqqless;": "\u2A8C",
  "&gtrless;": "\u2277",
  "&gtrsim;": "\u2273",
  "&gvertneqq;": "\u2269\uFE00",
  "&gvnE;": "\u2269\uFE00",
  "&hArr;": "\u21D4",
  "&hairsp;": "\u200A",
  "&half;": "\xBD",
  "&hamilt;": "\u210B",
  "&hardcy;": "\u044A",
  "&harr;": "\u2194",
  "&harrcir;": "\u2948",
  "&harrw;": "\u21AD",
  "&hbar;": "\u210F",
  "&hcirc;": "\u0125",
  "&hearts;": "\u2665",
  "&heartsuit;": "\u2665",
  "&hellip;": "\u2026",
  "&hercon;": "\u22B9",
  "&hfr;": "\u{1D525}",
  "&hksearow;": "\u2925",
  "&hkswarow;": "\u2926",
  "&hoarr;": "\u21FF",
  "&homtht;": "\u223B",
  "&hookleftarrow;": "\u21A9",
  "&hookrightarrow;": "\u21AA",
  "&hopf;": "\u{1D559}",
  "&horbar;": "\u2015",
  "&hscr;": "\u{1D4BD}",
  "&hslash;": "\u210F",
  "&hstrok;": "\u0127",
  "&hybull;": "\u2043",
  "&hyphen;": "\u2010",
  "&iacute": "\xED",
  "&iacute;": "\xED",
  "&ic;": "\u2063",
  "&icirc": "\xEE",
  "&icirc;": "\xEE",
  "&icy;": "\u0438",
  "&iecy;": "\u0435",
  "&iexcl": "\xA1",
  "&iexcl;": "\xA1",
  "&iff;": "\u21D4",
  "&ifr;": "\u{1D526}",
  "&igrave": "\xEC",
  "&igrave;": "\xEC",
  "&ii;": "\u2148",
  "&iiiint;": "\u2A0C",
  "&iiint;": "\u222D",
  "&iinfin;": "\u29DC",
  "&iiota;": "\u2129",
  "&ijlig;": "\u0133",
  "&imacr;": "\u012B",
  "&image;": "\u2111",
  "&imagline;": "\u2110",
  "&imagpart;": "\u2111",
  "&imath;": "\u0131",
  "&imof;": "\u22B7",
  "&imped;": "\u01B5",
  "&in;": "\u2208",
  "&incare;": "\u2105",
  "&infin;": "\u221E",
  "&infintie;": "\u29DD",
  "&inodot;": "\u0131",
  "&int;": "\u222B",
  "&intcal;": "\u22BA",
  "&integers;": "\u2124",
  "&intercal;": "\u22BA",
  "&intlarhk;": "\u2A17",
  "&intprod;": "\u2A3C",
  "&iocy;": "\u0451",
  "&iogon;": "\u012F",
  "&iopf;": "\u{1D55A}",
  "&iota;": "\u03B9",
  "&iprod;": "\u2A3C",
  "&iquest": "\xBF",
  "&iquest;": "\xBF",
  "&iscr;": "\u{1D4BE}",
  "&isin;": "\u2208",
  "&isinE;": "\u22F9",
  "&isindot;": "\u22F5",
  "&isins;": "\u22F4",
  "&isinsv;": "\u22F3",
  "&isinv;": "\u2208",
  "&it;": "\u2062",
  "&itilde;": "\u0129",
  "&iukcy;": "\u0456",
  "&iuml": "\xEF",
  "&iuml;": "\xEF",
  "&jcirc;": "\u0135",
  "&jcy;": "\u0439",
  "&jfr;": "\u{1D527}",
  "&jmath;": "\u0237",
  "&jopf;": "\u{1D55B}",
  "&jscr;": "\u{1D4BF}",
  "&jsercy;": "\u0458",
  "&jukcy;": "\u0454",
  "&kappa;": "\u03BA",
  "&kappav;": "\u03F0",
  "&kcedil;": "\u0137",
  "&kcy;": "\u043A",
  "&kfr;": "\u{1D528}",
  "&kgreen;": "\u0138",
  "&khcy;": "\u0445",
  "&kjcy;": "\u045C",
  "&kopf;": "\u{1D55C}",
  "&kscr;": "\u{1D4C0}",
  "&lAarr;": "\u21DA",
  "&lArr;": "\u21D0",
  "&lAtail;": "\u291B",
  "&lBarr;": "\u290E",
  "&lE;": "\u2266",
  "&lEg;": "\u2A8B",
  "&lHar;": "\u2962",
  "&lacute;": "\u013A",
  "&laemptyv;": "\u29B4",
  "&lagran;": "\u2112",
  "&lambda;": "\u03BB",
  "&lang;": "\u27E8",
  "&langd;": "\u2991",
  "&langle;": "\u27E8",
  "&lap;": "\u2A85",
  "&laquo": "\xAB",
  "&laquo;": "\xAB",
  "&larr;": "\u2190",
  "&larrb;": "\u21E4",
  "&larrbfs;": "\u291F",
  "&larrfs;": "\u291D",
  "&larrhk;": "\u21A9",
  "&larrlp;": "\u21AB",
  "&larrpl;": "\u2939",
  "&larrsim;": "\u2973",
  "&larrtl;": "\u21A2",
  "&lat;": "\u2AAB",
  "&latail;": "\u2919",
  "&late;": "\u2AAD",
  "&lates;": "\u2AAD\uFE00",
  "&lbarr;": "\u290C",
  "&lbbrk;": "\u2772",
  "&lbrace;": "{",
  "&lbrack;": "[",
  "&lbrke;": "\u298B",
  "&lbrksld;": "\u298F",
  "&lbrkslu;": "\u298D",
  "&lcaron;": "\u013E",
  "&lcedil;": "\u013C",
  "&lceil;": "\u2308",
  "&lcub;": "{",
  "&lcy;": "\u043B",
  "&ldca;": "\u2936",
  "&ldquo;": "\u201C",
  "&ldquor;": "\u201E",
  "&ldrdhar;": "\u2967",
  "&ldrushar;": "\u294B",
  "&ldsh;": "\u21B2",
  "&le;": "\u2264",
  "&leftarrow;": "\u2190",
  "&leftarrowtail;": "\u21A2",
  "&leftharpoondown;": "\u21BD",
  "&leftharpoonup;": "\u21BC",
  "&leftleftarrows;": "\u21C7",
  "&leftrightarrow;": "\u2194",
  "&leftrightarrows;": "\u21C6",
  "&leftrightharpoons;": "\u21CB",
  "&leftrightsquigarrow;": "\u21AD",
  "&leftthreetimes;": "\u22CB",
  "&leg;": "\u22DA",
  "&leq;": "\u2264",
  "&leqq;": "\u2266",
  "&leqslant;": "\u2A7D",
  "&les;": "\u2A7D",
  "&lescc;": "\u2AA8",
  "&lesdot;": "\u2A7F",
  "&lesdoto;": "\u2A81",
  "&lesdotor;": "\u2A83",
  "&lesg;": "\u22DA\uFE00",
  "&lesges;": "\u2A93",
  "&lessapprox;": "\u2A85",
  "&lessdot;": "\u22D6",
  "&lesseqgtr;": "\u22DA",
  "&lesseqqgtr;": "\u2A8B",
  "&lessgtr;": "\u2276",
  "&lesssim;": "\u2272",
  "&lfisht;": "\u297C",
  "&lfloor;": "\u230A",
  "&lfr;": "\u{1D529}",
  "&lg;": "\u2276",
  "&lgE;": "\u2A91",
  "&lhard;": "\u21BD",
  "&lharu;": "\u21BC",
  "&lharul;": "\u296A",
  "&lhblk;": "\u2584",
  "&ljcy;": "\u0459",
  "&ll;": "\u226A",
  "&llarr;": "\u21C7",
  "&llcorner;": "\u231E",
  "&llhard;": "\u296B",
  "&lltri;": "\u25FA",
  "&lmidot;": "\u0140",
  "&lmoust;": "\u23B0",
  "&lmoustache;": "\u23B0",
  "&lnE;": "\u2268",
  "&lnap;": "\u2A89",
  "&lnapprox;": "\u2A89",
  "&lne;": "\u2A87",
  "&lneq;": "\u2A87",
  "&lneqq;": "\u2268",
  "&lnsim;": "\u22E6",
  "&loang;": "\u27EC",
  "&loarr;": "\u21FD",
  "&lobrk;": "\u27E6",
  "&longleftarrow;": "\u27F5",
  "&longleftrightarrow;": "\u27F7",
  "&longmapsto;": "\u27FC",
  "&longrightarrow;": "\u27F6",
  "&looparrowleft;": "\u21AB",
  "&looparrowright;": "\u21AC",
  "&lopar;": "\u2985",
  "&lopf;": "\u{1D55D}",
  "&loplus;": "\u2A2D",
  "&lotimes;": "\u2A34",
  "&lowast;": "\u2217",
  "&lowbar;": "_",
  "&loz;": "\u25CA",
  "&lozenge;": "\u25CA",
  "&lozf;": "\u29EB",
  "&lpar;": "(",
  "&lparlt;": "\u2993",
  "&lrarr;": "\u21C6",
  "&lrcorner;": "\u231F",
  "&lrhar;": "\u21CB",
  "&lrhard;": "\u296D",
  "&lrm;": "\u200E",
  "&lrtri;": "\u22BF",
  "&lsaquo;": "\u2039",
  "&lscr;": "\u{1D4C1}",
  "&lsh;": "\u21B0",
  "&lsim;": "\u2272",
  "&lsime;": "\u2A8D",
  "&lsimg;": "\u2A8F",
  "&lsqb;": "[",
  "&lsquo;": "\u2018",
  "&lsquor;": "\u201A",
  "&lstrok;": "\u0142",
  "&lt": "<",
  "&lt;": "<",
  "&ltcc;": "\u2AA6",
  "&ltcir;": "\u2A79",
  "&ltdot;": "\u22D6",
  "&lthree;": "\u22CB",
  "&ltimes;": "\u22C9",
  "&ltlarr;": "\u2976",
  "&ltquest;": "\u2A7B",
  "&ltrPar;": "\u2996",
  "&ltri;": "\u25C3",
  "&ltrie;": "\u22B4",
  "&ltrif;": "\u25C2",
  "&lurdshar;": "\u294A",
  "&luruhar;": "\u2966",
  "&lvertneqq;": "\u2268\uFE00",
  "&lvnE;": "\u2268\uFE00",
  "&mDDot;": "\u223A",
  "&macr": "\xAF",
  "&macr;": "\xAF",
  "&male;": "\u2642",
  "&malt;": "\u2720",
  "&maltese;": "\u2720",
  "&map;": "\u21A6",
  "&mapsto;": "\u21A6",
  "&mapstodown;": "\u21A7",
  "&mapstoleft;": "\u21A4",
  "&mapstoup;": "\u21A5",
  "&marker;": "\u25AE",
  "&mcomma;": "\u2A29",
  "&mcy;": "\u043C",
  "&mdash;": "\u2014",
  "&measuredangle;": "\u2221",
  "&mfr;": "\u{1D52A}",
  "&mho;": "\u2127",
  "&micro": "\xB5",
  "&micro;": "\xB5",
  "&mid;": "\u2223",
  "&midast;": "*",
  "&midcir;": "\u2AF0",
  "&middot": "\xB7",
  "&middot;": "\xB7",
  "&minus;": "\u2212",
  "&minusb;": "\u229F",
  "&minusd;": "\u2238",
  "&minusdu;": "\u2A2A",
  "&mlcp;": "\u2ADB",
  "&mldr;": "\u2026",
  "&mnplus;": "\u2213",
  "&models;": "\u22A7",
  "&mopf;": "\u{1D55E}",
  "&mp;": "\u2213",
  "&mscr;": "\u{1D4C2}",
  "&mstpos;": "\u223E",
  "&mu;": "\u03BC",
  "&multimap;": "\u22B8",
  "&mumap;": "\u22B8",
  "&nGg;": "\u22D9\u0338",
  "&nGt;": "\u226B\u20D2",
  "&nGtv;": "\u226B\u0338",
  "&nLeftarrow;": "\u21CD",
  "&nLeftrightarrow;": "\u21CE",
  "&nLl;": "\u22D8\u0338",
  "&nLt;": "\u226A\u20D2",
  "&nLtv;": "\u226A\u0338",
  "&nRightarrow;": "\u21CF",
  "&nVDash;": "\u22AF",
  "&nVdash;": "\u22AE",
  "&nabla;": "\u2207",
  "&nacute;": "\u0144",
  "&nang;": "\u2220\u20D2",
  "&nap;": "\u2249",
  "&napE;": "\u2A70\u0338",
  "&napid;": "\u224B\u0338",
  "&napos;": "\u0149",
  "&napprox;": "\u2249",
  "&natur;": "\u266E",
  "&natural;": "\u266E",
  "&naturals;": "\u2115",
  "&nbsp": "\xA0",
  "&nbsp;": "\xA0",
  "&nbump;": "\u224E\u0338",
  "&nbumpe;": "\u224F\u0338",
  "&ncap;": "\u2A43",
  "&ncaron;": "\u0148",
  "&ncedil;": "\u0146",
  "&ncong;": "\u2247",
  "&ncongdot;": "\u2A6D\u0338",
  "&ncup;": "\u2A42",
  "&ncy;": "\u043D",
  "&ndash;": "\u2013",
  "&ne;": "\u2260",
  "&neArr;": "\u21D7",
  "&nearhk;": "\u2924",
  "&nearr;": "\u2197",
  "&nearrow;": "\u2197",
  "&nedot;": "\u2250\u0338",
  "&nequiv;": "\u2262",
  "&nesear;": "\u2928",
  "&nesim;": "\u2242\u0338",
  "&nexist;": "\u2204",
  "&nexists;": "\u2204",
  "&nfr;": "\u{1D52B}",
  "&ngE;": "\u2267\u0338",
  "&nge;": "\u2271",
  "&ngeq;": "\u2271",
  "&ngeqq;": "\u2267\u0338",
  "&ngeqslant;": "\u2A7E\u0338",
  "&nges;": "\u2A7E\u0338",
  "&ngsim;": "\u2275",
  "&ngt;": "\u226F",
  "&ngtr;": "\u226F",
  "&nhArr;": "\u21CE",
  "&nharr;": "\u21AE",
  "&nhpar;": "\u2AF2",
  "&ni;": "\u220B",
  "&nis;": "\u22FC",
  "&nisd;": "\u22FA",
  "&niv;": "\u220B",
  "&njcy;": "\u045A",
  "&nlArr;": "\u21CD",
  "&nlE;": "\u2266\u0338",
  "&nlarr;": "\u219A",
  "&nldr;": "\u2025",
  "&nle;": "\u2270",
  "&nleftarrow;": "\u219A",
  "&nleftrightarrow;": "\u21AE",
  "&nleq;": "\u2270",
  "&nleqq;": "\u2266\u0338",
  "&nleqslant;": "\u2A7D\u0338",
  "&nles;": "\u2A7D\u0338",
  "&nless;": "\u226E",
  "&nlsim;": "\u2274",
  "&nlt;": "\u226E",
  "&nltri;": "\u22EA",
  "&nltrie;": "\u22EC",
  "&nmid;": "\u2224",
  "&nopf;": "\u{1D55F}",
  "&not": "\xAC",
  "&not;": "\xAC",
  "&notin;": "\u2209",
  "&notinE;": "\u22F9\u0338",
  "&notindot;": "\u22F5\u0338",
  "&notinva;": "\u2209",
  "&notinvb;": "\u22F7",
  "&notinvc;": "\u22F6",
  "&notni;": "\u220C",
  "&notniva;": "\u220C",
  "&notnivb;": "\u22FE",
  "&notnivc;": "\u22FD",
  "&npar;": "\u2226",
  "&nparallel;": "\u2226",
  "&nparsl;": "\u2AFD\u20E5",
  "&npart;": "\u2202\u0338",
  "&npolint;": "\u2A14",
  "&npr;": "\u2280",
  "&nprcue;": "\u22E0",
  "&npre;": "\u2AAF\u0338",
  "&nprec;": "\u2280",
  "&npreceq;": "\u2AAF\u0338",
  "&nrArr;": "\u21CF",
  "&nrarr;": "\u219B",
  "&nrarrc;": "\u2933\u0338",
  "&nrarrw;": "\u219D\u0338",
  "&nrightarrow;": "\u219B",
  "&nrtri;": "\u22EB",
  "&nrtrie;": "\u22ED",
  "&nsc;": "\u2281",
  "&nsccue;": "\u22E1",
  "&nsce;": "\u2AB0\u0338",
  "&nscr;": "\u{1D4C3}",
  "&nshortmid;": "\u2224",
  "&nshortparallel;": "\u2226",
  "&nsim;": "\u2241",
  "&nsime;": "\u2244",
  "&nsimeq;": "\u2244",
  "&nsmid;": "\u2224",
  "&nspar;": "\u2226",
  "&nsqsube;": "\u22E2",
  "&nsqsupe;": "\u22E3",
  "&nsub;": "\u2284",
  "&nsubE;": "\u2AC5\u0338",
  "&nsube;": "\u2288",
  "&nsubset;": "\u2282\u20D2",
  "&nsubseteq;": "\u2288",
  "&nsubseteqq;": "\u2AC5\u0338",
  "&nsucc;": "\u2281",
  "&nsucceq;": "\u2AB0\u0338",
  "&nsup;": "\u2285",
  "&nsupE;": "\u2AC6\u0338",
  "&nsupe;": "\u2289",
  "&nsupset;": "\u2283\u20D2",
  "&nsupseteq;": "\u2289",
  "&nsupseteqq;": "\u2AC6\u0338",
  "&ntgl;": "\u2279",
  "&ntilde": "\xF1",
  "&ntilde;": "\xF1",
  "&ntlg;": "\u2278",
  "&ntriangleleft;": "\u22EA",
  "&ntrianglelefteq;": "\u22EC",
  "&ntriangleright;": "\u22EB",
  "&ntrianglerighteq;": "\u22ED",
  "&nu;": "\u03BD",
  "&num;": "#",
  "&numero;": "\u2116",
  "&numsp;": "\u2007",
  "&nvDash;": "\u22AD",
  "&nvHarr;": "\u2904",
  "&nvap;": "\u224D\u20D2",
  "&nvdash;": "\u22AC",
  "&nvge;": "\u2265\u20D2",
  "&nvgt;": ">\u20D2",
  "&nvinfin;": "\u29DE",
  "&nvlArr;": "\u2902",
  "&nvle;": "\u2264\u20D2",
  "&nvlt;": "<\u20D2",
  "&nvltrie;": "\u22B4\u20D2",
  "&nvrArr;": "\u2903",
  "&nvrtrie;": "\u22B5\u20D2",
  "&nvsim;": "\u223C\u20D2",
  "&nwArr;": "\u21D6",
  "&nwarhk;": "\u2923",
  "&nwarr;": "\u2196",
  "&nwarrow;": "\u2196",
  "&nwnear;": "\u2927",
  "&oS;": "\u24C8",
  "&oacute": "\xF3",
  "&oacute;": "\xF3",
  "&oast;": "\u229B",
  "&ocir;": "\u229A",
  "&ocirc": "\xF4",
  "&ocirc;": "\xF4",
  "&ocy;": "\u043E",
  "&odash;": "\u229D",
  "&odblac;": "\u0151",
  "&odiv;": "\u2A38",
  "&odot;": "\u2299",
  "&odsold;": "\u29BC",
  "&oelig;": "\u0153",
  "&ofcir;": "\u29BF",
  "&ofr;": "\u{1D52C}",
  "&ogon;": "\u02DB",
  "&ograve": "\xF2",
  "&ograve;": "\xF2",
  "&ogt;": "\u29C1",
  "&ohbar;": "\u29B5",
  "&ohm;": "\u03A9",
  "&oint;": "\u222E",
  "&olarr;": "\u21BA",
  "&olcir;": "\u29BE",
  "&olcross;": "\u29BB",
  "&oline;": "\u203E",
  "&olt;": "\u29C0",
  "&omacr;": "\u014D",
  "&omega;": "\u03C9",
  "&omicron;": "\u03BF",
  "&omid;": "\u29B6",
  "&ominus;": "\u2296",
  "&oopf;": "\u{1D560}",
  "&opar;": "\u29B7",
  "&operp;": "\u29B9",
  "&oplus;": "\u2295",
  "&or;": "\u2228",
  "&orarr;": "\u21BB",
  "&ord;": "\u2A5D",
  "&order;": "\u2134",
  "&orderof;": "\u2134",
  "&ordf": "\xAA",
  "&ordf;": "\xAA",
  "&ordm": "\xBA",
  "&ordm;": "\xBA",
  "&origof;": "\u22B6",
  "&oror;": "\u2A56",
  "&orslope;": "\u2A57",
  "&orv;": "\u2A5B",
  "&oscr;": "\u2134",
  "&oslash": "\xF8",
  "&oslash;": "\xF8",
  "&osol;": "\u2298",
  "&otilde": "\xF5",
  "&otilde;": "\xF5",
  "&otimes;": "\u2297",
  "&otimesas;": "\u2A36",
  "&ouml": "\xF6",
  "&ouml;": "\xF6",
  "&ovbar;": "\u233D",
  "&par;": "\u2225",
  "&para": "\xB6",
  "&para;": "\xB6",
  "&parallel;": "\u2225",
  "&parsim;": "\u2AF3",
  "&parsl;": "\u2AFD",
  "&part;": "\u2202",
  "&pcy;": "\u043F",
  "&percnt;": "%",
  "&period;": ".",
  "&permil;": "\u2030",
  "&perp;": "\u22A5",
  "&pertenk;": "\u2031",
  "&pfr;": "\u{1D52D}",
  "&phi;": "\u03C6",
  "&phiv;": "\u03D5",
  "&phmmat;": "\u2133",
  "&phone;": "\u260E",
  "&pi;": "\u03C0",
  "&pitchfork;": "\u22D4",
  "&piv;": "\u03D6",
  "&planck;": "\u210F",
  "&planckh;": "\u210E",
  "&plankv;": "\u210F",
  "&plus;": "+",
  "&plusacir;": "\u2A23",
  "&plusb;": "\u229E",
  "&pluscir;": "\u2A22",
  "&plusdo;": "\u2214",
  "&plusdu;": "\u2A25",
  "&pluse;": "\u2A72",
  "&plusmn": "\xB1",
  "&plusmn;": "\xB1",
  "&plussim;": "\u2A26",
  "&plustwo;": "\u2A27",
  "&pm;": "\xB1",
  "&pointint;": "\u2A15",
  "&popf;": "\u{1D561}",
  "&pound": "\xA3",
  "&pound;": "\xA3",
  "&pr;": "\u227A",
  "&prE;": "\u2AB3",
  "&prap;": "\u2AB7",
  "&prcue;": "\u227C",
  "&pre;": "\u2AAF",
  "&prec;": "\u227A",
  "&precapprox;": "\u2AB7",
  "&preccurlyeq;": "\u227C",
  "&preceq;": "\u2AAF",
  "&precnapprox;": "\u2AB9",
  "&precneqq;": "\u2AB5",
  "&precnsim;": "\u22E8",
  "&precsim;": "\u227E",
  "&prime;": "\u2032",
  "&primes;": "\u2119",
  "&prnE;": "\u2AB5",
  "&prnap;": "\u2AB9",
  "&prnsim;": "\u22E8",
  "&prod;": "\u220F",
  "&profalar;": "\u232E",
  "&profline;": "\u2312",
  "&profsurf;": "\u2313",
  "&prop;": "\u221D",
  "&propto;": "\u221D",
  "&prsim;": "\u227E",
  "&prurel;": "\u22B0",
  "&pscr;": "\u{1D4C5}",
  "&psi;": "\u03C8",
  "&puncsp;": "\u2008",
  "&qfr;": "\u{1D52E}",
  "&qint;": "\u2A0C",
  "&qopf;": "\u{1D562}",
  "&qprime;": "\u2057",
  "&qscr;": "\u{1D4C6}",
  "&quaternions;": "\u210D",
  "&quatint;": "\u2A16",
  "&quest;": "?",
  "&questeq;": "\u225F",
  "&quot": '"',
  "&quot;": '"',
  "&rAarr;": "\u21DB",
  "&rArr;": "\u21D2",
  "&rAtail;": "\u291C",
  "&rBarr;": "\u290F",
  "&rHar;": "\u2964",
  "&race;": "\u223D\u0331",
  "&racute;": "\u0155",
  "&radic;": "\u221A",
  "&raemptyv;": "\u29B3",
  "&rang;": "\u27E9",
  "&rangd;": "\u2992",
  "&range;": "\u29A5",
  "&rangle;": "\u27E9",
  "&raquo": "\xBB",
  "&raquo;": "\xBB",
  "&rarr;": "\u2192",
  "&rarrap;": "\u2975",
  "&rarrb;": "\u21E5",
  "&rarrbfs;": "\u2920",
  "&rarrc;": "\u2933",
  "&rarrfs;": "\u291E",
  "&rarrhk;": "\u21AA",
  "&rarrlp;": "\u21AC",
  "&rarrpl;": "\u2945",
  "&rarrsim;": "\u2974",
  "&rarrtl;": "\u21A3",
  "&rarrw;": "\u219D",
  "&ratail;": "\u291A",
  "&ratio;": "\u2236",
  "&rationals;": "\u211A",
  "&rbarr;": "\u290D",
  "&rbbrk;": "\u2773",
  "&rbrace;": "}",
  "&rbrack;": "]",
  "&rbrke;": "\u298C",
  "&rbrksld;": "\u298E",
  "&rbrkslu;": "\u2990",
  "&rcaron;": "\u0159",
  "&rcedil;": "\u0157",
  "&rceil;": "\u2309",
  "&rcub;": "}",
  "&rcy;": "\u0440",
  "&rdca;": "\u2937",
  "&rdldhar;": "\u2969",
  "&rdquo;": "\u201D",
  "&rdquor;": "\u201D",
  "&rdsh;": "\u21B3",
  "&real;": "\u211C",
  "&realine;": "\u211B",
  "&realpart;": "\u211C",
  "&reals;": "\u211D",
  "&rect;": "\u25AD",
  "&reg": "\xAE",
  "&reg;": "\xAE",
  "&rfisht;": "\u297D",
  "&rfloor;": "\u230B",
  "&rfr;": "\u{1D52F}",
  "&rhard;": "\u21C1",
  "&rharu;": "\u21C0",
  "&rharul;": "\u296C",
  "&rho;": "\u03C1",
  "&rhov;": "\u03F1",
  "&rightarrow;": "\u2192",
  "&rightarrowtail;": "\u21A3",
  "&rightharpoondown;": "\u21C1",
  "&rightharpoonup;": "\u21C0",
  "&rightleftarrows;": "\u21C4",
  "&rightleftharpoons;": "\u21CC",
  "&rightrightarrows;": "\u21C9",
  "&rightsquigarrow;": "\u219D",
  "&rightthreetimes;": "\u22CC",
  "&ring;": "\u02DA",
  "&risingdotseq;": "\u2253",
  "&rlarr;": "\u21C4",
  "&rlhar;": "\u21CC",
  "&rlm;": "\u200F",
  "&rmoust;": "\u23B1",
  "&rmoustache;": "\u23B1",
  "&rnmid;": "\u2AEE",
  "&roang;": "\u27ED",
  "&roarr;": "\u21FE",
  "&robrk;": "\u27E7",
  "&ropar;": "\u2986",
  "&ropf;": "\u{1D563}",
  "&roplus;": "\u2A2E",
  "&rotimes;": "\u2A35",
  "&rpar;": ")",
  "&rpargt;": "\u2994",
  "&rppolint;": "\u2A12",
  "&rrarr;": "\u21C9",
  "&rsaquo;": "\u203A",
  "&rscr;": "\u{1D4C7}",
  "&rsh;": "\u21B1",
  "&rsqb;": "]",
  "&rsquo;": "\u2019",
  "&rsquor;": "\u2019",
  "&rthree;": "\u22CC",
  "&rtimes;": "\u22CA",
  "&rtri;": "\u25B9",
  "&rtrie;": "\u22B5",
  "&rtrif;": "\u25B8",
  "&rtriltri;": "\u29CE",
  "&ruluhar;": "\u2968",
  "&rx;": "\u211E",
  "&sacute;": "\u015B",
  "&sbquo;": "\u201A",
  "&sc;": "\u227B",
  "&scE;": "\u2AB4",
  "&scap;": "\u2AB8",
  "&scaron;": "\u0161",
  "&sccue;": "\u227D",
  "&sce;": "\u2AB0",
  "&scedil;": "\u015F",
  "&scirc;": "\u015D",
  "&scnE;": "\u2AB6",
  "&scnap;": "\u2ABA",
  "&scnsim;": "\u22E9",
  "&scpolint;": "\u2A13",
  "&scsim;": "\u227F",
  "&scy;": "\u0441",
  "&sdot;": "\u22C5",
  "&sdotb;": "\u22A1",
  "&sdote;": "\u2A66",
  "&seArr;": "\u21D8",
  "&searhk;": "\u2925",
  "&searr;": "\u2198",
  "&searrow;": "\u2198",
  "&sect": "\xA7",
  "&sect;": "\xA7",
  "&semi;": ";",
  "&seswar;": "\u2929",
  "&setminus;": "\u2216",
  "&setmn;": "\u2216",
  "&sext;": "\u2736",
  "&sfr;": "\u{1D530}",
  "&sfrown;": "\u2322",
  "&sharp;": "\u266F",
  "&shchcy;": "\u0449",
  "&shcy;": "\u0448",
  "&shortmid;": "\u2223",
  "&shortparallel;": "\u2225",
  "&shy": "\xAD",
  "&shy;": "\xAD",
  "&sigma;": "\u03C3",
  "&sigmaf;": "\u03C2",
  "&sigmav;": "\u03C2",
  "&sim;": "\u223C",
  "&simdot;": "\u2A6A",
  "&sime;": "\u2243",
  "&simeq;": "\u2243",
  "&simg;": "\u2A9E",
  "&simgE;": "\u2AA0",
  "&siml;": "\u2A9D",
  "&simlE;": "\u2A9F",
  "&simne;": "\u2246",
  "&simplus;": "\u2A24",
  "&simrarr;": "\u2972",
  "&slarr;": "\u2190",
  "&smallsetminus;": "\u2216",
  "&smashp;": "\u2A33",
  "&smeparsl;": "\u29E4",
  "&smid;": "\u2223",
  "&smile;": "\u2323",
  "&smt;": "\u2AAA",
  "&smte;": "\u2AAC",
  "&smtes;": "\u2AAC\uFE00",
  "&softcy;": "\u044C",
  "&sol;": "/",
  "&solb;": "\u29C4",
  "&solbar;": "\u233F",
  "&sopf;": "\u{1D564}",
  "&spades;": "\u2660",
  "&spadesuit;": "\u2660",
  "&spar;": "\u2225",
  "&sqcap;": "\u2293",
  "&sqcaps;": "\u2293\uFE00",
  "&sqcup;": "\u2294",
  "&sqcups;": "\u2294\uFE00",
  "&sqsub;": "\u228F",
  "&sqsube;": "\u2291",
  "&sqsubset;": "\u228F",
  "&sqsubseteq;": "\u2291",
  "&sqsup;": "\u2290",
  "&sqsupe;": "\u2292",
  "&sqsupset;": "\u2290",
  "&sqsupseteq;": "\u2292",
  "&squ;": "\u25A1",
  "&square;": "\u25A1",
  "&squarf;": "\u25AA",
  "&squf;": "\u25AA",
  "&srarr;": "\u2192",
  "&sscr;": "\u{1D4C8}",
  "&ssetmn;": "\u2216",
  "&ssmile;": "\u2323",
  "&sstarf;": "\u22C6",
  "&star;": "\u2606",
  "&starf;": "\u2605",
  "&straightepsilon;": "\u03F5",
  "&straightphi;": "\u03D5",
  "&strns;": "\xAF",
  "&sub;": "\u2282",
  "&subE;": "\u2AC5",
  "&subdot;": "\u2ABD",
  "&sube;": "\u2286",
  "&subedot;": "\u2AC3",
  "&submult;": "\u2AC1",
  "&subnE;": "\u2ACB",
  "&subne;": "\u228A",
  "&subplus;": "\u2ABF",
  "&subrarr;": "\u2979",
  "&subset;": "\u2282",
  "&subseteq;": "\u2286",
  "&subseteqq;": "\u2AC5",
  "&subsetneq;": "\u228A",
  "&subsetneqq;": "\u2ACB",
  "&subsim;": "\u2AC7",
  "&subsub;": "\u2AD5",
  "&subsup;": "\u2AD3",
  "&succ;": "\u227B",
  "&succapprox;": "\u2AB8",
  "&succcurlyeq;": "\u227D",
  "&succeq;": "\u2AB0",
  "&succnapprox;": "\u2ABA",
  "&succneqq;": "\u2AB6",
  "&succnsim;": "\u22E9",
  "&succsim;": "\u227F",
  "&sum;": "\u2211",
  "&sung;": "\u266A",
  "&sup1": "\xB9",
  "&sup1;": "\xB9",
  "&sup2": "\xB2",
  "&sup2;": "\xB2",
  "&sup3": "\xB3",
  "&sup3;": "\xB3",
  "&sup;": "\u2283",
  "&supE;": "\u2AC6",
  "&supdot;": "\u2ABE",
  "&supdsub;": "\u2AD8",
  "&supe;": "\u2287",
  "&supedot;": "\u2AC4",
  "&suphsol;": "\u27C9",
  "&suphsub;": "\u2AD7",
  "&suplarr;": "\u297B",
  "&supmult;": "\u2AC2",
  "&supnE;": "\u2ACC",
  "&supne;": "\u228B",
  "&supplus;": "\u2AC0",
  "&supset;": "\u2283",
  "&supseteq;": "\u2287",
  "&supseteqq;": "\u2AC6",
  "&supsetneq;": "\u228B",
  "&supsetneqq;": "\u2ACC",
  "&supsim;": "\u2AC8",
  "&supsub;": "\u2AD4",
  "&supsup;": "\u2AD6",
  "&swArr;": "\u21D9",
  "&swarhk;": "\u2926",
  "&swarr;": "\u2199",
  "&swarrow;": "\u2199",
  "&swnwar;": "\u292A",
  "&szlig": "\xDF",
  "&szlig;": "\xDF",
  "&target;": "\u2316",
  "&tau;": "\u03C4",
  "&tbrk;": "\u23B4",
  "&tcaron;": "\u0165",
  "&tcedil;": "\u0163",
  "&tcy;": "\u0442",
  "&tdot;": "\u20DB",
  "&telrec;": "\u2315",
  "&tfr;": "\u{1D531}",
  "&there4;": "\u2234",
  "&therefore;": "\u2234",
  "&theta;": "\u03B8",
  "&thetasym;": "\u03D1",
  "&thetav;": "\u03D1",
  "&thickapprox;": "\u2248",
  "&thicksim;": "\u223C",
  "&thinsp;": "\u2009",
  "&thkap;": "\u2248",
  "&thksim;": "\u223C",
  "&thorn": "\xFE",
  "&thorn;": "\xFE",
  "&tilde;": "\u02DC",
  "&times": "\xD7",
  "&times;": "\xD7",
  "&timesb;": "\u22A0",
  "&timesbar;": "\u2A31",
  "&timesd;": "\u2A30",
  "&tint;": "\u222D",
  "&toea;": "\u2928",
  "&top;": "\u22A4",
  "&topbot;": "\u2336",
  "&topcir;": "\u2AF1",
  "&topf;": "\u{1D565}",
  "&topfork;": "\u2ADA",
  "&tosa;": "\u2929",
  "&tprime;": "\u2034",
  "&trade;": "\u2122",
  "&triangle;": "\u25B5",
  "&triangledown;": "\u25BF",
  "&triangleleft;": "\u25C3",
  "&trianglelefteq;": "\u22B4",
  "&triangleq;": "\u225C",
  "&triangleright;": "\u25B9",
  "&trianglerighteq;": "\u22B5",
  "&tridot;": "\u25EC",
  "&trie;": "\u225C",
  "&triminus;": "\u2A3A",
  "&triplus;": "\u2A39",
  "&trisb;": "\u29CD",
  "&tritime;": "\u2A3B",
  "&trpezium;": "\u23E2",
  "&tscr;": "\u{1D4C9}",
  "&tscy;": "\u0446",
  "&tshcy;": "\u045B",
  "&tstrok;": "\u0167",
  "&twixt;": "\u226C",
  "&twoheadleftarrow;": "\u219E",
  "&twoheadrightarrow;": "\u21A0",
  "&uArr;": "\u21D1",
  "&uHar;": "\u2963",
  "&uacute": "\xFA",
  "&uacute;": "\xFA",
  "&uarr;": "\u2191",
  "&ubrcy;": "\u045E",
  "&ubreve;": "\u016D",
  "&ucirc": "\xFB",
  "&ucirc;": "\xFB",
  "&ucy;": "\u0443",
  "&udarr;": "\u21C5",
  "&udblac;": "\u0171",
  "&udhar;": "\u296E",
  "&ufisht;": "\u297E",
  "&ufr;": "\u{1D532}",
  "&ugrave": "\xF9",
  "&ugrave;": "\xF9",
  "&uharl;": "\u21BF",
  "&uharr;": "\u21BE",
  "&uhblk;": "\u2580",
  "&ulcorn;": "\u231C",
  "&ulcorner;": "\u231C",
  "&ulcrop;": "\u230F",
  "&ultri;": "\u25F8",
  "&umacr;": "\u016B",
  "&uml": "\xA8",
  "&uml;": "\xA8",
  "&uogon;": "\u0173",
  "&uopf;": "\u{1D566}",
  "&uparrow;": "\u2191",
  "&updownarrow;": "\u2195",
  "&upharpoonleft;": "\u21BF",
  "&upharpoonright;": "\u21BE",
  "&uplus;": "\u228E",
  "&upsi;": "\u03C5",
  "&upsih;": "\u03D2",
  "&upsilon;": "\u03C5",
  "&upuparrows;": "\u21C8",
  "&urcorn;": "\u231D",
  "&urcorner;": "\u231D",
  "&urcrop;": "\u230E",
  "&uring;": "\u016F",
  "&urtri;": "\u25F9",
  "&uscr;": "\u{1D4CA}",
  "&utdot;": "\u22F0",
  "&utilde;": "\u0169",
  "&utri;": "\u25B5",
  "&utrif;": "\u25B4",
  "&uuarr;": "\u21C8",
  "&uuml": "\xFC",
  "&uuml;": "\xFC",
  "&uwangle;": "\u29A7",
  "&vArr;": "\u21D5",
  "&vBar;": "\u2AE8",
  "&vBarv;": "\u2AE9",
  "&vDash;": "\u22A8",
  "&vangrt;": "\u299C",
  "&varepsilon;": "\u03F5",
  "&varkappa;": "\u03F0",
  "&varnothing;": "\u2205",
  "&varphi;": "\u03D5",
  "&varpi;": "\u03D6",
  "&varpropto;": "\u221D",
  "&varr;": "\u2195",
  "&varrho;": "\u03F1",
  "&varsigma;": "\u03C2",
  "&varsubsetneq;": "\u228A\uFE00",
  "&varsubsetneqq;": "\u2ACB\uFE00",
  "&varsupsetneq;": "\u228B\uFE00",
  "&varsupsetneqq;": "\u2ACC\uFE00",
  "&vartheta;": "\u03D1",
  "&vartriangleleft;": "\u22B2",
  "&vartriangleright;": "\u22B3",
  "&vcy;": "\u0432",
  "&vdash;": "\u22A2",
  "&vee;": "\u2228",
  "&veebar;": "\u22BB",
  "&veeeq;": "\u225A",
  "&vellip;": "\u22EE",
  "&verbar;": "|",
  "&vert;": "|",
  "&vfr;": "\u{1D533}",
  "&vltri;": "\u22B2",
  "&vnsub;": "\u2282\u20D2",
  "&vnsup;": "\u2283\u20D2",
  "&vopf;": "\u{1D567}",
  "&vprop;": "\u221D",
  "&vrtri;": "\u22B3",
  "&vscr;": "\u{1D4CB}",
  "&vsubnE;": "\u2ACB\uFE00",
  "&vsubne;": "\u228A\uFE00",
  "&vsupnE;": "\u2ACC\uFE00",
  "&vsupne;": "\u228B\uFE00",
  "&vzigzag;": "\u299A",
  "&wcirc;": "\u0175",
  "&wedbar;": "\u2A5F",
  "&wedge;": "\u2227",
  "&wedgeq;": "\u2259",
  "&weierp;": "\u2118",
  "&wfr;": "\u{1D534}",
  "&wopf;": "\u{1D568}",
  "&wp;": "\u2118",
  "&wr;": "\u2240",
  "&wreath;": "\u2240",
  "&wscr;": "\u{1D4CC}",
  "&xcap;": "\u22C2",
  "&xcirc;": "\u25EF",
  "&xcup;": "\u22C3",
  "&xdtri;": "\u25BD",
  "&xfr;": "\u{1D535}",
  "&xhArr;": "\u27FA",
  "&xharr;": "\u27F7",
  "&xi;": "\u03BE",
  "&xlArr;": "\u27F8",
  "&xlarr;": "\u27F5",
  "&xmap;": "\u27FC",
  "&xnis;": "\u22FB",
  "&xodot;": "\u2A00",
  "&xopf;": "\u{1D569}",
  "&xoplus;": "\u2A01",
  "&xotime;": "\u2A02",
  "&xrArr;": "\u27F9",
  "&xrarr;": "\u27F6",
  "&xscr;": "\u{1D4CD}",
  "&xsqcup;": "\u2A06",
  "&xuplus;": "\u2A04",
  "&xutri;": "\u25B3",
  "&xvee;": "\u22C1",
  "&xwedge;": "\u22C0",
  "&yacute": "\xFD",
  "&yacute;": "\xFD",
  "&yacy;": "\u044F",
  "&ycirc;": "\u0177",
  "&ycy;": "\u044B",
  "&yen": "\xA5",
  "&yen;": "\xA5",
  "&yfr;": "\u{1D536}",
  "&yicy;": "\u0457",
  "&yopf;": "\u{1D56A}",
  "&yscr;": "\u{1D4CE}",
  "&yucy;": "\u044E",
  "&yuml": "\xFF",
  "&yuml;": "\xFF",
  "&zacute;": "\u017A",
  "&zcaron;": "\u017E",
  "&zcy;": "\u0437",
  "&zdot;": "\u017C",
  "&zeetrf;": "\u2128",
  "&zeta;": "\u03B6",
  "&zfr;": "\u{1D537}",
  "&zhcy;": "\u0436",
  "&zigrarr;": "\u21DD",
  "&zopf;": "\u{1D56B}",
  "&zscr;": "\u{1D4CF}",
  "&zwj;": "\u200D",
  "&zwnj;": "\u200C"
};
var html_entities_default = htmlEntities;

// node_modules/postal-mime/src/text-format.js
function decodeHTMLEntities(str) {
  return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match, entity) => {
    if (typeof html_entities_default[match] === "string") {
      return html_entities_default[match];
    }
    if (entity.charAt(0) !== "#" || match.charAt(match.length - 1) !== ";") {
      return match;
    }
    let codePoint;
    if (entity.charAt(1) === "x") {
      codePoint = parseInt(entity.substr(2), 16);
    } else {
      codePoint = parseInt(entity.substr(1), 10);
    }
    let output = "";
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "\uFFFD";
    }
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  });
}
function escapeHtml2(str) {
  return str.trim().replace(/[<>"'?&]/g, (c) => {
    let hex = c.charCodeAt(0).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return "&#x" + hex.toUpperCase() + ";";
  });
}
function textToHtml(str) {
  let html = escapeHtml2(str).replace(/\n/g, "<br />");
  return "<div>" + html + "</div>";
}
function htmlToText(str) {
  str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
  str = decodeHTMLEntities(str);
  return str;
}
function formatTextAddress(address) {
  return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
function formatTextAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push(", ");
    }
    if (address.group) {
      let groupStart = `${address.name}:`;
      let groupEnd = `;`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatTextAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join("");
}
function formatHtmlAddress(address) {
  return `<a href="mailto:${escapeHtml2(address.address)}" class="postal-email-address">${escapeHtml2(address.name || `<${address.address}>`)}</a>`;
}
function formatHtmlAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push('<span class="postal-email-address-separator">, </span>');
    }
    if (address.group) {
      let groupStart = `<span class="postal-email-address-group">${escapeHtml2(address.name)}:</span>`;
      let groupEnd = `<span class="postal-email-address-group">;</span>`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatHtmlAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join(" ");
}
function foldLines(str, lineLength, afterSpace) {
  str = (str || "").toString();
  lineLength = lineLength || 76;
  let pos = 0, len = str.length, result = "", line, match;
  while (pos < len) {
    line = str.substr(pos, lineLength);
    if (line.length < lineLength) {
      result += line;
      break;
    }
    if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) {
      line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
    } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
    }
    result += line;
    pos += line.length;
    if (pos < len) {
      result += "\r\n";
    }
  }
  return result;
}
function formatTextHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push({ key: "From", val: formatTextAddress(message.from) });
  }
  if (message.subject) {
    rows.push({ key: "Subject", val: message.subject });
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push({ key: "Date", val: dateStr });
  }
  if (message.to && message.to.length) {
    rows.push({ key: "To", val: formatTextAddresses(message.to) });
  }
  if (message.cc && message.cc.length) {
    rows.push({ key: "Cc", val: formatTextAddresses(message.cc) });
  }
  if (message.bcc && message.bcc.length) {
    rows.push({ key: "Bcc", val: formatTextAddresses(message.bcc) });
  }
  let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  rows = rows.flatMap((row) => {
    let sepLen = maxKeyLength - row.key.length;
    let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
    let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
    let foldedLines = foldLines(row.val, 80, true).split(/\r?\n/).map((line) => line.trim());
    return foldedLines.map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
  });
  let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  let lineMarker = "-".repeat(maxLineLength);
  let template = `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
  return template;
}
function formatHtmlHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push(
      `<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message.from)}</div>`
    );
  }
  if (message.subject) {
    rows.push(
      `<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml2(
        message.subject
      )}</div>`
    );
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push(
      `<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml2(
        message.date
      )}">${escapeHtml2(dateStr)}</div>`
    );
  }
  if (message.to && message.to.length) {
    rows.push(
      `<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message.to)}</div>`
    );
  }
  if (message.cc && message.cc.length) {
    rows.push(
      `<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.cc)}</div>`
    );
  }
  if (message.bcc && message.bcc.length) {
    rows.push(
      `<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.bcc)}</div>`
    );
  }
  let template = `<div class="postal-email-header">${rows.length ? '<div class="postal-email-header-row">' : ""}${rows.join(
    '</div>\n<div class="postal-email-header-row">'
  )}${rows.length ? "</div>" : ""}</div>`;
  return template;
}

// node_modules/postal-mime/src/address-parser.js
function _handleAddress(tokens, depth) {
  let isGroup = false;
  let state = "text";
  let address;
  let addresses = [];
  let data = {
    address: [],
    comment: [],
    group: [],
    text: [],
    textWasQuoted: []
    // Track which text tokens came from inside quotes
  };
  let i;
  let len;
  let insideQuotes = false;
  for (i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];
    let prevToken = i ? tokens[i - 1] : null;
    if (token.type === "operator") {
      switch (token.value) {
        case "<":
          state = "address";
          insideQuotes = false;
          break;
        case "(":
          state = "comment";
          insideQuotes = false;
          break;
        case ":":
          state = "group";
          isGroup = true;
          insideQuotes = false;
          break;
        case '"':
          insideQuotes = !insideQuotes;
          state = "text";
          break;
        default:
          state = "text";
          insideQuotes = false;
          break;
      }
    } else if (token.value) {
      if (state === "address") {
        token.value = token.value.replace(/^[^<]*<\s*/, "");
      }
      if (prevToken && prevToken.noBreak && data[state].length) {
        data[state][data[state].length - 1] += token.value;
        if (state === "text" && insideQuotes) {
          data.textWasQuoted[data.textWasQuoted.length - 1] = true;
        }
      } else {
        data[state].push(token.value);
        if (state === "text") {
          data.textWasQuoted.push(insideQuotes);
        }
      }
    }
  }
  if (!data.text.length && data.comment.length) {
    data.text = data.comment;
    data.comment = [];
  }
  if (isGroup) {
    data.text = data.text.join(" ");
    let groupMembers = [];
    if (data.group.length) {
      let parsedGroup = addressParser(data.group.join(","), { _depth: depth + 1 });
      parsedGroup.forEach((member) => {
        if (member.group) {
          groupMembers = groupMembers.concat(member.group);
        } else {
          groupMembers.push(member);
        }
      });
    }
    addresses.push({
      name: decodeWords(data.text || address && address.name),
      group: groupMembers
    });
  } else {
    if (!data.address.length && data.text.length) {
      for (i = data.text.length - 1; i >= 0; i--) {
        if (!data.textWasQuoted[i] && data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
          data.address = data.text.splice(i, 1);
          data.textWasQuoted.splice(i, 1);
          break;
        }
      }
      let _regexHandler = function(address2) {
        if (!data.address.length) {
          data.address = [address2.trim()];
          return " ";
        } else {
          return address2;
        }
      };
      if (!data.address.length) {
        for (i = data.text.length - 1; i >= 0; i--) {
          if (!data.textWasQuoted[i]) {
            data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
            if (data.address.length) {
              break;
            }
          }
        }
      }
    }
    if (!data.text.length && data.comment.length) {
      data.text = data.comment;
      data.comment = [];
    }
    if (data.address.length > 1) {
      data.text = data.text.concat(data.address.splice(1));
    }
    data.text = data.text.join(" ");
    data.address = data.address.join(" ");
    if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
      const decodedText = decodeWords(data.text);
      if (/<[^<>]+@[^<>]+>/.test(decodedText)) {
        const parsedSubAddresses = addressParser(decodedText);
        if (parsedSubAddresses && parsedSubAddresses.length) {
          return parsedSubAddresses;
        }
      }
      return [{ address: "", name: decodedText }];
    }
    address = {
      address: data.address || data.text || "",
      name: decodeWords(data.text || data.address || "")
    };
    if (address.address === address.name) {
      if ((address.address || "").match(/@/)) {
        address.name = "";
      } else {
        address.address = "";
      }
    }
    addresses.push(address);
  }
  return addresses;
}
var Tokenizer = class {
  constructor(str) {
    this.str = (str || "").toString();
    this.operatorCurrent = "";
    this.operatorExpecting = "";
    this.node = null;
    this.escaped = false;
    this.list = [];
    this.operators = {
      '"': '"',
      "(": ")",
      "<": ">",
      ",": "",
      ":": ";",
      // Semicolons are not a legal delimiter per the RFC2822 grammar other
      // than for terminating a group, but they are also not valid for any
      // other use in this context.  Given that some mail clients have
      // historically allowed the semicolon as a delimiter equivalent to the
      // comma in their UI, it makes sense to treat them the same as a comma
      // when used outside of a group.
      ";": ""
    };
  }
  /**
   * Tokenizes the original input string
   *
   * @return {Array} An array of operator|text tokens
   */
  tokenize() {
    let list = [];
    for (let i = 0, len = this.str.length; i < len; i++) {
      let chr = this.str.charAt(i);
      let nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
      this.checkChar(chr, nextChr);
    }
    this.list.forEach((node) => {
      node.value = (node.value || "").toString().trim();
      if (node.value) {
        list.push(node);
      }
    });
    return list;
  }
  /**
   * Checks if a character is an operator or text and acts accordingly
   *
   * @param {String} chr Character from the address field
   */
  checkChar(chr, nextChr) {
    if (this.escaped) {
    } else if (chr === this.operatorExpecting) {
      this.node = {
        type: "operator",
        value: chr
      };
      if (nextChr && ![" ", "	", "\r", "\n", ",", ";"].includes(nextChr)) {
        this.node.noBreak = true;
      }
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = "";
      this.escaped = false;
      return;
    } else if (!this.operatorExpecting && chr in this.operators) {
      this.node = {
        type: "operator",
        value: chr
      };
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = this.operators[chr];
      this.escaped = false;
      return;
    } else if (this.operatorExpecting === '"' && chr === "\\") {
      this.escaped = true;
      return;
    }
    if (!this.node) {
      this.node = {
        type: "text",
        value: ""
      };
      this.list.push(this.node);
    }
    if (chr === "\n") {
      chr = " ";
    }
    if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
      this.node.value += chr;
    }
    this.escaped = false;
  }
};
var MAX_NESTED_GROUP_DEPTH = 50;
function addressParser(str, options) {
  options = options || {};
  let depth = options._depth || 0;
  if (depth > MAX_NESTED_GROUP_DEPTH) {
    return [];
  }
  let tokenizer = new Tokenizer(str);
  let tokens = tokenizer.tokenize();
  let addresses = [];
  let address = [];
  let parsedAddresses = [];
  tokens.forEach((token) => {
    if (token.type === "operator" && (token.value === "," || token.value === ";")) {
      if (address.length) {
        addresses.push(address);
      }
      address = [];
    } else {
      address.push(token);
    }
  });
  if (address.length) {
    addresses.push(address);
  }
  addresses.forEach((address2) => {
    address2 = _handleAddress(address2, depth);
    if (address2.length) {
      parsedAddresses = parsedAddresses.concat(address2);
    }
  });
  if (options.flatten) {
    let addresses2 = [];
    let walkAddressList = (list) => {
      list.forEach((address2) => {
        if (address2.group) {
          return walkAddressList(address2.group);
        } else {
          addresses2.push(address2);
        }
      });
    };
    walkAddressList(parsedAddresses);
    return addresses2;
  }
  return parsedAddresses;
}
var address_parser_default = addressParser;

// node_modules/postal-mime/src/base64-encoder.js
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b2, c, d;
  var chunk;
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b2 = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b2] + encodings[c] + encodings[d];
  }
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b2 = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b2] + "==";
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b2 = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b2] + encodings[c] + "=";
  }
  return base64;
}

// node_modules/postal-mime/src/postal-mime.js
var MAX_NESTING_DEPTH = 256;
var MAX_HEADERS_SIZE = 2 * 1024 * 1024;
var MAX_RFC822_NESTING_DEPTH = 10;
function toCamelCase(key) {
  return key.replace(/-(.)/g, (o, c) => c.toUpperCase());
}
function parseLimitOption(value, defaultValue, name) {
  if (value === void 0 || value === null) {
    return defaultValue;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non-negative integer`);
  }
  return value;
}
var PostalMime = class _PostalMime {
  // async so that an invalid option rejects the returned promise instead of throwing
  // synchronously, which would escape a `.catch()` chain
  static async parse(buf, options) {
    const parser = new _PostalMime(options);
    return parser.parse(buf);
  }
  // rfc822NestingDepth is internal state that nested parsers receive from their parent.
  // It is deliberately a separate argument rather than an option, so that forwarding a
  // caller supplied options object can not seed it and switch the recursion limit off.
  constructor(options, rfc822NestingDepth = 0) {
    this.options = options || {};
    this.mimeOptions = {
      maxNestingDepth: parseLimitOption(this.options.maxNestingDepth, MAX_NESTING_DEPTH, "maxNestingDepth"),
      maxHeadersSize: parseLimitOption(this.options.maxHeadersSize, MAX_HEADERS_SIZE, "maxHeadersSize")
    };
    this.maxRfc822NestingDepth = parseLimitOption(
      this.options.maxRfc822NestingDepth,
      MAX_RFC822_NESTING_DEPTH,
      "maxRfc822NestingDepth"
    );
    this.rfc822NestingDepth = rfc822NestingDepth;
    this.root = this.currentNode = new MimeNode({
      postalMime: this,
      ...this.mimeOptions
    });
    this.boundaries = [];
    this.textContent = {};
    this.attachments = [];
    this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
    this.started = false;
  }
  async finalize() {
    await this.root.finalize();
  }
  async processLine(line, isFinal) {
    let boundaries = this.boundaries;
    if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) {
      for (let i = boundaries.length - 1; i >= 0; i--) {
        let boundary = boundaries[i];
        if (line.length < boundary.value.length + 2) {
          continue;
        }
        let boundaryMatches = true;
        for (let j = 0; j < boundary.value.length; j++) {
          if (line[j + 2] !== boundary.value[j]) {
            boundaryMatches = false;
            break;
          }
        }
        if (!boundaryMatches) {
          continue;
        }
        let boundaryEnd = boundary.value.length + 2;
        let isTerminator = false;
        if (line.length >= boundary.value.length + 4 && line[boundary.value.length + 2] === 45 && line[boundary.value.length + 3] === 45) {
          isTerminator = true;
          boundaryEnd = boundary.value.length + 4;
        }
        let hasValidTrailing = true;
        for (let j = boundaryEnd; j < line.length; j++) {
          if (line[j] !== 32 && line[j] !== 9) {
            hasValidTrailing = false;
            break;
          }
        }
        if (!hasValidTrailing) {
          continue;
        }
        if (isTerminator) {
          await boundary.node.finalize();
          this.currentNode = boundary.node.parentNode || this.root;
        } else {
          await boundary.node.finalizeChildNodes();
          this.currentNode = new MimeNode({
            postalMime: this,
            parentNode: boundary.node,
            parentMultipartType: boundary.node.contentType.multipart,
            ...this.mimeOptions
          });
        }
        if (isFinal) {
          return this.finalize();
        }
        return;
      }
    }
    this.currentNode.feed(line);
    if (isFinal) {
      return this.finalize();
    }
  }
  readLine() {
    let startPos = this.readPos;
    let endPos = this.readPos;
    while (this.readPos < this.av.length) {
      const c = this.av[this.readPos++];
      if (c !== 13 && c !== 10) {
        endPos = this.readPos;
      }
      if (c === 10) {
        return {
          bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
          done: this.readPos >= this.av.length
        };
      }
    }
    return {
      bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
      done: this.readPos >= this.av.length
    };
  }
  async processNodeTree() {
    let textContent = {};
    let textTypes = /* @__PURE__ */ new Set();
    let textMap = this.textMap = /* @__PURE__ */ new Map();
    let forceRfc822Attachments = this.forceRfc822Attachments();
    let walk = async (node, alternative, related) => {
      alternative = alternative || false;
      related = related || false;
      if (!node.contentType.multipart) {
        const inlineRfc822 = this.isInlineMessageRfc822(node) && !forceRfc822Attachments;
        const rfc822DepthExceeded = inlineRfc822 && this.rfc822NestingDepth >= this.maxRfc822NestingDepth;
        if (inlineRfc822 && !rfc822DepthExceeded) {
          const subParser = new _PostalMime(
            {
              // Only the limits are inherited. Options that decide how a part
              // is classified stay with the parser that was configured.
              ...this.mimeOptions,
              maxRfc822NestingDepth: this.maxRfc822NestingDepth,
              // attachments are encoded by the parent parser, keep raw buffers here
              attachmentEncoding: "arraybuffer"
            },
            this.rfc822NestingDepth + 1
          );
          node.subMessage = await subParser.parse(node.content);
          if (!textMap.has(node)) {
            textMap.set(node, {});
          }
          let textEntry = textMap.get(node);
          if (node.subMessage.text || !node.subMessage.html) {
            textEntry.plain = textEntry.plain || [];
            textEntry.plain.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("plain");
          }
          if (node.subMessage.html) {
            textEntry.html = textEntry.html || [];
            textEntry.html.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("html");
          }
          if (subParser.textMap) {
            subParser.textMap.forEach((subTextEntry, subTextNode) => {
              textMap.set(subTextNode, subTextEntry);
            });
          }
          for (let attachment of node.subMessage.attachments || []) {
            this.attachments.push(attachment);
          }
        } else if (this.isInlineTextNode(node)) {
          let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
          let selectorNode = alternative || node;
          if (!textMap.has(selectorNode)) {
            textMap.set(selectorNode, {});
          }
          let textEntry = textMap.get(selectorNode);
          textEntry[textType] = textEntry[textType] || [];
          textEntry[textType].push({ type: "text", value: node.getTextContent() });
          textTypes.add(textType);
        } else if (node.content) {
          const filename = node.contentDisposition?.parsed?.params?.filename || node.contentType.parsed.params.name || null;
          const attachment = {
            filename: filename ? decodeWords(filename) : null,
            mimeType: node.contentType.parsed.value,
            disposition: node.contentDisposition?.parsed?.value || null
          };
          if (related && node.contentId && !rfc822DepthExceeded) {
            attachment.related = true;
          }
          if (rfc822DepthExceeded) {
            attachment.rfc822DepthExceeded = true;
          }
          if (node.contentDescription) {
            attachment.description = node.contentDescription;
          }
          if (node.contentId) {
            attachment.contentId = node.contentId;
          }
          switch (node.contentType.parsed.value) {
            // Special handling for calendar events
            case "text/calendar":
            case "application/ics": {
              if (node.contentType.parsed.params.method) {
                attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
              }
              const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
              attachment.content = textEncoder.encode(decodedText);
              break;
            }
            // Regular attachments
            default:
              attachment.content = node.content;
          }
          this.attachments.push(attachment);
        }
      } else if (node.contentType.multipart === "alternative") {
        alternative = node;
      } else if (node.contentType.multipart === "related") {
        related = node;
      }
      for (let childNode of node.childNodes) {
        await walk(childNode, alternative, related);
      }
    };
    await walk(this.root, false, false);
    textMap.forEach((mapEntry) => {
      textTypes.forEach((textType) => {
        if (!textContent[textType]) {
          textContent[textType] = [];
        }
        if (mapEntry[textType]) {
          mapEntry[textType].forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                textContent[textType].push(textEntry.value);
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        } else {
          let alternativeType;
          switch (textType) {
            case "html":
              alternativeType = "plain";
              break;
            case "plain":
              alternativeType = "html";
              break;
          }
          (mapEntry[alternativeType] || []).forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                switch (textType) {
                  case "html":
                    textContent[textType].push(textToHtml(textEntry.value));
                    break;
                  case "plain":
                    textContent[textType].push(htmlToText(textEntry.value));
                    break;
                }
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        }
      });
    });
    Object.keys(textContent).forEach((textType) => {
      textContent[textType] = textContent[textType].join("\n");
    });
    this.textContent = textContent;
  }
  isInlineTextNode(node) {
    if (node.contentDisposition?.parsed?.value === "attachment") {
      return false;
    }
    switch (node.contentType.parsed?.value) {
      case "text/html":
      case "text/plain":
        return true;
      case "text/calendar":
      case "text/csv":
      default:
        return false;
    }
  }
  isInlineMessageRfc822(node) {
    if (node.contentType.parsed?.value !== "message/rfc822") {
      return false;
    }
    let disposition = node.contentDisposition?.parsed?.value || (this.options.rfc822Attachments ? "attachment" : "inline");
    return disposition === "inline";
  }
  // Check if this is a specially crafted report email where message/rfc822 content should not be inlined
  forceRfc822Attachments() {
    if (this.options.forceRfc822Attachments) {
      return true;
    }
    let forceRfc822Attachments = false;
    let walk = (node) => {
      if (!node.contentType.multipart) {
        if (node.contentType.parsed && ["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) {
          forceRfc822Attachments = true;
        }
      }
      for (let childNode of node.childNodes) {
        walk(childNode);
      }
    };
    walk(this.root);
    return forceRfc822Attachments;
  }
  async resolveStream(stream) {
    let chunkLen = 0;
    let chunks = [];
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      chunkLen += value.length;
    }
    const result = new Uint8Array(chunkLen);
    let chunkPointer = 0;
    for (let chunk of chunks) {
      result.set(chunk, chunkPointer);
      chunkPointer += chunk.length;
    }
    return result;
  }
  async parse(buf) {
    if (this.started) {
      throw new Error("Can not reuse parser, create a new PostalMime object");
    }
    this.started = true;
    if (buf && typeof buf.getReader === "function") {
      buf = await this.resolveStream(buf);
    }
    buf = buf || new ArrayBuffer(0);
    if (typeof buf === "string") {
      buf = textEncoder.encode(buf);
    }
    if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") {
      buf = await blobToArrayBuffer(buf);
    }
    if (buf.buffer instanceof ArrayBuffer) {
      buf = new Uint8Array(buf).buffer;
    }
    this.buf = buf;
    this.av = new Uint8Array(buf);
    this.readPos = 0;
    while (this.readPos < this.av.length) {
      const line = this.readLine();
      await this.processLine(line.bytes, line.done);
    }
    await this.processNodeTree();
    const message = {
      headers: this.root.headers.map((entry) => ({ key: entry.key, originalKey: entry.originalKey, value: entry.value })).reverse()
    };
    for (const key of ["from", "sender"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = address_parser_default(addressHeader.value);
        if (addresses && addresses.length) {
          message[key] = addresses[0];
        }
      }
    }
    for (const key of ["delivered-to", "return-path"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = address_parser_default(addressHeader.value);
        if (addresses && addresses.length && addresses[0].address) {
          const camelKey = toCamelCase(key);
          message[camelKey] = addresses[0].address;
        }
      }
    }
    for (const key of ["to", "cc", "bcc", "reply-to"]) {
      const addressHeaders = this.root.headers.filter((line) => line.key === key);
      let addresses = [];
      addressHeaders.filter((entry) => entry && entry.value).map((entry) => address_parser_default(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
      if (addresses && addresses.length) {
        const camelKey = toCamelCase(key);
        message[camelKey] = addresses;
      }
    }
    for (const key of ["subject", "message-id", "in-reply-to", "references"]) {
      const header = this.root.headers.find((line) => line.key === key);
      if (header && header.value) {
        const camelKey = toCamelCase(key);
        message[camelKey] = decodeWords(header.value);
      }
    }
    let dateHeader = this.root.headers.find((line) => line.key === "date");
    if (dateHeader) {
      let date = new Date(dateHeader.value);
      if (date.toString() === "Invalid Date") {
        date = dateHeader.value;
      } else {
        date = date.toISOString();
      }
      message.date = date;
    }
    if (this.textContent?.html) {
      message.html = this.textContent.html;
    }
    if (this.textContent?.plain) {
      message.text = this.textContent.plain;
    }
    message.attachments = this.attachments;
    message.headerLines = (this.root.rawHeaderLines || []).slice().reverse();
    switch (this.attachmentEncoding) {
      case "arraybuffer":
        break;
      case "base64":
        for (let attachment of message.attachments || []) {
          if (attachment?.content) {
            attachment.content = base64ArrayBuffer(attachment.content);
            attachment.encoding = "base64";
          }
        }
        break;
      case "utf8":
        let attachmentDecoder = new TextDecoder("utf8");
        for (let attachment of message.attachments || []) {
          if (attachment?.content) {
            attachment.content = attachmentDecoder.decode(attachment.content);
            attachment.encoding = "utf8";
          }
        }
        break;
      default:
        throw new Error("Unknown attachment encoding");
    }
    return message;
  }
};

// node_modules/resend/dist/index.mjs
var import_standardwebhooks = __toESM(require_dist(), 1);
var version = "6.38.1";
function buildPaginationUrl(base, options) {
  const queryString = buildPaginationQuery(options);
  return queryString ? `${base}?${queryString}` : base;
}
function buildPaginationQuery(options) {
  const searchParams = new URLSearchParams();
  if (options.limit !== void 0) searchParams.set("limit", options.limit.toString());
  if ("after" in options && options.after !== void 0) searchParams.set("after", options.after);
  if ("before" in options && options.before !== void 0) searchParams.set("before", options.before);
  return searchParams.toString();
}
var ApiKeys = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/api-keys", payload, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/api-keys", options);
    return await this.resend.get(url, requestOptions);
  }
  async update(id, payload, requestOptions = {}) {
    return await this.resend.patch(`/api-keys/${id}`, payload, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    return await this.resend.delete(`/api-keys/${id}`, void 0, requestOptions);
  }
};
var AutomationRuns = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(options, requestOptions = {}) {
    return await this.resend.get(`/automations/${options.automationId}/runs/${options.runId}`, requestOptions);
  }
  async list(options, requestOptions = {}) {
    const queryString = buildPaginationQuery(options);
    const searchParams = new URLSearchParams(queryString);
    if (options.status) {
      const statusValue = Array.isArray(options.status) ? options.status.join(",") : options.status;
      searchParams.set("status", statusValue);
    }
    const qs = searchParams.toString();
    const url = qs ? `/automations/${options.automationId}/runs?${qs}` : `/automations/${options.automationId}/runs`;
    return await this.resend.get(url, requestOptions);
  }
};
var TRIGGER_FIELDS = { eventName: "event_name" };
var SEND_EMAIL_FIELDS = {
  template: "template",
  subject: "subject",
  from: "from",
  replyTo: "reply_to",
  topicId: "topic_id"
};
var WAIT_FOR_EVENT_FIELDS = {
  eventName: "event_name",
  timeout: "timeout",
  filterRule: "filter_rule"
};
var CONTACT_UPDATE_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  unsubscribed: "unsubscribed",
  properties: "properties"
};
var ADD_TO_SEGMENT_FIELDS = { segmentId: "segment_id" };
function renameFields(config2, fields) {
  const result = {};
  for (const sdkField of Object.keys(fields)) result[fields[sdkField]] = config2[sdkField];
  return result;
}
function parseStepConfig(step) {
  switch (step.type) {
    case "trigger":
      return {
        key: step.key,
        type: step.type,
        config: renameFields(step.config, TRIGGER_FIELDS)
      };
    case "delay":
      return {
        key: step.key,
        type: step.type,
        config: step.config
      };
    case "send_email":
      return {
        key: step.key,
        type: step.type,
        config: renameFields(step.config, SEND_EMAIL_FIELDS)
      };
    case "wait_for_event":
      return {
        key: step.key,
        type: step.type,
        config: renameFields(step.config, WAIT_FOR_EVENT_FIELDS)
      };
    case "condition":
      return {
        key: step.key,
        type: step.type,
        config: step.config
      };
    case "contact_update":
      return {
        key: step.key,
        type: step.type,
        config: renameFields(step.config, CONTACT_UPDATE_FIELDS)
      };
    case "contact_delete":
      return {
        key: step.key,
        type: step.type,
        config: step.config
      };
    case "add_to_segment":
      return {
        key: step.key,
        type: step.type,
        config: renameFields(step.config, ADD_TO_SEGMENT_FIELDS)
      };
  }
}
function parseConnection(connection2) {
  return {
    from: connection2.from,
    to: connection2.to,
    type: connection2.type
  };
}
function parseAutomationToApiOptions(automation) {
  return {
    name: automation.name,
    status: automation.status,
    steps: automation.steps.map(parseStepConfig),
    connections: automation.connections.map(parseConnection)
  };
}
function parseEventToApiOptions(event) {
  return {
    event: event.event,
    contact_id: event.contactId,
    email: event.email,
    payload: event.payload
  };
}
var Automations = class {
  constructor(resend) {
    this.resend = resend;
    this.runs = new AutomationRuns(this.resend);
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/automations", parseAutomationToApiOptions(payload), requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const params = [buildPaginationQuery(options)];
    if (options.status) params.push(`status=${encodeURIComponent(options.status)}`);
    const qs = params.filter(Boolean).join("&");
    const url = qs ? `/automations?${qs}` : "/automations";
    return await this.resend.get(url, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/automations/${id}`, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    return await this.resend.delete(`/automations/${id}`, void 0, requestOptions);
  }
  async update(id, payload, requestOptions = {}) {
    const apiPayload = {};
    if (payload.name !== void 0) apiPayload.name = payload.name;
    if (payload.status !== void 0) apiPayload.status = payload.status;
    if (payload.steps !== void 0) apiPayload.steps = payload.steps.map(parseStepConfig);
    if (payload.connections !== void 0) apiPayload.connections = payload.connections.map(parseConnection);
    return await this.resend.patch(`/automations/${id}`, apiPayload, requestOptions);
  }
  async duplicate(id, requestOptions = {}) {
    return await this.resend.post(`/automations/${id}/duplicate`, void 0, requestOptions);
  }
  async stop(id, requestOptions = {}) {
    return await this.resend.post(`/automations/${id}/stop`, void 0, requestOptions);
  }
};
function encodeBase64(bytes) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString("base64");
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary);
}
function parseAttachmentContent(content) {
  if (ArrayBuffer.isView(content)) return encodeBase64(new Uint8Array(content.buffer, content.byteOffset, content.byteLength));
  if (content instanceof ArrayBuffer) return encodeBase64(new Uint8Array(content));
  return content;
}
function parseAttachments(attachments) {
  return attachments?.map((attachment) => ({
    content: parseAttachmentContent(attachment.content),
    filename: attachment.filename,
    path: attachment.path,
    content_type: attachment.contentType,
    content_id: attachment.contentId
  }));
}
function parseEmailToApiOptions(email) {
  return {
    attachments: parseAttachments(email.attachments),
    bcc: email.bcc,
    cc: email.cc,
    from: email.from,
    headers: email.headers,
    html: email.html,
    reply_to: email.replyTo,
    scheduled_at: email.scheduledAt,
    subject: email.subject,
    tags: email.tags,
    text: email.text,
    to: email.to,
    template: email.template ? {
      id: email.template.id,
      variables: email.template.variables
    } : void 0,
    topic_id: email.topicId
  };
}
async function render(node) {
  let render2;
  try {
    ({ render: render2 } = await import("@react-email/render"));
  } catch {
    throw new Error("Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`.");
  }
  return render2(node);
}
var Batch$1 = class {
  constructor(resend) {
    this.resend = resend;
  }
  async send(payload, requestOptions) {
    return this.create(payload, requestOptions);
  }
  async create(payload, requestOptions) {
    const emails = [];
    for (const email of payload) {
      const body = { ...email };
      if (body.react) {
        body.html = await render(body.react);
        body.react = void 0;
      }
      emails.push(parseEmailToApiOptions(body));
    }
    const headers = new Headers({ "x-batch-validation": requestOptions?.batchValidation ?? "strict" });
    for (const [key, value] of new Headers(requestOptions?.headers || void 0)) headers.set(key, value);
    return await this.resend.post("/emails/batch", emails, {
      ...requestOptions,
      headers
    });
  }
};
var Broadcasts = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, requestOptions = {}) {
    const html = payload.react ? await render(payload.react) : payload.html;
    return await this.resend.post("/broadcasts", {
      name: payload.name,
      segment_id: payload.segmentId,
      audience_id: payload.audienceId,
      preview_text: payload.previewText,
      from: payload.from,
      html,
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      topic_id: payload.topicId,
      send: payload.send,
      scheduled_at: payload.scheduledAt
    }, requestOptions);
  }
  async send(id, payload, requestOptions = {}) {
    return await this.resend.post(`/broadcasts/${id}/send`, { scheduled_at: payload?.scheduledAt }, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/broadcasts", options);
    return await this.resend.get(url, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/broadcasts/${id}`, requestOptions);
  }
  async recipients(id, options, requestOptions = {}) {
    const url = `/broadcasts/${id}/recipients?${buildRecipientsQuery(options)}`;
    return await this.resend.get(url, requestOptions);
  }
  async clickedLinks(id, options = {}, requestOptions = {}) {
    const url = buildPaginationUrl(`/broadcasts/${id}/clicked-links`, options);
    return await this.resend.get(url, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    return await this.resend.delete(`/broadcasts/${id}`, void 0, requestOptions);
  }
  async cancel(id, requestOptions = {}) {
    return await this.resend.post(`/broadcasts/${id}/cancel`, void 0, requestOptions);
  }
  async duplicate(id, requestOptions = {}) {
    return await this.resend.post(`/broadcasts/${id}/duplicate`, void 0, requestOptions);
  }
  async update(id, payload, requestOptions = {}) {
    const html = payload.react ? await render(payload.react) : payload.html;
    return await this.resend.patch(`/broadcasts/${id}`, {
      name: payload.name,
      segment_id: payload.segmentId,
      audience_id: payload.audienceId,
      from: payload.from,
      html,
      text: payload.text,
      subject: payload.subject,
      reply_to: payload.replyTo,
      preview_text: payload.previewText,
      topic_id: payload.topicId
    }, requestOptions);
  }
};
function buildRecipientsQuery(options) {
  const { type, email, bounceType, ...pagination } = options;
  const searchParams = new URLSearchParams(buildPaginationQuery(pagination));
  searchParams.set("type", type);
  if (email !== void 0) searchParams.set("email", email);
  if (bounceType !== void 0) searchParams.set("bounce_type", bounceType);
  return searchParams.toString();
}
var DOT_SEGMENT = /^(?:\.|%2e){1,2}$/i;
function stripIgnoredCharacters(requestPath) {
  let path = requestPath.replace(/[\t\n\r]/g, "");
  while (path.length > 0 && path.charCodeAt(path.length - 1) <= 32) path = path.slice(0, -1);
  return path;
}
function hasDotSegment(requestPath) {
  const [pathname] = stripIgnoredCharacters(requestPath).split(/[?#]/);
  return pathname.split(/[\\/]/).some((segment) => DOT_SEGMENT.test(segment));
}
function parseContactPropertyFromApi(contactProperty) {
  return {
    id: contactProperty.id,
    key: contactProperty.key,
    createdAt: contactProperty.created_at,
    type: contactProperty.type,
    fallbackValue: contactProperty.fallback_value
  };
}
function parseContactPropertyToApiOptions(contactProperty) {
  if ("key" in contactProperty) return {
    key: contactProperty.key,
    type: contactProperty.type,
    fallback_value: contactProperty.fallbackValue
  };
  return { fallback_value: contactProperty.fallbackValue };
}
var ContactProperties = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(options, requestOptions = {}) {
    const apiOptions = parseContactPropertyToApiOptions(options);
    return await this.resend.post("/contact-properties", apiOptions, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/contact-properties", options);
    const response = await this.resend.get(url, requestOptions);
    if (response.data) return {
      data: {
        ...response.data,
        data: response.data.data.map((apiContactProperty) => parseContactPropertyFromApi(apiContactProperty))
      },
      headers: response.headers,
      error: null
    };
    return response;
  }
  async get(id, requestOptions = {}) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const response = await this.resend.get(`/contact-properties/${id}`, requestOptions);
    if (response.data) return {
      data: {
        object: "contact_property",
        ...parseContactPropertyFromApi(response.data)
      },
      headers: response.headers,
      error: null
    };
    return response;
  }
  async update(payload, requestOptions = {}) {
    if (!payload.id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const apiOptions = parseContactPropertyToApiOptions(payload);
    return await this.resend.patch(`/contact-properties/${payload.id}`, apiOptions, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.delete(`/contact-properties/${id}`, void 0, requestOptions);
  }
};
var ContactImports = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, requestOptions = {}) {
    const formData = this.buildCreateFormData(payload);
    return this.resend.post("/contacts/imports", formData, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const searchParams = new URLSearchParams(buildPaginationQuery(options));
    if (options.status !== void 0) searchParams.set("status", options.status);
    const queryString = searchParams.toString();
    const url = queryString ? `/contacts/imports?${queryString}` : "/contacts/imports";
    return this.resend.get(url, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return this.resend.get(`/contacts/imports/${id}`, requestOptions);
  }
  buildCreateFormData(payload) {
    const formData = new FormData();
    formData.append("file", payload.file);
    this.appendField(formData, "column_map", this.buildColumnMap(payload.columnMap ?? null));
    this.appendField(formData, "on_conflict", payload.onConflict ?? null);
    this.appendField(formData, "segments", payload.segments ?? null);
    this.appendField(formData, "topics", payload.topics ?? null);
    return formData;
  }
  buildColumnMap(columnMap) {
    if (columnMap === null) return null;
    return {
      email: columnMap.email,
      first_name: columnMap.firstName,
      last_name: columnMap.lastName,
      unsubscribed: columnMap.unsubscribed,
      properties: columnMap.properties
    };
  }
  appendField(formData, name, value) {
    if (value === null) return;
    formData.append(name, typeof value === "string" ? value : JSON.stringify(value));
  }
};
var ContactSegments = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options, requestOptions = {}) {
    if (!options.contactId && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const url = buildPaginationUrl(`/contacts/${options.email ? options.email : options.contactId}/segments`, options);
    return await this.resend.get(url, requestOptions);
  }
  async add(options, requestOptions = {}) {
    if (!options.contactId && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = options.email ? options.email : options.contactId;
    return this.resend.post(`/contacts/${identifier}/segments/${options.segmentId}`, void 0, requestOptions);
  }
  async remove(options, requestOptions = {}) {
    if (!options.contactId && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = options.email ? options.email : options.contactId;
    return this.resend.delete(`/contacts/${identifier}/segments/${options.segmentId}`, void 0, requestOptions);
  }
};
var ContactTopics = class {
  constructor(resend) {
    this.resend = resend;
  }
  async update(payload, requestOptions = {}) {
    if (!payload.id && !payload.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = payload.email ? payload.email : payload.id;
    return this.resend.patch(`/contacts/${identifier}/topics`, payload.topics, requestOptions);
  }
  async list(options, requestOptions = {}) {
    if (!options.id && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const url = buildPaginationUrl(`/contacts/${options.email ? options.email : options.id}/topics`, options);
    return this.resend.get(url, requestOptions);
  }
};
function isLegacyCreateContactOptions(payload) {
  return "audienceId" in payload && Boolean(payload.audienceId);
}
var Contacts = class {
  constructor(resend) {
    this.resend = resend;
    this.imports = new ContactImports(this.resend);
    this.topics = new ContactTopics(this.resend);
    this.segments = new ContactSegments(this.resend);
  }
  async create(payload, requestOptions = {}) {
    if (isLegacyCreateContactOptions(payload)) {
      if ("segments" in payload || "topics" in payload) return {
        data: null,
        headers: null,
        error: {
          message: "`audienceId` is deprecated, and cannot be used together with `segments` or `topics`. Use `segments` instead to add one or more segments to the new contact.",
          statusCode: null,
          name: "invalid_parameter"
        }
      };
      return await this.resend.post(`/audiences/${payload.audienceId}/contacts`, {
        unsubscribed: payload.unsubscribed,
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        properties: payload.properties
      }, requestOptions);
    }
    return await this.resend.post("/contacts", {
      unsubscribed: payload.unsubscribed,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      properties: payload.properties,
      segments: payload.segments,
      topics: payload.topics
    }, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const segmentId = options.segmentId ?? options.audienceId;
    if (!segmentId) {
      const url2 = buildPaginationUrl("/contacts", options);
      return await this.resend.get(url2, requestOptions);
    }
    const url = buildPaginationUrl(`/segments/${segmentId}/contacts`, options);
    return await this.resend.get(url, requestOptions);
  }
  async get(options, requestOptions = {}) {
    if (typeof options === "string") return this.resend.get(`/contacts/${options}`, requestOptions);
    if (!options.id && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    if (!options.audienceId) return this.resend.get(`/contacts/${options?.email ? options?.email : options?.id}`, requestOptions);
    return this.resend.get(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`, requestOptions);
  }
  async update(options, requestOptions = {}) {
    if (!options.id && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    if (!options.audienceId) return await this.resend.patch(`/contacts/${options?.email ? options?.email : options?.id}`, {
      unsubscribed: options.unsubscribed,
      first_name: options.firstName,
      last_name: options.lastName,
      properties: options.properties
    }, requestOptions);
    return await this.resend.patch(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`, {
      unsubscribed: options.unsubscribed,
      first_name: options.firstName,
      last_name: options.lastName,
      properties: options.properties
    }, requestOptions);
  }
  async remove(payload, requestOptions = {}) {
    if (typeof payload === "string") return this.resend.delete(`/contacts/${payload}`, void 0, requestOptions);
    if (!payload.id && !payload.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    if (!payload.audienceId) return this.resend.delete(`/contacts/${payload?.email ? payload?.email : payload?.id}`, void 0, requestOptions);
    return this.resend.delete(`/audiences/${payload.audienceId}/contacts/${payload?.email ? payload?.email : payload?.id}`, void 0, requestOptions);
  }
};
function parseDomainToApiOptions(domain) {
  return {
    name: domain.name,
    region: domain.region,
    custom_return_path: domain.customReturnPath,
    capabilities: domain.capabilities,
    open_tracking: domain.openTracking,
    click_tracking: domain.clickTracking,
    tls: domain.tls,
    tracking_subdomain: domain.trackingSubdomain
  };
}
var DomainClaims = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/domains/claim", {
      name: payload.name,
      region: payload.region,
      custom_return_path: payload.customReturnPath,
      open_tracking: payload.openTracking,
      click_tracking: payload.clickTracking,
      tracking_subdomain: payload.trackingSubdomain
    }, requestOptions);
  }
  async get(domainId, requestOptions = {}) {
    return await this.resend.get(`/domains/${domainId}/claim`, requestOptions);
  }
  async verify(domainId, requestOptions = {}) {
    return await this.resend.post(`/domains/${domainId}/claim/verify`, void 0, requestOptions);
  }
};
var Domains = class {
  constructor(resend) {
    this.resend = resend;
    this.claims = new DomainClaims(this.resend);
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/domains", parseDomainToApiOptions(payload), requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/domains", options);
    return await this.resend.get(url, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/domains/${id}`, requestOptions);
  }
  async update(payload, requestOptions = {}) {
    return await this.resend.patch(`/domains/${payload.id}`, {
      click_tracking: payload.clickTracking,
      open_tracking: payload.openTracking,
      tls: payload.tls,
      capabilities: payload.capabilities,
      tracking_subdomain: payload.trackingSubdomain
    }, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    return await this.resend.delete(`/domains/${id}`, void 0, requestOptions);
  }
  async verify(id, requestOptions = {}) {
    return await this.resend.post(`/domains/${id}/verify`, void 0, requestOptions);
  }
};
var Attachments$1 = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(options, requestOptions = {}) {
    const { emailId, id } = options;
    return await this.resend.get(`/emails/${emailId}/attachments/${id}`, requestOptions);
  }
  async list(options, requestOptions = {}) {
    const { emailId } = options;
    const url = buildPaginationUrl(`/emails/${emailId}/attachments`, options);
    return await this.resend.get(url, requestOptions);
  }
};
var Attachments = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(options, requestOptions = {}) {
    const { emailId, id } = options;
    return await this.resend.get(`/emails/receiving/${emailId}/attachments/${id}`, requestOptions);
  }
  async list(options, requestOptions = {}) {
    const { emailId } = options;
    const url = buildPaginationUrl(`/emails/receiving/${emailId}/attachments`, options);
    return await this.resend.get(url, requestOptions);
  }
};
var Receiving = class {
  constructor(resend) {
    this.resend = resend;
    this.attachments = new Attachments(resend);
  }
  async get(id, options = {}, requestOptions = {}) {
    const searchParams = new URLSearchParams();
    if (options.html_format !== void 0) searchParams.set("html_format", options.html_format);
    const queryString = searchParams.toString();
    const path = queryString ? `/emails/receiving/${id}?${queryString}` : `/emails/receiving/${id}`;
    return await this.resend.get(path, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/emails/receiving", options);
    return await this.resend.get(url, requestOptions);
  }
  async forward(options, requestOptions = {}) {
    const { emailId, to, from } = options;
    const passthrough = options.passthrough !== false;
    const emailResponse = await this.get(emailId, {}, { signal: requestOptions.signal });
    if (emailResponse.error) return {
      data: null,
      error: emailResponse.error,
      headers: emailResponse.headers
    };
    const email = emailResponse.data;
    const originalSubject = email.subject || "(no subject)";
    if (passthrough) return this.forwardPassthrough(email, {
      to,
      from,
      subject: originalSubject
    }, requestOptions);
    const forwardSubject = originalSubject.startsWith("Fwd:") ? originalSubject : `Fwd: ${originalSubject}`;
    return this.forwardWrapped(email, {
      to,
      from,
      subject: forwardSubject,
      text: "text" in options ? options.text : void 0,
      html: "html" in options ? options.html : void 0
    }, requestOptions);
  }
  async forwardPassthrough(email, options, requestOptions) {
    const { to, from, subject } = options;
    if (!email.raw?.download_url) return {
      data: null,
      error: {
        name: "validation_error",
        message: "Raw email content is not available for this email",
        statusCode: 400
      },
      headers: null
    };
    const raw = await this.downloadRaw(email.raw.download_url, requestOptions.signal);
    if (raw.error) return {
      data: null,
      error: raw.error,
      headers: null
    };
    const parsed = await PostalMime.parse(raw.content, { attachmentEncoding: "base64" });
    const attachments = parsed.attachments.map((attachment) => {
      const contentId = attachment.contentId ? attachment.contentId.replace(/^<|>$/g, "") : void 0;
      return {
        filename: attachment.filename,
        content: attachment.content.toString(),
        content_type: attachment.mimeType,
        content_id: contentId || void 0
      };
    });
    return await this.resend.post("/emails", {
      from,
      to,
      subject,
      text: parsed.text || void 0,
      html: parsed.html || void 0,
      attachments: attachments.length > 0 ? attachments : void 0
    }, requestOptions);
  }
  async forwardWrapped(email, options, requestOptions) {
    const { to, from, subject, text, html } = options;
    if (!email.raw?.download_url) return {
      data: null,
      error: {
        name: "validation_error",
        message: "Raw email content is not available for this email",
        statusCode: 400
      },
      headers: null
    };
    const raw = await this.downloadRaw(email.raw.download_url, requestOptions.signal);
    if (raw.error) return {
      data: null,
      error: raw.error,
      headers: null
    };
    return await this.resend.post("/emails", {
      from,
      to,
      subject,
      text,
      html,
      attachments: [{
        filename: "forwarded_message.eml",
        content: Buffer.from(raw.content).toString("base64"),
        content_type: "message/rfc822"
      }]
    }, requestOptions);
  }
  async downloadRaw(url, signal) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) return {
        content: null,
        error: {
          name: "application_error",
          message: "Failed to download raw email content",
          statusCode: response.status
        }
      };
      return {
        content: await response.arrayBuffer(),
        error: null
      };
    } catch {
      return {
        content: null,
        error: {
          name: "application_error",
          message: "Failed to download raw email content",
          statusCode: null
        }
      };
    }
  }
};
var Emails = class {
  constructor(resend) {
    this.resend = resend;
    this.attachments = new Attachments$1(resend);
    this.receiving = new Receiving(resend);
  }
  async send(payload, requestOptions = {}) {
    return this.create(payload, requestOptions);
  }
  async create(payload, requestOptions = {}) {
    const body = { ...payload };
    if (payload.react) body.html = await render(payload.react);
    return await this.resend.post("/emails", parseEmailToApiOptions(body), requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/emails/${id}`, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/emails", options);
    return await this.resend.get(url, requestOptions);
  }
  async update(payload, requestOptions = {}) {
    return await this.resend.patch(`/emails/${payload.id}`, { scheduled_at: payload.scheduledAt }, requestOptions);
  }
  async cancel(id, requestOptions = {}) {
    return await this.resend.post(`/emails/${id}/cancel`, void 0, requestOptions);
  }
  async share(id, payload, requestOptions = {}) {
    return await this.resend.post(`/emails/${id}/share`, { expires_in: payload?.expiresIn }, requestOptions);
  }
  async metrics(options = {}, requestOptions = {}) {
    const queryString = buildMetricsQuery(options);
    const url = queryString ? `/emails/metrics?${queryString}` : "/emails/metrics";
    return await this.resend.get(url, requestOptions);
  }
};
function buildMetricsQuery(options) {
  const params = {
    start_date: options.startDate,
    end_date: options.endDate,
    timezone: options.timezone,
    granularity: options.granularity,
    metrics: options.metrics?.join(","),
    dimensions: options.dimensions?.join(","),
    domain_id: options.domainId?.join(","),
    email_id: options.emailId?.join(","),
    broadcast_id: options.broadcastId?.join(",")
  };
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== void 0 && value !== "") searchParams.set(key, value);
  return searchParams.toString();
}
var Events$1 = class {
  constructor(resend) {
    this.resend = resend;
  }
  async send(payload, requestOptions = {}) {
    return await this.resend.post("/events/send", parseEventToApiOptions(payload), requestOptions);
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/events", payload, requestOptions);
  }
  async get(identifier, requestOptions = {}) {
    return await this.resend.get(`/events/${encodeURIComponent(identifier)}`, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/events", options);
    return await this.resend.get(url, requestOptions);
  }
  async update(identifier, payload, requestOptions = {}) {
    return await this.resend.patch(`/events/${encodeURIComponent(identifier)}`, payload, requestOptions);
  }
  async remove(identifier, requestOptions = {}) {
    return await this.resend.delete(`/events/${encodeURIComponent(identifier)}`, void 0, requestOptions);
  }
};
function buildInboxPath(selector) {
  const idOrEmail = selector?.inboxId ?? selector?.emailAddress;
  return idOrEmail ? `/inboxes/${encodeURIComponent(idOrEmail)}` : void 0;
}
var missingInboxError = () => ({
  data: null,
  headers: null,
  error: {
    message: "Missing `inboxId` or `emailAddress` field.",
    statusCode: null,
    name: "missing_required_field"
  }
});
var InboxAgent = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.get(`${inboxPath}/agent`, requestOptions);
  }
  async update(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { instructions, tone, actions } = options;
    return this.resend.patch(`${inboxPath}/agent`, {
      instructions,
      tone,
      actions
    }, requestOptions);
  }
};
function buildInboxCursorUrl(base, options = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(options)) {
    if (value === void 0) continue;
    searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}
var InboxDrafts = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { limit, after, before } = options;
    const url = buildInboxCursorUrl(`${inboxPath}/drafts`, {
      limit,
      after,
      before
    });
    return this.resend.get(url, requestOptions);
  }
  async create(payload, options = {}) {
    const inboxPath = buildInboxPath(payload);
    if (!inboxPath) return missingInboxError();
    const { inboxId, emailAddress, threadId, replyToEmailId, attachments, ...content } = payload;
    return this.resend.post(`${inboxPath}/drafts`, {
      ...content,
      attachments: parseAttachments(attachments),
      thread_id: threadId,
      reply_to_email_id: replyToEmailId
    }, options);
  }
  async get(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.get(`${inboxPath}/drafts/${options.draftId}`, requestOptions);
  }
  async update(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { inboxId, emailAddress, draftId, attachments, ...content } = options;
    return this.resend.patch(`${inboxPath}/drafts/${draftId}`, {
      ...content,
      attachments: attachments === null ? null : parseAttachments(attachments)
    }, requestOptions);
  }
  async remove(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.delete(`${inboxPath}/drafts/${options.draftId}`, void 0, requestOptions);
  }
  async send(payload, options = {}) {
    const inboxPath = buildInboxPath(payload);
    if (!inboxPath) return missingInboxError();
    const { draftId, headers } = payload;
    return this.resend.post(`${inboxPath}/drafts/${draftId}/send`, headers ? { headers } : void 0, options);
  }
};
var InboxLabels = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.get(`${inboxPath}/labels`, requestOptions);
  }
  async create(payload, options = {}) {
    const inboxPath = buildInboxPath(payload);
    if (!inboxPath) return missingInboxError();
    const { name, color } = payload;
    return this.resend.post(`${inboxPath}/labels`, {
      name,
      color
    }, options);
  }
  async update(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { labelId, name, color } = options;
    return this.resend.patch(`${inboxPath}/labels/${labelId}`, {
      name,
      color
    }, requestOptions);
  }
  async remove(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.delete(`${inboxPath}/labels/${options.labelId}`, void 0, requestOptions);
  }
};
var InboxThreadEmails = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { inboxId, emailAddress, threadId, ...pagination } = options;
    const url = buildPaginationUrl(`${inboxPath}/threads/${threadId}/emails`, pagination);
    return this.resend.get(url, requestOptions);
  }
  async get(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { threadId, emailId } = options;
    return this.resend.get(`${inboxPath}/threads/${threadId}/emails/${emailId}`, requestOptions);
  }
  async reply(payload, options = {}) {
    const inboxPath = buildInboxPath(payload);
    if (!inboxPath) return missingInboxError();
    const { threadId, emailId, cc, bcc, html, text, subject, replyAll, attachments, headers } = payload;
    return this.resend.post(`${inboxPath}/threads/${threadId}/emails/${emailId}/reply`, {
      cc,
      bcc,
      html,
      text,
      subject,
      reply_all: replyAll,
      attachments: parseAttachments(attachments),
      headers
    }, options);
  }
  async forward(payload, options = {}) {
    const inboxPath = buildInboxPath(payload);
    if (!inboxPath) return missingInboxError();
    const { threadId, emailId, to, cc, bcc, html, text, subject, attachments, headers } = payload;
    return this.resend.post(`${inboxPath}/threads/${threadId}/emails/${emailId}/forward`, {
      to,
      cc,
      bcc,
      html,
      text,
      subject,
      attachments: parseAttachments(attachments),
      headers
    }, options);
  }
};
var InboxThreadLabels = class {
  constructor(resend) {
    this.resend = resend;
  }
  async add(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { threadId, labels } = options;
    return this.resend.post(`${inboxPath}/threads/${threadId}/labels`, { labels }, requestOptions);
  }
  async set(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { threadId, labels } = options;
    return this.resend.put(`${inboxPath}/threads/${threadId}/labels`, { labels }, requestOptions);
  }
  async remove(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { threadId, labelId } = options;
    return this.resend.delete(`${inboxPath}/threads/${threadId}/labels/${labelId}`, void 0, requestOptions);
  }
};
var InboxThreads = class {
  constructor(resend) {
    this.resend = resend;
    this.emails = new InboxThreadEmails(resend);
    this.labels = new InboxThreadLabels(resend);
  }
  async list(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { folders, labels, read, limit, after, before } = options;
    const url = buildInboxCursorUrl(`${inboxPath}/threads`, {
      folders,
      labels,
      read,
      limit,
      after,
      before
    });
    return this.resend.get(url, requestOptions);
  }
  async search(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { folders, labels, read, query, from, to, cc, bcc, hasAttachment, startDate, endDate, limit, after, before } = options;
    const url = buildInboxCursorUrl(`${inboxPath}/threads/search`, {
      folders,
      labels,
      read,
      query,
      from,
      to,
      cc,
      bcc,
      has_attachment: hasAttachment,
      start_date: startDate,
      end_date: endDate,
      limit,
      after,
      before
    });
    return this.resend.get(url, requestOptions);
  }
  async get(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.get(`${inboxPath}/threads/${options.threadId}`, requestOptions);
  }
  async update(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    const { threadId, read, folder } = options;
    return this.resend.patch(`${inboxPath}/threads/${threadId}`, {
      read,
      folder
    }, requestOptions);
  }
  async remove(options, requestOptions = {}) {
    const inboxPath = buildInboxPath(options);
    if (!inboxPath) return missingInboxError();
    return this.resend.delete(`${inboxPath}/threads/${options.threadId}`, void 0, requestOptions);
  }
};
var Inboxes = class {
  constructor(resend) {
    this.resend = resend;
    this.threads = new InboxThreads(resend);
    this.labels = new InboxLabels(resend);
    this.drafts = new InboxDrafts(resend);
    this.agent = new InboxAgent(resend);
  }
  async create(payload, options = {}) {
    return this.resend.post("/inboxes", {
      email_address: payload.emailAddress,
      name: payload.name,
      forwarding: payload.forwarding,
      from_name: payload.fromName
    }, options);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/inboxes", options);
    return this.resend.get(url, requestOptions);
  }
  async get(idOrEmail, requestOptions = {}) {
    return this.resend.get(`/inboxes/${encodeURIComponent(idOrEmail)}`, requestOptions);
  }
  async update(idOrEmail, payload, requestOptions = {}) {
    return this.resend.patch(`/inboxes/${encodeURIComponent(idOrEmail)}`, {
      name: payload.name,
      from_name: payload.fromName
    }, requestOptions);
  }
  async remove(idOrEmail, requestOptions = {}) {
    return this.resend.delete(`/inboxes/${encodeURIComponent(idOrEmail)}`, void 0, requestOptions);
  }
};
var Logs = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/logs", options);
    return await this.resend.get(url, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/logs/${id}`, requestOptions);
  }
};
var OAuthGrants = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/oauth/grants", options);
    return await this.resend.get(url, requestOptions);
  }
  async revoke(id, requestOptions = {}) {
    return await this.resend.delete(`/oauth/grants/${id}`, void 0, requestOptions);
  }
};
var Segments = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/segments", payload, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/segments", options);
    return await this.resend.get(url, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/segments/${id}`, requestOptions);
  }
  async update(id, payload, requestOptions = {}) {
    return await this.resend.patch(`/segments/${id}`, payload, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    return await this.resend.delete(`/segments/${id}`, void 0, requestOptions);
  }
};
var Batch = class {
  constructor(resend) {
    this.resend = resend;
  }
  async add(options, requestOptions = {}) {
    return this.resend.post("/suppressions/batch/add", options, requestOptions);
  }
  async remove(options, requestOptions = {}) {
    return this.resend.post("/suppressions/batch/remove", options, requestOptions);
  }
};
var missingIdentifierError = () => ({
  data: null,
  headers: null,
  error: {
    message: "Missing `id` field.",
    statusCode: null,
    name: "missing_required_field"
  }
});
var Suppressions = class {
  constructor(resend) {
    this.resend = resend;
    this.batch = new Batch(resend);
  }
  async add(options, requestOptions = {}) {
    return this.resend.post("/suppressions", options, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const queryString = buildSuppressionsQuery(options);
    const url = queryString ? `/suppressions?${queryString}` : "/suppressions";
    return this.resend.get(url, requestOptions);
  }
  async get(idOrEmail, requestOptions = {}) {
    if (!idOrEmail) return missingIdentifierError();
    return this.resend.get(`/suppressions/${encodeURIComponent(idOrEmail)}`, requestOptions);
  }
  async remove(idOrEmail, requestOptions = {}) {
    if (!idOrEmail) return missingIdentifierError();
    return this.resend.delete(`/suppressions/${encodeURIComponent(idOrEmail)}`, void 0, requestOptions);
  }
};
function buildSuppressionsQuery(options) {
  const { origin, ...pagination } = options;
  const searchParams = new URLSearchParams(buildPaginationQuery(pagination));
  if (origin) searchParams.set("origin", origin);
  return searchParams.toString();
}
function getPaginationQueryProperties(options = {}) {
  const query = new URLSearchParams();
  if (options.before) query.set("before", options.before);
  if (options.after) query.set("after", options.after);
  if (options.limit) query.set("limit", options.limit.toString());
  return query.size > 0 ? `?${query.toString()}` : "";
}
function parseVariables(variables) {
  return variables?.map((variable) => ({
    key: variable.key,
    type: variable.type,
    fallback_value: variable.fallbackValue
  }));
}
function parseTemplateToApiOptions(template) {
  return {
    name: "name" in template ? template.name : void 0,
    subject: template.subject,
    html: template.html,
    text: template.text,
    alias: template.alias,
    from: template.from,
    reply_to: template.replyTo,
    variables: parseVariables(template.variables)
  };
}
var ChainableTemplateResult = class {
  constructor(promise, publishFn) {
    this.promise = promise;
    this.publishFn = publishFn;
  }
  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }
  async publish(requestOptions = {}) {
    const { data, error, headers } = await this.promise;
    if (error) return {
      data: null,
      headers,
      error
    };
    return this.publishFn(data.id, requestOptions);
  }
};
var Templates = class {
  constructor(resend) {
    this.resend = resend;
  }
  create(payload, requestOptions = {}) {
    return new ChainableTemplateResult(this.performCreate(payload, requestOptions), this.publish.bind(this));
  }
  async performCreate(payload, requestOptions) {
    const body = { ...payload };
    if (payload.react) body.html = await render(payload.react);
    return this.resend.post("/templates", parseTemplateToApiOptions(body), requestOptions);
  }
  async remove(identifier, requestOptions = {}) {
    return await this.resend.delete(`/templates/${identifier}`, void 0, requestOptions);
  }
  async get(identifier, requestOptions = {}) {
    return await this.resend.get(`/templates/${identifier}`, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    return this.resend.get(`/templates${getPaginationQueryProperties(options)}`, requestOptions);
  }
  duplicate(identifier, requestOptions = {}) {
    return new ChainableTemplateResult(this.resend.post(`/templates/${identifier}/duplicate`, void 0, requestOptions), this.publish.bind(this));
  }
  async publish(identifier, requestOptions = {}) {
    return await this.resend.post(`/templates/${identifier}/publish`, void 0, requestOptions);
  }
  async update(identifier, payload, requestOptions = {}) {
    return await this.resend.patch(`/templates/${identifier}`, parseTemplateToApiOptions(payload), requestOptions);
  }
};
var Topics = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, requestOptions = {}) {
    const { defaultSubscription, ...body } = payload;
    return await this.resend.post("/topics", {
      ...body,
      default_subscription: defaultSubscription
    }, requestOptions);
  }
  async list(requestOptions = {}) {
    return await this.resend.get("/topics", requestOptions);
  }
  async get(id, requestOptions = {}) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.get(`/topics/${id}`, requestOptions);
  }
  async update(payload, requestOptions = {}) {
    if (!payload.id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.patch(`/topics/${payload.id}`, payload, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.delete(`/topics/${id}`, void 0, requestOptions);
  }
};
var Usage = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(requestOptions = {}) {
    return await this.resend.get("/usage", requestOptions);
  }
};
var Attempts = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options, requestOptions = {}) {
    const { webhookId, eventId } = options;
    const url = buildPaginationUrl(`/webhooks/${webhookId}/events/${eventId}/attempts`, options);
    return await this.resend.get(url, requestOptions);
  }
};
var Events = class {
  constructor(resend) {
    this.resend = resend;
    this.attempts = new Attempts(resend);
  }
  async list(options, requestOptions = {}) {
    const { webhookId } = options;
    const url = buildPaginationUrl(`/webhooks/${webhookId}/events`, options);
    return await this.resend.get(url, requestOptions);
  }
  async get(options, requestOptions = {}) {
    const { webhookId, eventId } = options;
    return await this.resend.get(`/webhooks/${webhookId}/events/${eventId}`, requestOptions);
  }
  async replay(options, requestOptions = {}) {
    const { webhookId, eventId } = options;
    return await this.resend.post(`/webhooks/${webhookId}/events/${eventId}/replay`, void 0, requestOptions);
  }
};
var Webhooks = class {
  constructor(resend) {
    this.resend = resend;
    this.events = new Events(resend);
  }
  async create(payload, requestOptions = {}) {
    return await this.resend.post("/webhooks", payload, requestOptions);
  }
  async get(id, requestOptions = {}) {
    return await this.resend.get(`/webhooks/${id}`, requestOptions);
  }
  async list(options = {}, requestOptions = {}) {
    const url = buildPaginationUrl("/webhooks", options);
    return await this.resend.get(url, requestOptions);
  }
  async update(id, payload, requestOptions = {}) {
    return await this.resend.patch(`/webhooks/${id}`, payload, requestOptions);
  }
  async remove(id, requestOptions = {}) {
    return await this.resend.delete(`/webhooks/${id}`, void 0, requestOptions);
  }
  async rotateSigningSecret(id, requestOptions = {}) {
    return await this.resend.post(`/webhooks/${id}/signing-secret/rotate`, void 0, requestOptions);
  }
  verify(payload) {
    return new import_standardwebhooks.Webhook(payload.webhookSecret).verify(payload.payload, {
      "webhook-id": payload.headers.id,
      "webhook-timestamp": payload.headers.timestamp,
      "webhook-signature": payload.headers.signature
    });
  }
};
var defaultBaseUrl = "https://api.resend.com";
var defaultUserAgent = `resend-node:${version}`;
function getDefaultBaseUrl() {
  return typeof process !== "undefined" && process.env ? process.env.RESEND_BASE_URL || defaultBaseUrl : defaultBaseUrl;
}
function getDefaultUserAgent() {
  return typeof process !== "undefined" && process.env ? process.env.RESEND_USER_AGENT || defaultUserAgent : defaultUserAgent;
}
function isDebugEnabled() {
  return typeof process !== "undefined" && process.env ? process.env.RESEND_DEBUG === "true" : false;
}
var Resend = class {
  constructor(key, options) {
    this.key = key;
    this.segments = new Segments(this);
    this.apiKeys = new ApiKeys(this);
    this.audiences = this.segments;
    this.automations = new Automations(this);
    this.batch = new Batch$1(this);
    this.broadcasts = new Broadcasts(this);
    this.contactProperties = new ContactProperties(this);
    this.contacts = new Contacts(this);
    this.domains = new Domains(this);
    this.emails = new Emails(this);
    this.events = new Events$1(this);
    this.inboxes = new Inboxes(this);
    this.logs = new Logs(this);
    this.oauthGrants = new OAuthGrants(this);
    this.suppressions = new Suppressions(this);
    this.templates = new Templates(this);
    this.topics = new Topics(this);
    this.usage = new Usage(this);
    this.webhooks = new Webhooks(this);
    if (!key) {
      if (typeof process !== "undefined" && process.env) this.key = process.env.RESEND_API_KEY;
      if (!this.key) throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
    }
    this.baseUrl = options?.baseUrl ?? getDefaultBaseUrl();
    this.userAgent = options?.userAgent ?? getDefaultUserAgent();
    this.debug = isDebugEnabled();
    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "User-Agent": this.userAgent,
      "Content-Type": "application/json"
    });
  }
  logError(error, path, status) {
    if (!this.debug) return;
    console.error("[Resend API Error]:", {
      ...status !== void 0 && { status },
      error,
      path
    });
  }
  async fetchRequest(path, options = {}) {
    if (hasDotSegment(path)) return {
      data: null,
      error: {
        message: "Path parameters cannot be `.` or `..`.",
        statusCode: null,
        name: "invalid_parameter"
      },
      headers: null
    };
    const { signal } = options;
    try {
      const response = await fetch(`${this.baseUrl}${path}`, options);
      if (!response.ok) try {
        const rawError = await response.text();
        const parsedError = JSON.parse(rawError);
        this.logError(parsedError, path, response.status);
        return {
          data: null,
          error: parsedError,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (err) {
        if (signal?.aborted && err === signal.reason) throw err;
        if (err instanceof SyntaxError) {
          const error2 = {
            name: "application_error",
            statusCode: response.status,
            message: "Internal server error. We are unable to process your request right now, please try again later."
          };
          this.logError(error2, path, response.status);
          return {
            data: null,
            error: error2,
            headers: Object.fromEntries(response.headers.entries())
          };
        }
        const error = {
          message: response.statusText,
          statusCode: response.status,
          name: "application_error"
        };
        if (err instanceof Error) {
          const errorWithMessage = {
            ...error,
            message: err.message
          };
          this.logError(errorWithMessage, path, response.status);
          return {
            data: null,
            error: errorWithMessage,
            headers: Object.fromEntries(response.headers.entries())
          };
        }
        this.logError(error, path, response.status);
        return {
          data: null,
          error,
          headers: Object.fromEntries(response.headers.entries())
        };
      }
      return {
        data: await response.json(),
        error: null,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch {
      const error = {
        name: "application_error",
        statusCode: null,
        message: "Unable to fetch data. The request could not be resolved."
      };
      this.logError(error, path);
      return {
        data: null,
        error,
        headers: null
      };
    }
  }
  async post(path, entity, options = {}) {
    const headers = new Headers(this.headers);
    const isFormData = typeof FormData !== "undefined" && entity instanceof FormData;
    if (isFormData) headers.delete("Content-Type");
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
    const requestOptions = {
      method: "POST",
      body: isFormData ? entity : JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async get(path, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "GET",
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async put(path, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "PUT",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async patch(path, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "PATCH",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async delete(path, query, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "DELETE",
      body: query === void 0 ? void 0 : JSON.stringify(query),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
};

// src/lib/email/provider-resend.server.ts
var THROTTLE_MS = 260;
function client2() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EmailProviderConfigError("RESEND_API_KEY is not configured.");
  return new Resend(apiKey);
}
function isTransient(error) {
  if (!error) return false;
  const status = error.statusCode ?? 0;
  return status === 429 || status >= 500 || /rate.?limit|too many/i.test(error.message);
}
function retry(label, call2) {
  return withRetry(label, call2, (r) => isTransient(r.error));
}
var propertyCache = /* @__PURE__ */ new Map();
async function ensureProperties(resend, keys) {
  if (keys.length === 0) return;
  const cacheKey = [...keys].sort().join(",");
  const cached = propertyCache.get(cacheKey);
  if (cached) return cached;
  const task = (async () => {
    const existing = await retry(
      "contactProperties.list",
      () => resend.contactProperties.list({ limit: 100 })
    );
    if (existing.error)
      throw new Error(`Could not list contact properties: ${existing.error.message}`);
    const have = new Set((existing.data?.data ?? []).map((p) => p.key));
    const missing = keys.filter((k) => !have.has(k));
    for (const [index, key] of missing.entries()) {
      if (index > 0) await sleep(THROTTLE_MS);
      const created = await retry(
        `contactProperties.create(${key})`,
        () => resend.contactProperties.create({ key, type: "string", fallbackValue: null })
      );
      if (created.error && !/exist/i.test(created.error.message)) {
        throw new Error(`Could not create contact property "${key}": ${created.error.message}`);
      }
    }
  })().catch((err) => {
    propertyCache.delete(cacheKey);
    throw err;
  });
  propertyCache.set(cacheKey, task);
  return task;
}
var segmentCache = /* @__PURE__ */ new Map();
async function resolveSegmentId(resend, audience) {
  const pinEnvVar = audience.idEnvVars?.resend;
  const pinned = pinEnvVar ? process.env[pinEnvVar]?.trim() : void 0;
  if (pinned) return pinned;
  const cached = segmentCache.get(audience.name);
  if (cached) return cached;
  const list = await retry(
    "segments.list",
    () => resend.segments.list({ limit: 100 })
  );
  if (list.error) throw new Error(`Could not list segments: ${list.error.message}`);
  const found = (list.data?.data ?? []).find((s) => s.name === audience.name);
  if (found) {
    segmentCache.set(audience.name, found.id);
    return found.id;
  }
  const created = await retry(
    "segments.create",
    () => resend.segments.create({ name: audience.name })
  );
  if (created.error || !created.data?.id) {
    throw new Error(`Could not create the "${audience.name}" segment: ${created.error?.message}`);
  }
  segmentCache.set(audience.name, created.data.id);
  return created.data.id;
}
function readProperties(raw) {
  const out = {};
  for (const [key, entry] of Object.entries(raw ?? {})) {
    if (!entry) continue;
    out[key] = typeof entry.value === "string" ? entry.value : String(entry.value);
  }
  return out;
}
async function getContact(resend, email) {
  try {
    const res = await retry(
      "contacts.get",
      () => resend.contacts.get({ email })
    );
    if (res.error || !res.data) return null;
    return res.data;
  } catch {
    return null;
  }
}
function toAudienceContact2(c) {
  return {
    id: c.id,
    email: c.email,
    name: joinName(c.first_name, c.last_name) || c.email,
    attributes: readProperties(c.properties),
    createdAt: c.created_at
  };
}
var resendProvider = {
  name: "resend",
  async sendBatch(messages2) {
    if (messages2.length === 0) return [];
    const resend = client2();
    const payload = messages2.map((message) => ({
      from: formatAddress(message.from),
      to: toRecipientArray(message.to),
      subject: message.subject,
      html: message.html,
      ...message.text ? { text: message.text } : {},
      ...message.replyTo ? { replyTo: message.replyTo } : {},
      ...message.headers && Object.keys(message.headers).length > 0 ? { headers: message.headers } : {}
    }));
    const res = await resend.batch.send(payload);
    if (res.error) {
      const message = res.error.message ?? "Resend refused the batch.";
      return messages2.map(() => ({ id: null, provider: "resend", error: message }));
    }
    const ids = res.data?.data ?? [];
    return messages2.map((_, index) => ({
      id: ids[index]?.id ?? null,
      provider: "resend",
      ...ids[index]?.id ? {} : { error: "Resend did not return an id for this message." }
    }));
  },
  async send(message) {
    const resend = client2();
    const res = await retry(
      "emails.send",
      () => resend.emails.send({
        from: formatAddress(message.from),
        to: toRecipientArray(message.to),
        ...message.replyTo ? { replyTo: message.replyTo } : {},
        subject: message.subject,
        html: message.html,
        ...message.text ? { text: message.text } : {},
        // The RFC 3834 auto-reply markers travel here on this path. Kept in step with the
        // PulseAssist adapter so switching provider does not quietly un-mark automated mail.
        ...message.headers && Object.keys(message.headers).length > 0 ? { headers: message.headers } : {}
      })
    );
    if (res.error) {
      throw new EmailSendError(res.error.message, res.error.statusCode ?? null, "resend");
    }
    return { id: res.data?.id ?? null, provider: "resend" };
  },
  async findContact(email) {
    const contact = await getContact(client2(), email);
    return contact ? toAudienceContact2(contact) : null;
  },
  async upsertContact(input) {
    const resend = client2();
    const keys = Object.keys(input.attributes);
    await ensureProperties(resend, keys);
    const segmentId = await resolveSegmentId(resend, input.audience);
    const email = input.email.trim().toLowerCase();
    const existing = await getContact(resend, email);
    const { firstName, lastName } = splitName(input.name);
    if (existing) {
      const updated = await retry(
        "contacts.update",
        () => resend.contacts.update({
          email,
          // Only fill in a name if Resend does not already hold one.
          firstName: existing.first_name ?? firstName,
          lastName: existing.last_name ?? lastName,
          properties: input.attributes
        })
      );
      if (updated.error) throw new Error(`Could not update contact: ${updated.error.message}`);
      const added = await retry(
        "contacts.segments.add",
        () => resend.contacts.segments.add({ email, segmentId })
      );
      if (added.error && !/exist|already/i.test(added.error.message)) {
        throw new Error(`Could not add contact to the segment: ${added.error.message}`);
      }
      return { outcome: "updated" };
    }
    const created = await retry(
      "contacts.create",
      () => resend.contacts.create({
        email,
        firstName,
        // `create` accepts `string | undefined` while `update` accepts `string | null`.
        lastName: lastName ?? void 0,
        properties: input.attributes,
        segments: [{ id: segmentId }]
      })
    );
    if (created.error) throw new Error(`Could not create contact: ${created.error.message}`);
    return { outcome: "created" };
  },
  async updateContactAttributes(email, attributes) {
    const resend = client2();
    await ensureProperties(resend, Object.keys(attributes));
    const existing = await getContact(resend, email);
    if (!existing) return false;
    const res = await retry(
      "contacts.update(attributes)",
      () => resend.contacts.update({ email, properties: attributes })
    );
    if (res.error) throw new Error(`Could not update status: ${res.error.message}`);
    return true;
  },
  async listAudienceContacts(audience, limit) {
    const resend = client2();
    const segmentId = await resolveSegmentId(resend, audience);
    const capped = Math.min(Math.max(limit, 1), 100);
    const list = await retry(
      "contacts.list",
      () => resend.contacts.list({ segmentId, limit: capped })
    );
    if (list.error) throw new Error(`Could not list contacts: ${list.error.message}`);
    const rows = list.data?.data ?? [];
    const contacts = [];
    const CONCURRENCY = 3;
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const batch = rows.slice(i, i + CONCURRENCY);
      const details = await Promise.all(
        batch.map(async (row) => {
          const full = await getContact(resend, row.email);
          return toAudienceContact2(full ?? row);
        })
      );
      contacts.push(...details);
    }
    return { contacts, hasMore: Boolean(list.data?.has_more) };
  }
};

// src/lib/email/index.server.ts
var PROVIDERS = {
  faga: fagaProvider,
  // Keep the old selector working while deployed environments migrate to EMAIL_PROVIDER=faga.
  pulseassist: fagaProvider,
  resend: resendProvider
};
var DEFAULT_PROVIDER = "faga";
function configuredProviderName() {
  const raw = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (!raw) return DEFAULT_PROVIDER;
  if (raw in PROVIDERS) return raw;
  throw new EmailProviderConfigError(
    `EMAIL_PROVIDER="${raw}" is not a known provider. Use one of: ${Object.keys(PROVIDERS).join(", ")}.`
  );
}
function emailProvider() {
  return PROVIDERS[configuredProviderName()];
}

// src/lib/email/senders.ts
var DEFAULT_SENDING_DOMAIN = "enicehq.com";
function sendingDomain() {
  return process.env.EMAIL_FROM_DOMAIN?.trim() || DEFAULT_SENDING_DOMAIN;
}
function groupSender() {
  return { name: "ENICE Group", localPart: "corporate", domain: sendingDomain() };
}

// api-src/waitlist.ts
var MIN_FILL_MS = 2500;
var UNAVAILABLE = "The waitlist is not available right now. Please email corporate@enicehq.com.";
function readField(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function readInterests(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v) => typeof v === "string"))].slice(0, 20);
}
function receiptText(name) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  return [
    `You are on the PulsePay waitlist, ${firstName}.`,
    "",
    "Thank you for your interest. We will write to this address when PulsePay opens, with early",
    "access details and the next steps. There is nothing to pay and nothing more you need to do.",
    "",
    "You agreed to hear from us about the PulsePay launch. If you change your mind, reply to this",
    "email and we will remove you.",
    "",
    "ENICE Group"
  ].join("\n");
}
function receiptHtml(name) {
  const firstName = escapeHtml(name.split(/\s+/)[0] || "there");
  return `<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;">
  <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#0048ed;font-weight:700;">ENICE Group</p>
  <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">You are on the PulsePay waitlist, ${firstName}.</h1>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111827;">
    Thank you for your interest. We will write to this address when PulsePay opens, with early
    access details and the next steps. There is nothing to pay and nothing more you need to do.
  </p>
  <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
    You agreed to hear from us about the PulsePay launch. If you change your mind, reply to this
    email and we will remove you.
  </p>
</body></html>`;
}
async function handler(req, res) {
  const ref = errorRef("waitlist");
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }
  const body = parseJsonBody(req.body);
  if (readField(body.website, 200)) {
    res.status(200).json({ ok: true, status: "joined" });
    return;
  }
  const startedAt = typeof body.startedAt === "number" ? body.startedAt : 0;
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    res.status(400).json({ ok: false, error: "Please take a moment and submit the form again." });
    return;
  }
  const fields = {
    name: readField(body.name, WAITLIST_LIMITS.name),
    email: readField(body.email, WAITLIST_LIMITS.email),
    phone: readField(body.phone, WAITLIST_LIMITS.phone),
    interests: readInterests(body.interests),
    consent: body.consent === true,
    source: readField(body.source, 200) || "waitlist"
  };
  const errors = validateWaitlist(fields);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ ok: false, error: Object.values(errors)[0], fields: errors });
    return;
  }
  if (!isDatabaseConfigured()) {
    console.error(`[api/waitlist:${ref}] DATABASE_URL is not set`);
    res.status(503).json({ ok: false, error: UNAVAILABLE });
    return;
  }
  let outcome;
  try {
    await ensureMigrated();
    const ip = await consumeRateLimit(`waitlist:ip:${clientIp(req)}`, 20, 10 * 60 * 1e3);
    const addr = await consumeRateLimit(
      `waitlist:email:${fields.email.toLowerCase()}`,
      5,
      24 * 60 * 60 * 1e3
    );
    if (ip.limited || addr.limited) {
      res.status(429).json({ ok: false, error: "Too many attempts. Please try again later." });
      return;
    }
    outcome = await joinWaitlist({ ...fields, phone: normalizePhone(fields.phone) });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      res.status(503).json({ ok: false, error: UNAVAILABLE });
      return;
    }
    console.error(`[api/waitlist:${ref}] could not record the signup:`, error);
    res.status(502).json({
      ok: false,
      error: "We could not save your details right now. Please try again in a moment.",
      ref
    });
    return;
  }
  try {
    const provider = emailProvider();
    if (outcome === "joined") {
      await provider.send({
        from: groupSender(),
        to: fields.email,
        subject: "You are on the PulsePay waitlist",
        html: receiptHtml(fields.name),
        text: receiptText(fields.name),
        headers: AUTO_REPLY_HEADERS,
        idempotencyKey: `waitlist-receipt-${ref}`
      });
    }
  } catch (error) {
    if (error instanceof EmailProviderConfigError) {
      console.error(`[api/waitlist:${ref}] email provider is not configured:`, error.message);
    } else {
      console.error(`[api/waitlist:${ref}] mail failed after the signup was recorded:`, error);
    }
  }
  res.status(200).json({ ok: true, status: outcome });
}
export {
  handler as default
};
