'use strict';

const chai = require( 'chai' ),
    chai_as_promised = require( 'chai-as-promised' ),
    sinon = require( 'sinon' ),
    sinon_chai = require( 'sinon-chai' ),
    Emitter = require( '../dist/emitter-umd' ).default,
    
    expect = chai.expect;

chai.use( sinon_chai );
chai.use( chai_as_promised );


describe( 'Emitter', () => {
    
    it( 'should be a function', () => {
        expect( Emitter ).to.be.a( 'function' );
    } );
    
    it( 'should have static functions and properties', () => {
        expect( Emitter.every ).to.be.a( 'string' );
        expect( Emitter.defaultMaxListeners ).to.be.a( 'number' );
        expect( Emitter.version ).to.be.a( 'string' );
    } );

    describe( 'as a constructor', () => {
        
        it( 'should have a prototype', () => {
            expect( Emitter.prototype ).to.be.an( 'object' );
            expect( Emitter.prototype.constructor ).to.be.a( 'function' );
        } );
    
        it( 'should create instances', () => {
            let emitter = new Emitter();
            expect( typeof emitter ).to.equal( 'object' );
            expect( emitter ).to.be.an.instanceof( Emitter );
        } );
    
        describe( 'emitter', () => {
            let emitter;
    
            beforeEach( () => emitter = new Emitter() );
            
            afterEach( () => {
                emitter.destroy();
                emitter = undefined;
            } );
    
            it( 'should have functions and properties', () => {
                expect( emitter.clear ).to.be.a( 'function' );
                expect( emitter.destroy ).to.be.a( 'function' );
                expect( emitter.emit ).to.be.a( 'function' );
                expect( emitter.eventTypes ).to.be.a( 'function' );
                expect( emitter.first ).to.be.a( 'function' );
                expect( emitter.getMaxListeners ).to.be.a( 'function' );
                expect( emitter.listenerCount ).to.be.a( 'function' );
                expect( emitter.listeners ).to.be.a( 'function' );
                expect( emitter.many ).to.be.a( 'function' );
                expect( emitter.off ).to.be.a( 'function' );
                expect( emitter.on ).to.be.a( 'function' );
                expect( emitter.once ).to.be.a( 'function' );
                expect( emitter.setMaxListeners ).to.be.a( 'function' );
                expect( emitter.tick ).to.be.a( 'function' );
                expect( emitter.toJSON ).to.be.a( 'function' );
                expect( emitter.toString ).to.be.a( 'function' );
                expect( emitter.trigger ).to.be.a( 'function' );
                expect( emitter.until ).to.be.a( 'function' );
                expect( emitter.maxListeners ).to.be.a( 'number' );
            } );
    
            it( 'should provide event subscription', () => {
                let events = [],
                    listeners = [],
    
                    onFoo = sinon.spy(),
                    onFooToo = sinon.spy(),
                    onFooFirst = sinon.spy(),
                    onBar = sinon.spy();
    
                emitter.on( ':on', ( event, listener ) => {
                    events.push( event );
                    listeners.push( listener );
                } );
    
                emitter.on( 'foo', onFoo );
                
                emitter.on( {
                    'foo': onFooToo,
                    'bar': onBar
                } );
    
                emitter.emit( 'foo' );
                emitter.emit( 'bar' );
    
                expect( onFoo ).to.have.been.calledOnce;
                expect( onFooToo ).to.have.been.calledOnce;
                expect( onBar ).to.have.been.calledOnce;
    
                expect( events ).to.deep.equal( [ 'foo', 'foo', 'bar' ] );
                expect( listeners ).to.deep.equal( [ onFoo, onFooToo, onBar ] );
    
                expect( emitter.listeners( 'foo' )[ 0 ] ).to.equal( onFoo );
                expect( emitter.listeners( 'foo' )[ 1 ] ).to.equal( onFooToo );
    
                expect( () => emitter.on( 'foo' ) ).to.throw( TypeError );
                
                emitter.first( 'foo', onFooFirst );
                
                expect( emitter.listeners( 'foo' )[ 0 ] ).to.equal( onFooFirst );
                expect( emitter.listeners( 'foo' )[ 1 ] ).to.equal( onFoo );
                expect( emitter.listeners( 'foo' )[ 2 ] ).to.equal( onFooToo );
                
                expect( () => emitter.first( 'foo' ) ).to.throw( TypeError );
            } );
            
            it( 'should provide event subscription at construction time', () => {
                let events = [],
                    listeners = [],
    
                    onFoo = sinon.spy(),
                    onFooToo = sinon.spy(),
                    onBar = sinon.spy();
                
                emitter = new Emitter( {
                    ':on': ( event, listener ) => {
                        events.push( event );
                        listeners.push( listener );
                    },
                    'foo': [ onFoo, onFooToo ],
                    'bar': onBar
                } );
    
                emitter.emit( 'foo' );
                emitter.emit( 'bar' );
    
                expect( onFoo ).to.have.been.calledOnce;
                expect( onFooToo ).to.have.been.calledOnce;
                expect( onBar ).to.have.been.calledOnce;
    
                expect( events ).to.deep.equal( [ 'foo', 'foo', 'bar' ] );
                expect( listeners ).to.deep.equal( [ onFoo, onFooToo, onBar ] );
    
                expect( emitter.listeners( 'foo' )[ 0 ] ).to.equal( onFoo );
                expect( emitter.listeners( 'foo' )[ 1 ] ).to.equal( onFooToo );
    
                expect( () => emitter.on( 'foo' ) ).to.throw( TypeError );
            } );
    
            it( 'should support namespaced event types', () => {
                 let onFoo = sinon.spy(),
                    onBar = sinon.spy(),
                    onQux = sinon.spy();
    
                emitter.on( 'foo', onFoo );
                emitter.on( 'foo:bar', onBar );
                emitter.on( 'foo:bar:qux', onQux );
                
                emitter.emit( 'foo:bar:qux', 1, 2, 3 );
                
                expect( onFoo ).to.have.been.calledWith( 1, 2, 3 );
                expect( onBar ).to.have.been.calledWith( 1, 2, 3 );
                expect( onQux ).to.have.been.calledWith( 1, 2, 3 );
                
                emitter.trigger( 'foo:bar:qux', [ 4, 5, 6 ] );
                
                expect( onFoo ).to.have.been.calledWith( 4, 5, 6 );
                expect( onBar ).to.have.been.calledWith( 4, 5, 6 );
                expect( onQux ).to.have.been.calledWith( 4, 5, 6 );
                
                expect( onFoo ).to.have.been.calledTwice;
                expect( onBar ).to.have.been.calledTwice;
                expect( onQux ).to.have.been.calledTwice;
            } );
    
            it( 'should emit events differently based on the number of arguments', () => {
                let test = Symbol( '@@test' ),
                    onEmit = sinon.spy();
    
                emitter.on( 'test', onEmit );
                emitter.on( test, onEmit );
    
                emitter.emit( 'test' );
                emitter.emit( 'test', 0 );
                emitter.emit( 'test', 1, 2 );
                emitter.emit( 'test', 3, 4, 5 );
                emitter.trigger( 'test', [  6, 7, 8, 9 ] );
                emitter.emit( test );
    
                expect( onEmit ).to.have.been.calledWith();
                expect( onEmit ).to.have.been.calledWith( 0 );
                expect( onEmit ).to.have.been.calledWith( 1, 2 );
                expect( onEmit ).to.have.been.calledWith( 3, 4, 5 );
                expect( onEmit ).to.have.been.calledWith( 6, 7, 8, 9 );
                expect( onEmit ).to.have.callCount( 6 );
    
                expect( () => emitter.emit( 'error' ) ).to.throw( Error );
                expect( () => emitter.emit( 'error', new Error( 'test error' ) ) ).to.throw( Error );
            } );

            it( 'should emit own events only', () => {
                const getHuman = parent => {
                        function Human(){}
                        Human.prototype = parent || emitter;
                        Emitter( Human.prototype );
                        return new Human();
                      },
                      onEmit = sinon.spy(), 
                      parent = getHuman();

                parent.child = getHuman( parent );
                
                expect( parent.clear ).to.be.a( 'function' );
                expect( parent.emit ).to.be.a( 'function' );
                expect( parent.eventTypes ).to.be.a( 'function' );
                expect( parent.first ).to.be.a( 'function' );
                expect( parent.getMaxListeners ).to.be.a( 'function' );
                expect( parent.listenerCount ).to.be.a( 'function' );
                expect( parent.listeners ).to.be.a( 'function' );
                expect( parent.many ).to.be.a( 'function' );
                expect( parent.off ).to.be.a( 'function' );
                expect( parent.on ).to.be.a( 'function' );
                expect( parent.once ).to.be.a( 'function' );
                expect( parent.setMaxListeners ).to.be.a( 'function' );
                expect( parent.trigger ).to.be.a( 'function' );
                expect( parent.until ).to.be.a( 'function' );

                expect( parent.child.clear ).to.be.a( 'function' );
                expect( parent.child.emit ).to.be.a( 'function' );
                expect( parent.child.eventTypes ).to.be.a( 'function' );
                expect( parent.child.first ).to.be.a( 'function' );
                expect( parent.child.getMaxListeners ).to.be.a( 'function' );
                expect( parent.child.listenerCount ).to.be.a( 'function' );
                expect( parent.child.listeners ).to.be.a( 'function' );
                expect( parent.child.many ).to.be.a( 'function' );
                expect( parent.child.off ).to.be.a( 'function' );
                expect( parent.child.on ).to.be.a( 'function' );
                expect( parent.child.once ).to.be.a( 'function' );
                expect( parent.child.setMaxListeners ).to.be.a( 'function' );
                expect( parent.child.trigger ).to.be.a( 'function' );
                expect( parent.child.until ).to.be.a( 'function' );

                parent.on( 'test', onEmit );
                
                parent.emit( 'test', 1 );
                expect( onEmit ).to.have.been.calledWith( 1 );

                parent.child.emit( 'test', 2 );            
                expect( onEmit ).to.not.have.been.calledWith( 2 );
            } );
            
            it( 'should catch errors in bad listeners', () => {
                let onEmit = sinon.spy(),
                    onError = sinon.spy(),
                    badListenerError = new Error( 'Bad listener' );
                    
                emitter.on( 'test', () => {
                    throw badListenerError;
                } );
                emitter.on( 'test', onEmit );
                
                emitter.on( 'error', onError );
                
                emitter.emit( 'test' );
                
                expect( onError ).to.have.been.calledOnce;
                expect( onError ).to.have.been.calledWith( badListenerError );
                expect( onEmit ).to.have.been.calledOnce;
                
                emitter.off( 'error', onError );
                
                expect( () => emitter.emit( 'test' ) ).to.throw( badListenerError );
                expect( onEmit ).to.have.been.calledTwice;
            } );
            
            it( 'should provide asynchronous event emission', () => {
                let onEmit = sinon.spy();
    
                emitter.on( 'test', onEmit );
    
                expect( emitter.tick( 'test', 1, 2, 3 ) ).to.be.fulfilled;
                expect( emitter.tick( 'none', 4, 5, 6 ) ).to.be.rejected;
            } );
    
            it( 'should provide a way to unsubscribe', () => {
                let onAll       = sinon.spy(),
                    onEmit      = sinon.spy(),
                    onEmitToo   = sinon.spy(),
                    onOff       = sinon.spy();
    
                emitter.on( ':off', onOff );
                
                emitter.on( 'test', onEmit );
                emitter.on( 'test', onEmitToo );
                
                emitter.on( onAll );
    
                emitter.emit( 'test', 1, 2, 3 );
                emitter.off( 'test', onEmit );
                emitter.emit( 'test', 4, 5, 6 );
                emitter.off( 'test', onEmitToo );
                
                emitter.off( onAll );
                
                emitter.off( 'undefined', onEmit );
    
                expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
                expect( onEmit ).to.have.been.calledOnce;
                
                expect( onEmitToo ).to.have.been.calledWith( 1, 2, 3 );
                expect( onEmitToo ).to.have.been.calledWith( 4, 5, 6 );
                expect( onEmitToo ).to.have.been.calledTwice;
                
                expect( () => emitter.off( 'test' ) ).to.throw( TypeError );
                
                expect( onOff ).to.have.been.calledWith( 'test', onEmit );
                expect( onOff ).to.have.been.calledWith( 'test', onEmitToo );
                expect( onOff ).to.have.been.calledThrice;
            } );
    
            it( 'should provide one-time event subscription', () => {
                let onEmit = sinon.spy();
    
                emitter.once( 'test', onEmit );
    
                emitter.emit( 'test', 1, 2, 3 );
                emitter.emit( 'test', 4, 5, 6 );
    
                expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
                expect( onEmit ).to.have.been.calledOnce;
    
                expect( () => emitter.once( 'test' ) ).to.throw( TypeError );
            } );
    
            it( 'should provide many-time event subscription', () => {
                let onEmit = sinon.spy();
    
                emitter.many( 'test', 2, onEmit );
                
                emitter.emit( 'test', 1, 2, 3 );
                emitter.emit( 'test', 4, 5, 6 );
                emitter.emit( 'test', 7, 8, 9 );
    
                expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
                expect( onEmit ).to.have.been.calledWith( 4, 5, 6 );
                expect( onEmit ).to.have.been.calledTwice;
    
                expect( () => emitter.many( 'test', 2 ) ).to.throw( TypeError );
                expect( () => emitter.many( 'test' ) ).to.throw( TypeError );
            } );
            
            it( 'should allow unsubscribing early from a many-time event', () => {
                let onEmit = sinon.spy();
    
                emitter.many( 'test', 5, onEmit );
    
                emitter.emit( 'test', 1, 2 );
                emitter.emit( 'test', 3, 4 );
                emitter.emit( 'test', 5, 6 );
                
                emitter.off( 'test', onEmit );
                
                emitter.emit( 'test', 7, 8 );
                emitter.emit( 'test', 9, 0 );
    
                expect( onEmit ).to.have.been.calledThrice;
            } );
            
            it( 'should provide conditional event subscription', () => {
                let onEmit = sinon.spy();
    
                emitter.until( 'test', ( first, second, third ) => {
                    onEmit( first, second, third );
                    return third === 6;
                } );
    
                emitter.emit( 'test', 1, 2, 3 );
                emitter.emit( 'test', 4, 5, 6 );
                emitter.emit( 'test', 7, 8, 9 );
    
                expect( onEmit ).to.have.been.calledWith( 1, 2, 3 );
                expect( onEmit ).to.have.been.calledWith( 4, 5, 6 );
                expect( onEmit ).to.have.been.calledTwice;
                
                let count = 0;
                onEmit = sinon.spy();
                
                emitter.until( () => {
                    onEmit();
                    return ++count === 2;
                } );
                
                emitter.emit( 'foo' );
                emitter.emit( 'bar' );
                emitter.emit( 'baz' );
                
                expect( onEmit ).to.have.been.calledTwice;
    
                expect( () => emitter.until( 'test' ) ).to.throw( TypeError );
            } );
            
            it( 'should provide a way to listen to every event', () => {
                const
                    atEmit = sinon.spy(),
                    onEmit = sinon.spy(),
                    onceEmit = sinon.spy(),
                    firstEmit = sinon.spy(),
                    manyEmit = sinon.spy();
                
                emitter.many( 2, manyEmit );
                emitter.many( Emitter.every, 2, manyEmit );
                emitter.many( undefined, 2, manyEmit );
                
                emitter.on( onEmit );
                emitter.on( Emitter.every, onEmit );
                emitter.on( undefined, onEmit );
                
                emitter.at( 1, atEmit );
                emitter.at( Emitter.every, 1, atEmit );
                emitter.at( undefined, 1, atEmit );
                
                emitter.first( firstEmit );
                emitter.first( Emitter.every, firstEmit );
                emitter.first( undefined, firstEmit );

                emitter.once( onceEmit );
                emitter.once( Emitter.every, onceEmit );
                emitter.once( undefined, onceEmit );
                
                emitter.emit( 'foo' );
                emitter.emit( 'bar' );
                
                emitter.clear( Emitter.every );
                
                emitter.emit( 'qux' );
                
                expect( atEmit ).to.have.callCount( 6 );
                expect( firstEmit ).to.have.callCount( 6 );
                expect( manyEmit ).to.have.callCount( 6 );
                expect( onEmit ).to.have.callCount( 6 );
                expect( onceEmit ).to.have.callCount( 3 );
            } );
    
            it( 'should emit events when listeners are added and removed', () => {
                let noop = function(){},
    
                    onNewListener = sinon.spy(),
                    onRemoveListener = sinon.spy();
    
                emitter.on( ':on', onNewListener );
                emitter.on( ':off', onRemoveListener );
    
                emitter.once( 'test', noop );
    
                emitter.emit( 'test' );
    
                expect( onNewListener ).to.have.been.calledWith( 'test' );
                expect( onNewListener ).to.have.been.calledWith( ':off' );
                expect( onNewListener ).to.have.been.calledTwice;
    
                expect( onRemoveListener ).to.have.been.calledWith( 'test' );
                expect( onRemoveListener ).to.have.been.calledOnce;
            } );
    
            it( 'should provide a listener count', () => {
                let noop = function(){};
    
                emitter.on( 'test', noop );
                emitter.on( 'test', noop );
    
                emitter.emit( 'empty' );
    
                expect( emitter.listenerCount( 'test' ) ).to.equal( 2 );
                expect( emitter.listenerCount( 'empty' ) ).to.equal( 0 );
                expect( emitter.listenerCount( 'undefined' ) ).to.equal( 0 );
            } );
    
            it( 'should limit the number of subscriptions', () => {
                let noop = function(){},
    
                    onMaxListeners = sinon.spy();
    
                emitter.on( ':maxListeners', onMaxListeners );
    
                // The default max listeners is 10
                emitter.on( 'test', noop ); // 1
                emitter.on( 'test', noop ); // 2
                emitter.on( 'test', noop ); // 3
                emitter.on( 'test', noop ); // 4
                emitter.on( 'test', noop ); // 5
                emitter.on( 'test', noop ); // 6
                emitter.on( 'test', noop ); // 7
                emitter.on( 'test', noop ); // 8
                emitter.on( 'test', noop ); // 9
                emitter.on( 'test', noop ); // 10
                emitter.on( 'test', noop ); // 11
    
                expect( onMaxListeners ).to.have.been.calledWith( 'test' );
                expect( onMaxListeners ).to.have.been.calledOnce;
            } );
    
            it( 'should set the maximum number of subscriptions', () => {
                let noop = function(){},
    
                    onMaxListeners = sinon.spy();
                
                emitter.setMaxListeners( 3 );
                
                expect( emitter.getMaxListeners() ).to.equal( 3 );
    
                emitter.maxListeners = 2;
                
                expect( emitter.getMaxListeners() ).to.equal( 2 );
    
                emitter.on( ':maxListeners', onMaxListeners );
    
                emitter.on( 'test', noop ); // 1
                emitter.on( 'test', noop ); // 2
                emitter.on( 'test', noop ); // 3
    
                expect( onMaxListeners ).to.have.been.calledWith( 'test' );
                expect( onMaxListeners ).to.have.been.calledOnce;
    
                expect( () => emitter.maxListeners = 'a' ).to.throw( TypeError );
            } );
            
            it( 'should provide a clean JSON and String representation', () => {
                let noop = function(){},
                    json, string;
    
                emitter.maxListeners = 5;
                emitter.on( 'test', noop );
                emitter.on( 'test', noop );
                
                json = emitter.toJSON();
                string = emitter.toString();
                
                // toJSON()
                expect( json ).to.have.property( 'maxListeners' );
                expect( json.maxListeners ).to.be.a( 'Number' );
                expect( json.maxListeners ).to.equal( 5 );
                expect( json ).to.have.property( 'listenerCount' );
                expect( json.listenerCount ).to.be.an( 'Object' );
                expect( json.listenerCount ).to.have.property( 'test' );
                expect( json.listenerCount.test ).to.be.a( 'Number' );
                
                // toString()
                expect( string ).to.match( /^Emitter {.+}$/ );
                expect( string ).to.match( /"test":2/ );
                expect( string ).to.match( /"maxListeners":5/ );
                
                emitter.destroy();
                
                json = emitter.toJSON();
                string = emitter.toString();
                
                expect( json ).to.equal( 'destroyed' );
                expect( string ).to.match( /^Emitter "destroyed"$/ );
            } );
    
            it( 'should provide listener count', () => {
                const noop = function(){};
                let count;
                
                count = emitter.listenerCount( 'test' );
                
                expect( count ).to.equal( 0 );
                expect( count ).to.equal( emitter.listeners( 'test' ).length );
    
                emitter.on( 'test', noop );
                count = emitter.listenerCount( 'test' );
                
                expect( count ).to.equal( 1 );
                expect( count ).to.equal( emitter.listeners( 'test' ).length );
                
                emitter.on( 'test', noop );
                count = emitter.listenerCount( 'test' );
                
                expect( count ).to.equal( 2 );
                expect( count ).to.equal( emitter.listeners( 'test' ).length );
                
                emitter.on( 'test', noop );
                count = emitter.listenerCount( 'test' );
                
                expect( count ).to.equal( 3 );
                expect( count ).to.equal( emitter.listeners( 'test' ).length );
                
                emitter.clear( 'test' );
                count = emitter.listenerCount( 'test' );
                
                expect( count ).to.equal( 0 );
                expect( count ).to.equal( emitter.listeners( 'test' ).length );
            } );
            
            it( 'should provide a list of event types', () => {
                const onEmit = sinon.spy();
                
                emitter.on( 'foo', onEmit );
                emitter.on( 'bar', onEmit );
                
                expect( emitter.eventTypes().length ).to.equal( 2 );
            } );
        } );
    } );
    
    describe( 'as a mixin', () => {
        let emitter;
        
        beforeEach( () => emitter = Object.create( null ) );
        
        afterEach( () => emitter = undefined );
        
        it( 'should mix in functionality to instances', () => {
            Emitter( emitter );
            
            expect( emitter.clear ).to.be.a( 'function' );
            expect( emitter.emit ).to.be.a( 'function' );
            expect( emitter.eventTypes ).to.be.a( 'function' );
            expect( emitter.first ).to.be.a( 'function' );
            expect( emitter.getMaxListeners ).to.be.a( 'function' );
            expect( emitter.listenerCount ).to.be.a( 'function' );
            expect( emitter.listeners ).to.be.a( 'function' );
            expect( emitter.many ).to.be.a( 'function' );
            expect( emitter.off ).to.be.a( 'function' );
            expect( emitter.on ).to.be.a( 'function' );
            expect( emitter.once ).to.be.a( 'function' );
            expect( emitter.setMaxListeners ).to.be.a( 'function' );
            expect( emitter.tick ).to.be.a( 'function' );
            expect( emitter.trigger ).to.be.a( 'function' );
            expect( emitter.until ).to.be.a( 'function' );
            
            let onEmit = sinon.spy();
            
            emitter.on( 'test', onEmit );
            emitter.emit( 'test', 123 );
            
            expect( onEmit ).to.have.been.calledWith( 123 );
        } );
        
        it( 'should mix in functionality to prototypes', () => {
            function Events(){}
            Events.prototype = emitter;
            Emitter( Events.prototype );
            
            const
                one = new Events(),
                two = new Events(),
                onEmit = sinon.spy();
            
            expect( one.clear ).to.be.a( 'function' );
            expect( one.emit ).to.be.a( 'function' );
            expect( one.eventTypes ).to.be.a( 'function' );
            expect( one.first ).to.be.a( 'function' );
            expect( one.getMaxListeners ).to.be.a( 'function' );
            expect( one.listenerCount ).to.be.a( 'function' );
            expect( one.listeners ).to.be.a( 'function' );
            expect( one.many ).to.be.a( 'function' );
            expect( one.off ).to.be.a( 'function' );
            expect( one.on ).to.be.a( 'function' );
            expect( one.once ).to.be.a( 'function' );
            expect( one.setMaxListeners ).to.be.a( 'function' );
            expect( one.trigger ).to.be.a( 'function' );
            expect( one.until ).to.be.a( 'function' );
            
            expect( two.clear ).to.be.a( 'function' );
            expect( two.emit ).to.be.a( 'function' );
            expect( two.eventTypes ).to.be.a( 'function' );
            expect( two.first ).to.be.a( 'function' );
            expect( two.getMaxListeners ).to.be.a( 'function' );
            expect( two.listenerCount ).to.be.a( 'function' );
            expect( two.listeners ).to.be.a( 'function' );
            expect( two.many ).to.be.a( 'function' );
            expect( two.off ).to.be.a( 'function' );
            expect( two.on ).to.be.a( 'function' );
            expect( two.once ).to.be.a( 'function' );
            expect( two.setMaxListeners ).to.be.a( 'function' );
            expect( two.trigger ).to.be.a( 'function' );
            expect( two.until ).to.be.a( 'function' );
            
            one.on( 'one', onEmit );
            two.on( 'two', onEmit );
            
            expect( one.listenerCount( 'one' ) ).to.equal( 1 );
            expect( one.listenerCount( 'two' ) ).to.equal( 0 );
            expect( two.listenerCount( 'one' ) ).to.equal( 0 );
            expect( two.listenerCount( 'two' ) ).to.equal( 1 );
        } );
        
        it( 'should mix in selected functionality', () => {
            Emitter( 'emit on once off', emitter );
            
            expect( emitter.clear ).to.be.undefined;
            expect( emitter.emit ).to.be.a( 'function' );
            expect( emitter.eventTypes ).to.be.undefined;
            expect( emitter.first ).to.be.undefined;
            expect( emitter.getMaxListeners ).to.be.undefined;
            expect( emitter.listenerCount ).to.be.undefined;
            expect( emitter.listeners ).to.be.undefined;
            expect( emitter.many ).to.be.undefined;
            expect( emitter.off ).to.be.a( 'function' );
            expect( emitter.on ).to.be.a( 'function' );
            expect( emitter.once ).to.be.a( 'function' );
            expect( emitter.setMaxListeners ).to.be.undefined;
            expect( emitter.trigger ).to.be.undefined;
            expect( emitter.until ).to.be.undefined;
            
            let onEmit = sinon.spy();
            
            emitter.on( 'test', onEmit );
            emitter.emit( 'test', 123 );
            
            expect( onEmit ).to.have.been.calledWith( 123 );
        } );
        
        it( 'should mix in mapped functionality', () => {
            Emitter( {
                fireEvent: 'emit',
                addEventListener: 'on',
                removeEventListener: 'off'
            }, emitter );
            
            expect( emitter.clear ).to.be.undefined;
            expect( emitter.emit ).to.be.undefined;
            expect( emitter.eventTypes ).to.be.undefined;
            expect( emitter.first ).to.be.undefined;
            expect( emitter.getMaxListeners ).to.be.undefined;
            expect( emitter.listenerCount ).to.be.undefined;
            expect( emitter.listeners ).to.be.undefined;
            expect( emitter.many ).to.be.undefined;
            expect( emitter.off ).to.be.undefined;
            expect( emitter.on ).to.be.undefined;
            expect( emitter.once ).to.be.undefined;
            expect( emitter.setMaxListeners ).to.be.undefined;
            expect( emitter.trigger ).to.be.undefined;
            expect( emitter.until ).to.be.undefined;
            expect( emitter.fireEvent ).to.be.a( 'function' );
            expect( emitter.addEventListener ).to.be.a( 'function' );
            expect( emitter.removeEventListener ).to.be.a( 'function' );
            
            let onEmit = sinon.spy();
            
            emitter.addEventListener( 'test', onEmit );
            emitter.fireEvent( 'test', 123 );
            
            expect( onEmit ).to.have.been.calledWith( 123 );
        } );
    } );

} );