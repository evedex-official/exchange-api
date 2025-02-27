import { src } from "../../common";
import assert from "assert";

enum TestEnum {
  A = "a",
  B = "b",
}

describe("serializeQueryParams", () => {
  it("should serialize simple query params", () => {
    assert.equal(
      src.utils.serializeQueryParams({
        str: "foo",
        int: 1,
        float: 1.1,
        true: true,
        false: false,
        enum: TestEnum.A,
        null: null,
      }),
      "str=foo&int=1&float=1.1&true=true&false=false&enum=a&null=null",
    );
  });

  it("should serialize array query params", () => {
    assert.equal(
      src.utils.serializeQueryParams({
        el: [TestEnum.A, TestEnum.B],
      }),
      "el=a&el=b",
    );
  });
});
