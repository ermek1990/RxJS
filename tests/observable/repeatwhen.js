(function () {
  'use strict';
  /* jshint undef: true, unused: true */
  /* globals QUnit, test, Rx */
  QUnit.module('repeatWhen');

  var Observable = Rx.Observable,
    TestScheduler = Rx.TestScheduler,
    onNext = Rx.ReactiveTest.onNext,
    onError = Rx.ReactiveTest.onError,
    onCompleted = Rx.ReactiveTest.onCompleted,
    subscribe = Rx.ReactiveTest.subscribe;

  test('repeatWhen never', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createHotObservable(
      onNext(150, 1),
      onCompleted(250)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function () {
        return Observable.empty(scheduler);
      });
    });

    results.messages.assertEqual(
      onCompleted(250)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 250)
    );
  });

  test('repeatWhen Observable never', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createHotObservable(
      onNext(150, 1),
      onNext(210, 2),
      onNext(220, 3),
      onNext(230, 4),
      onNext(240, 5),
      onCompleted(250)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function () {
        return Observable.never();
      });
    });

    results.messages.assertEqual(
      onNext(210, 2),
      onNext(220, 3),
      onNext(230, 4),
      onNext(240, 5)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 250)
    );
  });

  test('repeatWhen Observable never complete', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createHotObservable(
      onNext(150, 1),
      onNext(210, 2),
      onNext(220, 3),
      onNext(230, 4),
      onNext(240, 5),
      onCompleted(250)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function () {
        return Observable.never();
      });
    });

    results.messages.assertEqual(
      onNext(210, 2),
      onNext(220, 3),
      onNext(230, 4),
      onNext(240, 5)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 250)
    );
  });

  test('repeatWhen Observable Empty', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createColdObservable(
      onNext(100, 1),
      onNext(150, 2),
      onNext(200, 3),
      onCompleted(250)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function() {
        return Observable.empty(scheduler);
      });
    });

    results.messages.assertEqual(
      onNext(300, 1),
      onNext(350, 2),
      onNext(400, 3),
      onCompleted(450)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 450)
    );
  });

  test('repeatWhen Observable Next Error', function () {
    var error = new Error();

    var scheduler = new TestScheduler();

    var xs = scheduler.createColdObservable(
      onNext(10, 1),
      onNext(20, 2),
      onError(30, error),
      onCompleted(40)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function(attempts) {
        return attempts.scan(function(count) {
          if(++count === 2) {
            throw error;
          }
          return count;
        }, 0); // returning any nexting observable should cause a continue
      });
    });

    results.messages.assertEqual(
      onNext(210, 1),
      onNext(220, 2),
      onError(230, error)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 230)
    );
  });

  test('repeatWhen Observable complete', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createColdObservable(
      onNext(10, 1),
      onNext(20, 2),
      onCompleted(30)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function() {
        return Observable.empty(scheduler); // a completing observable completes
      });
    });

    results.messages.assertEqual(
      onNext(210, 1),
      onNext(220, 2),
      onCompleted(230)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 230)
    );
  });

  test('repeatWhen Observable next complete', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createColdObservable(
      onNext(10, 1),
      onNext(20, 2),
      onCompleted(30)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function(attempts) {
        return attempts.scan(function(count) {
          return count + 1;
        }, 0).takeWhile(function(count) {
          return count < 2;
        }); // returning any nexting observable should cause a continue
      });
    });

    results.messages.assertEqual(
      onNext(210, 1),
      onNext(220, 2),
      onNext(240, 1),
      onNext(250, 2),
      onCompleted(260)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 230),
      subscribe(230, 260)
    );
  });

  test('repeatWhen Observable infinite', function () {
    var scheduler = new TestScheduler();

    var xs = scheduler.createColdObservable(
      onNext(10, 1),
      onNext(20, 2),
      onCompleted(30)
    );

    var results = scheduler.startScheduler(function () {
      return xs.repeatWhen(function(){
        return Observable.never();
      });
    });

    results.messages.assertEqual(
      onNext(210, 1),
      onNext(220, 2)
    );

    xs.subscriptions.assertEqual(
      subscribe(200, 230)
    );
  });

}());
