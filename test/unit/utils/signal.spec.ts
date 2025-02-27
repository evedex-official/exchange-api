import { src } from "../../common";
import assert from "assert";

describe("signal", () => {
  it("should listen and trigger signal", () => {
    let triggered = 0;
    const signal = src.utils.signal(function (v: number) {
      triggered += v;
    });

    assert.equal(triggered, 0);
    signal(1);
    assert.equal(triggered, 1);
    signal(2);
    assert.equal(triggered, 3);
  });

  it("should add all listeners", () => {
    let triggered1 = 0;
    let triggered2 = 0;

    const signal = src.utils.signal();
    signal(function (v: number) {
      triggered1 += v;
    });
    signal(function (v: number) {
      triggered2 += v;
    });

    assert.equal(triggered1, 0);
    assert.equal(triggered2, 0);
    signal(1);
    assert.equal(triggered1, 1);
    assert.equal(triggered2, 1);
    signal(2);
    assert.equal(triggered1, 3);
    assert.equal(triggered2, 3);
  });

  it("should skip all listeners", () => {
    let triggered = 0;
    const signal = src.utils.signal(function (v: number) {
      triggered += v;
    });

    assert.equal(triggered, 0);
    signal(1);
    assert.equal(triggered, 1);

    signal(src.utils.SignalSkipAll);
    signal(1);
    assert.equal(triggered, 1);
  });
});
