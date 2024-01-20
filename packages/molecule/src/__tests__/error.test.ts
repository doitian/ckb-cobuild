import { CodecIssue } from "..";

test("collectMessages", () => {
  const issue = CodecIssue.create("Root", [
    ["child1", CodecIssue.create("Child 1")],
    [
      "child2",
      CodecIssue.create("Child 2", [
        ["child3", CodecIssue.create("Child 3")],
        // empty message are ignored
        ["child4", CodecIssue.create()],
      ]),
    ],
    [
      "child5",
      CodecIssue.create().addChildren([
        ["child6", CodecIssue.create("Child 6")],
      ]),
    ],
  ]);

  const messages = issue.collectMessages();
  expect(messages).toEqual([
    "//: Root",
    "//child1: Child 1",
    "//child2: Child 2",
    "//child2/child3: Child 3",
    "//child5/child6: Child 6",
  ]);
});
