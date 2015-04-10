(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "babel-runtime/helpers/class-call-check", "babel-runtime/helpers/create-class", "babel-runtime/core-js"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("babel-runtime/helpers/class-call-check"), require("babel-runtime/helpers/create-class"), require("babel-runtime/core-js"));
    }
})(function (exports, module, _babelRuntimeHelpersClassCallCheck, _babelRuntimeHelpersCreateClass, _babelRuntimeCoreJs) {
    "use strict";

    var _classCallCheck = _babelRuntimeHelpersClassCallCheck["default"];
    var _createClass = _babelRuntimeHelpersCreateClass["default"];
    var _core = _babelRuntimeCoreJs["default"];
    var events = _core.Symbol("@@events"),
        maxListeners = _core.Symbol("@@maxListeners");

    var EventEmitter = (function () {
        function EventEmitter(bindings) {
            var _this = this;

            _classCallCheck(this, EventEmitter);

            if (!this[events] || this[events] === _core.Object.getPrototypeOf(this)[events]) {
                this[events] = {};
            }

            if (typeof bindings === "object") {
                for (var type in bindings) {
                    (function (type) {
                        var listeners = bindings[type];

                        if (Array.isArray(listeners)) {
                            listeners.forEach(function (listener) {
                                return _this.on(type, listener);
                            });
                        } else {
                            _this.on(type, listeners);
                        }
                    })(type);
                }
            }

            this[maxListeners] = this[maxListeners] || undefined;
        }

        _createClass(EventEmitter, {
            allOff: {
                value: function allOff(type) {
                    var _this = this;

                    var handler;

                    if (!this[events]) {
                        return this;
                    }

                    if (!this[events].removeListener) {
                        if (arguments.length === 0) {
                            this[events] = {};
                        } else if (this[events][type]) {
                            delete this[events][type];
                        }

                        return this;
                    }

                    if (arguments.length === 0) {
                        for (var key in this[events]) {
                            if (key === "removeListener") {
                                continue;
                            }

                            this.allOff(type);
                        }

                        this.allOff("removeListener");

                        this[events] = {};

                        return this;
                    }

                    handler = this[events][type];

                    if (typeof handler === "function") {
                        this.off(type, handler);
                    } else if (Array.isArray(handler)) {
                        handler.forEach(function (listener) {
                            return _this.off(type, listener);
                        });
                    }

                    delete this[events][type];

                    return this;
                }
            },
            emit: {
                value: function emit(type) {
                    var args, handler, length;

                    if (!this[events]) {
                        this[events] = {};
                    }

                    if (type === "error" && !this[events].error) {
                        var error = arguments[1];

                        if (error instanceof Error) {
                            throw error;
                        } else {
                            throw Error("Uncaught, unspecified \"error\" event.");
                        }

                        return false;
                    }

                    handler = this[events][type];

                    if (typeof handler === "undefined") {
                        return false;
                    }

                    if (typeof handler === "function") {
                        switch (arguments.length) {
                            case 1:
                                handler.call(this);
                                break;
                            case 2:
                                handler.call(this, arguments[1]);
                                break;
                            case 3:
                                handler.call(this, arguments[1], arguments[2]);
                                break;
                            default:
                                length = arguments.length;
                                args = new Array(length - 1);
                                for (var i = 1; i < length; i++) {
                                    args[i - 1] = arguments[i];
                                }
                                handler.apply(this, args);
                        }
                    } else if (Array.isArray(handler)) {
                        var listeners = undefined;

                        length = arguments.length;
                        args = new Array(length - 1);

                        for (var i = 1; i < length; i++) {
                            args[i - 1] = arguments[i];
                        }

                        listeners = handler.slice();
                        length = listeners.length;

                        for (var i = 0; i < length; i++) {
                            listeners[i].apply(this, args);
                        }
                    }

                    return true;
                }
            },
            trigger: {
                value: function trigger(type, args) {
                    args.unshift(type);
                    return this.emit.apply(this, args);
                }
            },
            listeners: {
                value: (function (_listeners) {
                    var _listenersWrapper = function listeners(_x) {
                        return _listeners.apply(this, arguments);
                    };

                    _listenersWrapper.toString = function () {
                        return _listeners.toString();
                    };

                    return _listenersWrapper;
                })(function (type) {
                    var listeners;

                    if (!this[events] || !this[events][type]) {
                        listeners = [];
                    } else if (typeof this[events][type] === "function") {
                        listeners = [this[events][type]];
                    } else {
                        listeners = this[events][type].slice();
                    }

                    return listeners;
                })
            },
            many: {
                value: function many(type, times, listener) {
                    if (typeof times !== "number") {
                        throw new TypeError("times must be a number");
                    }

                    if (typeof listener !== "function") {
                        throw new TypeError("listener must be a function");
                    }

                    function manyListener() {
                        if (--times === 0) {
                            this.off(type, manyListener);
                        }
                        listener.apply(this, arguments);
                    }

                    manyListener.listener = listener;

                    this.on(type, manyListener);

                    return this;
                }
            },
            off: {
                value: function off(type, listener) {
                    var handler, index;

                    if (typeof listener !== "function") {
                        throw new TypeError("listener must be a function");
                    }

                    if (!this[events] || !this[events][type]) {
                        return this;
                    }

                    handler = this[events][type];
                    index = -1;

                    if (handler === listener || typeof handler.listener === "function" && handler.listener === listener) {
                        delete this[events][type];
                        if (this[events].removeListener) {
                            this.emit("removeListener", type, listener);
                        }
                    } else if (Array.isArray(handler)) {
                        for (var i = handler.length; i-- > 0;) {
                            if (handler[i] === listener || handler[i].listener && handler[i].listener === listener) {
                                index = i;
                                break;
                            }
                        }
                    }

                    if (index < 0) {
                        return this;
                    }

                    if (handler.length === 1) {
                        handler.length = 0;
                        delete this[events][type];
                    } else {
                        handler.splice(index, 1);
                    }

                    if (this[events].removeListener) {
                        this.emit("removeListener", type, listener);
                    }

                    return this;
                }
            },
            on: {
                value: function on(type, listener) {
                    if (typeof listener !== "function") {
                        throw new TypeError("listener must be a function");
                    }

                    if (!this[events]) {
                        this[events] = {};
                    }

                    if (this[events].newListener) {
                        this.emit("newListener", type, typeof listener.listener === "function" ? listener.listener : listener);
                    }

                    // Single listener
                    if (!this[events][type]) {
                        this[events][type] = listener;

                        // Multiple listeners
                    } else if (Array.isArray(this[events][type])) {
                        this[events][type].push(listener);

                        // Transition from single to multiple listeners
                    } else {
                        this[events][type] = [this[events][type], listener];
                    }

                    if (Array.isArray(this[events][type]) && !this[events][type].warned) {
                        var max = typeof this[maxListeners] !== "undefined" ? this[maxListeners] : EventEmitter.defaultMaxListeners;

                        if (max && max > 0 && this[events][type].length > max) {
                            this.emit("maxListeners", type, listener);
                            this[events][type].warned = true;
                        }
                    }

                    return this;
                }
            },
            once: {
                value: function once(type, listener) {
                    return this.many(type, 1, listener);
                }
            },
            setMaxListeners: {
                value: function setMaxListeners(n) {
                    if (typeof n !== "number" || n < 0 || isNaN(n)) {
                        throw TypeError("n must be a positive number");
                    }

                    this[maxListeners] = n;

                    return this;
                }
            }
        }, {
            listenerCount: {
                value: function listenerCount(emitter, type) {
                    var count;

                    // Empty
                    if (!emitter[events] || !emitter[events][type]) {
                        count = 0;

                        // Function
                    } else if (typeof emitter[events][type] === "function") {
                        count = 1;

                        // Array
                    } else {
                        count = emitter[events][type].length;
                    }

                    return count;
                }
            }
        });

        return EventEmitter;
    })();

    module.exports = EventEmitter;

    EventEmitter.defaultMaxListeners = 10;

    // Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    // Aliases
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prototype.addManyListener = EventEmitter.prototype.many;
    EventEmitter.prototype.addOnceListener = EventEmitter.prototype.once;
    EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.allOff;
    EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
});